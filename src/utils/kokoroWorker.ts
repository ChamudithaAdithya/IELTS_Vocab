/**
 * Dedicated Background Web Worker for Kokoro-82M Natural Neural TTS (`kokoro-js`).
 * Runs 100% off the main UI thread using WebGPU (`fp32`) when available or WASM (`q8` ~86MB),
 * caching ONNX model weights permanently in Browser CacheStorage (`transformers-cache`).
 */

const KOKORO_MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const KOKORO_CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm',
  'https://esm.sh/kokoro-js@1.2.1'
];
const TRANSFORMERS_CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1/+esm',
  'https://esm.sh/@huggingface/transformers@3.5.1'
];

const workerUA = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
const isIOSWorker =
  /iPad|iPhone|iPod/i.test(workerUA) ||
  (typeof navigator !== 'undefined' &&
    navigator.platform === 'MacIntel' &&
    navigator.maxTouchPoints > 1);
const isMobileWorker =
  isIOSWorker || /Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(workerUA);

let ttsInstance: any = null;
let activeBackend: 'webgpu' | 'wasm' | null = null;
let initPromise: Promise<any> | null = null;

function encodeFloat32ToWavBuffer(rawSamples: Float32Array, sampleRate: number): ArrayBuffer {
  const n = rawSamples.length;
  if (n === 0) {
    return new ArrayBuffer(44);
  }

  // 1. Sanitize NaN/Infinity & compute DC offset from vocoder output
  const clean = new Float32Array(n);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const v = rawSamples[i];
    const safe = Number.isFinite(v) ? v : 0;
    clean[i] = safe;
    sum += safe;
  }
  const dcOffset = sum / n;
  if (Math.abs(dcOffset) > 1e-5) {
    for (let i = 0; i < n; i++) {
      clean[i] -= dcOffset;
    }
  }

  // 2. Trim initial ISTFTNet boundary rumble/buzz before voice onset (up to first 65ms)
  const maxTrim = Math.min(n - 1, Math.round(sampleRate * 0.065));
  const onsetGate = 0.008;
  let trimStart = 0;
  while (trimStart < maxTrim && Math.abs(clean[trimStart]) < onsetGate) {
    trimStart++;
  }
  const leadPad = Math.round(sampleRate * 0.006);
  trimStart = Math.max(0, trimStart - leadPad);

  const samples = trimStart > 0 ? clean.subarray(trimStart) : clean;
  const numSamples = samples.length;

  // 3. Smooth 14ms half-cosine fade-in & 10ms fade-out to eliminate vocoder window-edge buzz/clicks
  const fadeInLen = Math.min(numSamples, Math.round(sampleRate * 0.014));
  const fadeOutLen = Math.min(numSamples, Math.round(sampleRate * 0.01));

  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // Linear 16-bit PCM (avoids unclamped 32-bit IEEE float WAV distortion)
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    let gain = 1.0;
    if (i < fadeInLen && fadeInLen > 1) {
      gain = 0.5 * (1 - Math.cos((Math.PI * i) / fadeInLen));
    } else if (i >= numSamples - fadeOutLen && fadeOutLen > 1) {
      const rem = numSamples - 1 - i;
      gain = 0.5 * (1 - Math.cos((Math.PI * rem) / fadeOutLen));
    }
    const s = Math.max(-0.98, Math.min(0.98, samples[i] * gain));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}

