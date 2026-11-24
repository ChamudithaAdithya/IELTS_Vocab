/// <reference lib="webworker" />

export type WhisperModelId =
  | 'onnx-community/whisper-small.en'
  | 'onnx-community/whisper-base.en'
  | 'onnx-community/whisper-tiny.en';

interface WorkerRequest {
  id: string;
  action: 'preload' | 'transcribe';
  model: WhisperModelId;
  audio?: Float32Array;
}

const TRANSFORMERS_CDNS = [
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.0',
  'https://esm.sh/@huggingface/transformers@3.4.0'
];

let transformersModulePromise: Promise<any> | null = null;

async function loadTransformersModule(): Promise<any> {
  if (!transformersModulePromise) {
    transformersModulePromise = (async () => {
      let lastErr: any = null;
      for (const cdnUrl of TRANSFORMERS_CDNS) {
        try {
          // Use dynamic runtime ESM import inside the Web Worker so Vite keeps bundle tiny & zero native node binaries are needed
          const mod = await import(/* @vite-ignore */ cdnUrl);
          if (mod && typeof mod.pipeline === 'function') {
            if (mod.env) {
              mod.env.allowLocalModels = false;
              mod.env.useBrowserCache = true;
            }
            return mod;
          }
        } catch (err) {
          lastErr = err;
        }
      }
      transformersModulePromise = null;
      throw lastErr || new Error('Could not load Transformers.js runtime from CDN.');
    })();
  }
  return transformersModulePromise;
}

class WhisperPipelineSingleton {
  private static currentModel: WhisperModelId | null = null;
  private static instance: any = null;
  private static activeDevice: 'webgpu' | 'wasm' = 'wasm';

  static getDevice(): 'webgpu' | 'wasm' {
    return this.activeDevice;
  }

  static async getInstance(
    model: WhisperModelId,
    progressCallback: (progress: any) => void
  ): Promise<any> {
    if (this.instance && this.currentModel === model) {
      return this.instance;
    }

    if (this.instance && typeof this.instance.dispose === 'function') {
      try {
        await this.instance.dispose();
      } catch {}
    }
    this.instance = null;
    this.currentModel = model;

    const { pipeline } = await loadTransformersModule();

    // Prefer WebGPU when available, gracefully fall back to WASM on unsupported GPUs
    const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;
    if (hasWebGPU) {
      try {
        const adapter = await (navigator as any).gpu?.requestAdapter?.();
        if (adapter) {
          this.activeDevice = 'webgpu';
          this.instance = await pipeline('automatic-speech-recognition', model, {
            device: 'webgpu',
            dtype: 'q8',
            progress_callback: progressCallback
          });
          return this.instance;
        }
      } catch (gpuErr) {
        console.warn('[Whisper Worker] WebGPU initialization failed, falling back to WASM:', gpuErr);
      }
    }

    this.activeDevice = 'wasm';
    this.instance = await pipeline('automatic-speech-recognition', model, {
      device: 'wasm',
      dtype: 'q8',
      progress_callback: progressCallback
    });
    return this.instance;
  }
}

self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const { id, action, model, audio } = event.data;

  try {
    const transcriber = await WhisperPipelineSingleton.getInstance(model, (progressInfo: any) => {
      self.postMessage({
        id,
        status: 'loading',
        device: WhisperPipelineSingleton.getDevice(),
        progress: progressInfo
      });
    });

    if (action === 'preload') {
      self.postMessage({
        id,
        status: 'ready',
        device: WhisperPipelineSingleton.getDevice()
      });
      return;
    }

    if (!audio || audio.length === 0) {
      self.postMessage({
        id,
        status: 'complete',
        text: '',
        device: WhisperPipelineSingleton.getDevice()
      });
      return;
    }

    self.postMessage({
      id,
      status: 'inferencing',
      device: WhisperPipelineSingleton.getDevice()
    });

    const output = await transcriber(audio, {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: false,
      // Deterministic verbatim decoding — prevents creative paraphrasing & hallucination loops
      temperature: 0,
      no_repeat_ngram_size: 3
    });

    const rawText = (
      Array.isArray(output)
        ? output.map((o: any) => o?.text || '').join(' ')
        : String(output?.text || '')
    )
      // Remove only non-speech Whisper bracketed sound tags ([BLANK_AUDIO], (music)), NEVER altering spoken words!
      .replace(/\[(?:BLANK_AUDIO|SILENCE|MUSIC|APPLAUSE|LAUGHTER|INAUDIBLE|NOISE)[^\]]*\]/gi, '')
      .replace(/\((?:music|applause|laughter|silence|inaudible|background noise)\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    self.postMessage({
      id,
      status: 'complete',
      text: rawText,
      device: WhisperPipelineSingleton.getDevice()
    });
  } catch (err: any) {
    self.postMessage({
      id,
      status: 'error',
      error: err?.message || String(err) || 'Whisper worker failed'
    });
  }
});
