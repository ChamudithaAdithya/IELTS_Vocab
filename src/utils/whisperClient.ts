/**
 * Client-side OpenAI Whisper Local ASR Manager (Web Worker + 16kHz Audio Resampler).
 * Runs completely inside the browser via WebGPU / WASM with zero backend or API key required.
 */

import type { WhisperModelId } from '../workers/whisper.worker';

export type { WhisperModelId };

export interface WhisperProgressUpdate {
  status: 'loading' | 'ready' | 'inferencing' | 'complete' | 'error';
  percent?: number;
  file?: string;
  device?: 'webgpu' | 'wasm';
  message?: string;
}

const TARGET_SAMPLE_RATE = 16000;

let sharedWorker: Worker | null = null;
let loadedModelId: WhisperModelId | null = null;

function getOrCreateWorker(): Worker {
  if (!sharedWorker) {
    sharedWorker = new Worker(
      new URL('../workers/whisper.worker.ts', import.meta.url),
      { type: 'module' }
    );
  }
  return sharedWorker;
}

export function isWhisperModelCachedInSession(model: WhisperModelId): boolean {
  return loadedModelId === model;
}

/**
 * Decodes any recorded browser Audio Blob (webm/ogg/mp4/wav) into a 16,000 Hz mono Float32Array,
 * which is the exact waveform format required by OpenAI Whisper.
 */
export async function decodeAudioBlobTo16kHzMono(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  // First decode with default AudioContext to handle any browser codec cleanly
  const decodeCtx = new AudioCtx();
  let decoded: AudioBuffer;
  try {
    decoded = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    try {
      await decodeCtx.close();
    } catch {}
  }

  // Mix down to mono if multi-channel and resample precisely to 16,000 Hz via OfflineAudioContext
  const durationSec = decoded.duration;
  const targetLength = Math.max(1, Math.ceil(durationSec * TARGET_SAMPLE_RATE));

  if (typeof OfflineAudioContext !== 'undefined') {
    const offlineCtx = new OfflineAudioContext(1, targetLength, TARGET_SAMPLE_RATE);
    const source = offlineCtx.createBufferSource();
    source.buffer = decoded;
    source.connect(offlineCtx.destination);
    source.start(0);
    const rendered = await offlineCtx.startRendering();
    return new Float32Array(rendered.getChannelData(0));
  }

  // Fallback linear resampling if OfflineAudioContext is unavailable
  const mono = decoded.getChannelData(0);
  if (decoded.sampleRate === TARGET_SAMPLE_RATE) {
    return new Float32Array(mono);
  }
  const ratio = decoded.sampleRate / TARGET_SAMPLE_RATE;
  const out = new Float32Array(targetLength);
  for (let i = 0; i < targetLength; i++) {
    const srcIdx = Math.min(mono.length - 1, Math.floor(i * ratio));
    out[i] = mono[srcIdx];
  }
  return out;
}

/**
 * Transcribes a recorded Audio Blob locally using OpenAI Whisper inside the Web Worker.
 */
export async function transcribeBlobWithWhisper(
  blob: Blob,
  options: {
    model?: WhisperModelId;
    onProgress?: (update: WhisperProgressUpdate) => void;
  } = {}
): Promise<{ text: string; device: 'webgpu' | 'wasm' }> {
  const model: WhisperModelId = options.model || 'onnx-community/whisper-base.en';
  const onProgress = options.onProgress;

  onProgress?.({
    status: 'loading',
    message: 'Preparing 16kHz audio waveform...'
  });

  const pcm16k = await decodeAudioBlobTo16kHzMono(blob);
  const worker = getOrCreateWorker();
  const reqId = `whisper-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.id !== reqId) return;

      if (data.status === 'loading') {
        const rawProg = data.progress;
        const pct =
          typeof rawProg?.progress === 'number'
            ? Math.round(rawProg.progress)
            : undefined;
        const fileName = typeof rawProg?.file === 'string' ? rawProg.file.split('/').pop() : undefined;
        onProgress?.({
          status: 'loading',
          percent: pct,
          file: fileName,
          device: data.device,
          message:
            pct !== undefined
              ? `Downloading Whisper AI (${fileName || 'model'}): ${pct}%`
              : 'Loading Whisper neural model (cached after 1st run)...'
        });
      } else if (data.status === 'inferencing') {
        loadedModelId = model;
        onProgress?.({
          status: 'inferencing',
          device: data.device,
          message: `Transcribing with Whisper AI (${data.device === 'webgpu' ? 'WebGPU' : 'WASM'})...`
        });
      } else if (data.status === 'complete') {
        loadedModelId = model;
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);
        onProgress?.({
          status: 'complete',
          device: data.device,
          message: 'Transcription complete!'
        });
        resolve({
          text: String(data.text || '').trim(),
          device: data.device || 'wasm'
        });
      } else if (data.status === 'error') {
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);
        onProgress?.({
          status: 'error',
          message: data.error || 'Whisper transcription error'
        });
        reject(new Error(data.error || 'Whisper transcription failed'));
      }
    };

    const handleError = (err: ErrorEvent) => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      reject(new Error(err.message || 'Whisper Web Worker crashed'));
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    // Transfer Float32Array buffer cleanly to worker (zero-copy)
    worker.postMessage(
      {
        id: reqId,
        action: 'transcribe',
        model,
        audio: pcm16k
      },
      [pcm16k.buffer]
    );
  });
}

/**
 * Pre-downloads and warms up the Whisper model into browser cache before the candidate speaks.
 */
export async function preloadWhisperModel(
  model: WhisperModelId = 'onnx-community/whisper-base.en',
  onProgress?: (update: WhisperProgressUpdate) => void
): Promise<'webgpu' | 'wasm'> {
  const worker = getOrCreateWorker();
  const reqId = `preload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.id !== reqId) return;

      if (data.status === 'loading') {
        const rawProg = data.progress;
        const pct = typeof rawProg?.progress === 'number' ? Math.round(rawProg.progress) : undefined;
        const fileName = typeof rawProg?.file === 'string' ? rawProg.file.split('/').pop() : undefined;
        onProgress?.({
          status: 'loading',
          percent: pct,
          file: fileName,
          device: data.device,
          message:
            pct !== undefined
              ? `Downloading Whisper AI (${fileName || 'weights'}): ${pct}%`
              : 'Initializing Whisper AI...'
        });
      } else if (data.status === 'ready') {
        loadedModelId = model;
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);
        onProgress?.({
          status: 'ready',
          percent: 100,
          device: data.device,
          message: `Whisper AI ready (${data.device === 'webgpu' ? 'WebGPU' : 'WASM'})`
        });
        resolve(data.device || 'wasm');
      } else if (data.status === 'error') {
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);
        reject(new Error(data.error || 'Failed to preload Whisper AI'));
      }
    };

    const handleError = (err: ErrorEvent) => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      reject(new Error(err.message || 'Whisper Web Worker error'));
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    worker.postMessage({
      id: reqId,
      action: 'preload',
      model
    });
  });
}