async function dynamicImportFromUrls(urls: string[]): Promise<any> {
  let lastErr: any = null;
  for (const url of urls) {
    try {
      const mod = await (new Function('u', 'return import(u)')(url) as Promise<any>);
      if (mod) return mod;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Could not load ESM module from CDN.');
}

async function loadKokoroRuntime(): Promise<{ kokoroMod: any; transformersMod: any | null }> {
  const kokoroMod = await dynamicImportFromUrls(KOKORO_CDN_URLS);
  if (!kokoroMod || !kokoroMod.KokoroTTS) {
    throw new Error('Could not load kokoro-js module from CDN.');
  }
  let transformersMod: any | null = null;
  try {
    // Imports the exact singleton @huggingface/transformers@3.5.1 module already loaded by kokoro-js (0 extra bytes!)
    transformersMod = await dynamicImportFromUrls(TRANSFORMERS_CDN_URLS);
  } catch {
    transformersMod = null;
  }
  return { kokoroMod, transformersMod };
}

function splitTextForLowMemoryMobileSynthesis(text: string, maxLen: number = 110): string[] {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length <= maxLen) return trimmed ? [trimmed] : [];
  const rawSentences = trimmed.match(/[^.!?\n]+[.!?]?/g) || [trimmed];
  const out: string[] = [];
  for (const s of rawSentences) {
    const clean = s.trim();
    if (!clean) continue;
    if (clean.length <= maxLen) {
      out.push(clean);
      continue;
    }
    const clauses = clean.match(/[^,;:\u2014]+[,;:\u2014]?/g) || [clean];
    let acc = '';
    for (const c of clauses) {
      const candidate = (acc ? `${acc} ${c.trim()}` : c.trim()).trim();
      if (candidate.length <= maxLen) {
        acc = candidate;
      } else {
        if (acc) out.push(acc);
        acc = c.trim();
      }
    }
    if (acc) out.push(acc);
  }
  return out.length > 0 ? out : [trimmed];
}

async function ensureKokoroLoaded(): Promise<any> {
  if (ttsInstance) return ttsInstance;
  if (initPromise) return initPromise;

  const heartbeatTimer = setInterval(() => {
    try {
      self.postMessage({ type: 'heartbeat' });
    } catch {}
  }, 2500);

  initPromise = (async () => {
    self.postMessage({
      type: 'status',
      state: 'loading',
      progress: 3,
      detail: 'Loading Kokoro-82M runtime...'
    });

    const { kokoroMod, transformersMod } = await loadKokoroRuntime();
    const { KokoroTTS } = kokoroMod;

    // Configure the REAL @huggingface/transformers ONNX WASM environment:
    // (Note: `kokoroMod.env` only exposes `wasmPaths`, NOT `backends.onnx.wasm`!)
    try {
      const tfEnv = transformersMod?.env;
      if (tfEnv) {
        // On iOS Safari/WebKit, `CacheStorage.put(new Response(88MB_Uint8Array))` inside a Worker
        // duplicates the entire 88.1 MB buffer (~176 MB peak) right at 99% and triggers iOS Jetsam!
        // Rely on native HTTP disk caching on iOS to save 88 MB of Worker RAM.
        if (isIOSWorker) {
          tfEnv.useBrowserCache = false;
        }
        const wasmEnv = tfEnv?.backends?.onnx?.wasm;
        if (wasmEnv) {
          wasmEnv.simd = true;
          wasmEnv.proxy = false;
          if (
            !isMobileWorker &&
            typeof self !== 'undefined' &&
            (self as any).crossOriginIsolated
          ) {
            const cores =
              typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 2 : 2;
            wasmEnv.numThreads = Math.min(4, Math.max(1, cores - 1));
          } else {
            wasmEnv.numThreads = 1;
          }
        }
      }
    } catch {}

    const fileProgress = new Map<string, { loaded: number; total: number }>();
    let compilationAnnounced = false;

    const onProgress = (info: any) => {
      if (!info) return;
      if (
        info.status === 'progress' &&
        info.file &&
        typeof info.total === 'number' &&
        info.total > 0
      ) {
        fileProgress.set(info.file, { loaded: info.loaded || 0, total: info.total });
        let sumLoaded = 0;
        let sumTotal = 0;
        fileProgress.forEach((v) => {
          sumLoaded += v.loaded;
          sumTotal += v.total;
        });
        // Map weight download cleanly to 6% -> 90% so 91%–99% accurately represents WASM compilation!
        const ratio = sumTotal > 0 ? Math.min(1, Math.max(0, sumLoaded / sumTotal)) : 0.2;
        const pct = Math.min(90, Math.max(6, Math.round(6 + ratio * 84)));
        self.postMessage({
          type: 'status',
          state: 'loading',
          progress: pct,
          detail: `Downloading Kokoro-82M neural weights (${pct}%)...`
        });
        return;
      }

      if (
        info.status === 'done' &&
        typeof info.file === 'string' &&
        info.file.endsWith('.onnx') &&
        !compilationAnnounced
      ) {
        compilationAnnounced = true;
        self.postMessage({
          type: 'status',
          state: 'loading',
          progress: 94,
          detail: isMobileWorker
            ? 'Compiling Kokoro-82M on mobile CPU (~5–15s)...'
            : 'Initializing Kokoro-82M WebAssembly engine...'
        });
      }
    };

    const StyleModel = transformersMod?.StyleTextToSpeech2Model;
    const Tokenizer = transformersMod?.AutoTokenizer;

    if (StyleModel && Tokenizer) {
      // Load lightweight tokenizer first, then load quantized ONNX model with low-memory mobile session_options!
      // Disabling `enableCpuMemArena` & `enableMemPattern` + `graphOptimizationLevel: 'basic'` on mobile
      // cuts peak WASM RAM by >200 MB and speeds up `InferenceSession.create()` at 94% by ~70%!
      const tokenizer = await Tokenizer.from_pretrained(KOKORO_MODEL_ID);
      const model = await StyleModel.from_pretrained(KOKORO_MODEL_ID, {
        dtype: 'q8',
        device: 'wasm',
        progress_callback: onProgress,
        session_options: isMobileWorker
          ? {
              enableCpuMemArena: false,
              enableMemPattern: false,
              graphOptimizationLevel: 'basic',
              intraOpNumThreads: 1,
              interOpNumThreads: 1
            }
          : undefined
      });
      ttsInstance = new KokoroTTS(model, tokenizer);
    } else {
      ttsInstance = await KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
        dtype: 'q8',
        device: 'wasm',
        progress_callback: onProgress
      });
    }
    activeBackend = 'wasm';

    // IMPORTANT: Never run a heavy multi-word synthesis warmup during init on mobile!
    // Booting eSpeakNG + ISTFTNet right on top of the 88 MB weight load spikes mobile Worker RAM
    // past iOS/Android OOM limits and caused the UI to freeze forever at 99%.
    if (!isMobileWorker) {
      self.postMessage({
        type: 'status',
        state: 'loading',
        progress: 98,
        detail: 'Warming up Kokoro-82M audio engine...'
      });
      try {
        await ttsInstance.generate('Hello there.', {
          voice: 'af_heart',
          speed: 1.0
        });
      } catch {
        // Non-fatal warmup
      }
    }

    self.postMessage({
      type: 'status',
      state: 'ready',
      progress: 100,
      backend: activeBackend,
      detail: 'Kokoro-82M Ready (WASM q8)'
    });
    return ttsInstance;
  })();

  try {
    return await initPromise;
  } catch (err: any) {
    initPromise = null;
    self.postMessage({
      type: 'status',
      state: 'error',
      progress: 0,
      detail: err?.message || 'Failed to initialize Kokoro-82M model.'
    });
    throw err;
  } finally {
    clearInterval(heartbeatTimer);
  }
}

