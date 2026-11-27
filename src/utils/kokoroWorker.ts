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

async function loadKokoroModule(): Promise<any> {
  let lastErr: any = null;
  for (const url of KOKORO_CDN_URLS) {
    try {
      // Dynamic ESM import from CDN so Vite does not need a 200MB native C++ node_modules bundle
      const mod = await (new Function('u', 'return import(u)')(url) as Promise<any>);
      if (mod && mod.KokoroTTS) {
        return mod;
      }
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Could not load kokoro-js module from CDN.');
}

async function ensureKokoroLoaded(): Promise<any> {
  if (ttsInstance) return ttsInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    self.postMessage({
      type: 'status',
      state: 'loading',
      progress: 2,
      detail: 'Loading Kokoro-82M runtime...'
    });

    const kokoroMod = await loadKokoroModule();
    const { KokoroTTS } = kokoroMod;

    // Enable maximum WASM SIMD acceleration (and multi-threading when Cross-Origin-Isolated)
    try {
      const wasmEnv = kokoroMod?.env?.backends?.onnx?.wasm;
      if (wasmEnv) {
        wasmEnv.simd = true;
        if (typeof self !== 'undefined' && (self as any).crossOriginIsolated) {
          const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 2 : 2;
          wasmEnv.numThreads = Math.min(4, Math.max(1, cores - 1));
        }
      }
    } catch {}

    const fileProgress = new Map<string, { loaded: number; total: number }>();
    const onProgress = (info: any) => {
      if (!info) return;
      if (info.status === 'progress' && info.file && typeof info.total === 'number' && info.total > 0) {
        fileProgress.set(info.file, { loaded: info.loaded || 0, total: info.total });
        let sumLoaded = 0;
        let sumTotal = 0;
        fileProgress.forEach(v => {
          sumLoaded += v.loaded;
          sumTotal += v.total;
        });
        const pct = sumTotal > 0 ? Math.min(99, Math.max(5, Math.round((sumLoaded / sumTotal) * 100))) : 25;
        self.postMessage({
          type: 'status',
          state: 'loading',
          progress: pct,
          detail: `Downloading Kokoro-82M neural weights (${pct}%)...`
        });
      }
    };

    // Use deterministic WASM (q8) rather than WebGPU fp32: WebGPU JIT shader compilation & GPU float
    // precision mismatches in Kokoro's ISTFTNet vocoder cause ~200Hz bee-like buzzing on early responses.
    ttsInstance = await KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: onProgress
    });
    activeBackend = 'wasm';

    // Silent throwaway warmup pass so ONNX WASM kernels & memory buffers are warm before Turn 1
    try {
      await ttsInstance.generate('Hello there, nice to meet you today.', {
        voice: 'af_heart',
        speed: 1.0
      });
    } catch {
      // Non-fatal warmup
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
      try {
        const tts = await ensureKokoroLoaded();
        const safeSpeed = typeof speed === 'number' ? Math.max(0.75, Math.min(1.3, speed)) : 1.0;
        const result = await tts.generate(text, {
          voice: voice || 'af_heart',
          speed: safeSpeed
        });

        let wavBuffer: ArrayBuffer;
        if (result && result.audio instanceof Float32Array) {
          // Always encode sanitized, fade-smoothed 16-bit PCM WAV rather than RawAudio.toWav()'s unclamped 32-bit float WAV
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
      }
    });
  }
};