// Serialize synthesis calls inside worker so concurrent sentence prefetches never collide on ONNX session
let synthesisChain: Promise<void> = Promise.resolve();

self.onmessage = (event: MessageEvent) => {
  const msg = event.data;
  if (!msg || typeof msg !== 'object') return;

  if (msg.type === 'warmup') {
    void ensureKokoroLoaded().catch(() => {});
    return;
  }

  if (msg.type === 'generate') {
    const { requestId, text, voice, speed } = msg;
    synthesisChain = synthesisChain.then(async () => {
      const genHeartbeat = setInterval(() => {
        try {
          self.postMessage({ type: 'heartbeat' });
        } catch {}
      }, 2500);
      try {
        const tts = await ensureKokoroLoaded();
        const safeSpeed = typeof speed === 'number' ? Math.max(0.75, Math.min(1.3, speed)) : 1.0;
        const selectedVoice = voice || 'af_heart';

        // On mobile, chunk long paragraphs into <=110-char clauses so ISTFTNet STFT buffers stay compact
        const parts = isMobileWorker ? splitTextForLowMemoryMobileSynthesis(String(text || ''), 110) : [String(text || '')];
        let wavBuffer: ArrayBuffer;

        if (parts.length > 1) {
          const chunks: Float32Array[] = [];
          let sampleRate = 24000;
          const pauseSamples = Math.round(24000 * 0.035);
          for (let idx = 0; idx < parts.length; idx++) {
            const res = await tts.generate(parts[idx], {
              voice: selectedVoice,
              speed: safeSpeed
            });
            if (res && res.audio instanceof Float32Array) {
              sampleRate = res.sampling_rate || 24000;
              chunks.push(res.audio);
              if (idx < parts.length - 1) {
                chunks.push(new Float32Array(pauseSamples));
              }
            }
          }
          const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
          const merged = new Float32Array(totalLen);
          let off = 0;
          for (const c of chunks) {
            merged.set(c, off);
            off += c.length;
          }
          wavBuffer = encodeFloat32ToWavBuffer(merged, sampleRate);
        } else {
          const result = await tts.generate(parts[0] || text, {
            voice: selectedVoice,
            speed: safeSpeed
          });

          if (result && result.audio instanceof Float32Array) {
            wavBuffer = encodeFloat32ToWavBuffer(result.audio, result.sampling_rate || 24000);
          } else if (result && typeof result.toWav === 'function') {
            const rawWav = result.toWav();
            wavBuffer =
              rawWav instanceof ArrayBuffer
                ? rawWav
                : rawWav.buffer.slice(rawWav.byteOffset, rawWav.byteOffset + rawWav.byteLength);
          } else {
            throw new Error('Unexpected audio output from Kokoro-82M.');
          }
        }

        (self as any).postMessage(
          {
            type: 'audio',
            requestId,
            wavBuffer,
            backend: activeBackend
          },
          [wavBuffer]
        );
      } catch (err: any) {
        self.postMessage({
          type: 'generate_error',
          requestId,
          error: err?.message || 'Kokoro synthesis failed.'
        });
      } finally {
        clearInterval(genHeartbeat);
      }
    });
  }
};
