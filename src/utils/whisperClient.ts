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
 * Conditions 16kHz mono PCM for maximum Whisper acoustic fidelity:
 *  1. Rejects pure silence (prevents Whisper phantom hallucinations on dead air).
 *  2. Trims excessive leading/trailing dead air while preserving a 240ms safety margin
 *     so opening & ending consonants ("-ed", "-s", "t", "d") are never clipped.
 *  3. Gently peak-normalizes voice amplitude to 0.88 so quiet mics decode accurately.
 */
function conditionVoicePcm16k(pcm: Float32Array): Float32Array {
  if (pcm.length === 0) return pcm;

  let peak = 0;
  for (let i = 0; i < pcm.length; i++) {
    const a = Math.abs(pcm[i]);
    if (a > peak) peak = a;
  }

  // Pure silence / unplugged mic -> return empty so Whisper/Gemini never hallucinates words
  if (peak < 0.01) {
    return new Float32Array(0);
  }

  // Find speech boundaries using adaptive threshold (8% of peak, floored at 0.014)
  const gate = Math.max(0.014, peak * 0.08);
  let startIdx = 0;
  while (startIdx < pcm.length && Math.abs(pcm[startIdx]) < gate) startIdx++;
  let endIdx = pcm.length - 1;
  while (endIdx > startIdx && Math.abs(pcm[endIdx]) < gate) endIdx--;

  // Require at least 160ms (2,560 samples at 16kHz) of real active sound span
  // to ignore single keyboard clicks, mic pops, or brief speaker echo tails
  if (endIdx - startIdx < Math.round(TARGET_SAMPLE_RATE * 0.16)) {
    return new Float32Array(0);
  }

  // Keep a generous 240ms (3,840 samples at 16kHz) pad around speech so final "-ed"/"-s" are intact
  const padSamples = Math.round(TARGET_SAMPLE_RATE * 0.24);
  const trimStart = Math.max(0, startIdx - padSamples);
  const trimEnd = Math.min(pcm.length, endIdx + padSamples);

  const sliced = pcm.subarray(trimStart, trimEnd);
  const out = new Float32Array(sliced.length);
  const gain = peak < 0.85 ? Math.min(6.0, 0.88 / peak) : 1.0;

  for (let i = 0; i < sliced.length; i++) {
    const v = sliced[i] * gain;
    out[i] = v > 1 ? 1 : v < -1 ? -1 : v;
  }
  return out;
}

/**
 * Encodes a conditioned 16kHz mono Float32Array into an uncompressed 16-bit PCM WAV Blob.
 * Uncompressed 16kHz WAV gives Gemini Multimodal Audio maximum consonant fidelity
 * (zero Opus compression smear on "-ed", "-s", "t", "d", "th") and trims dead air.
 */
export function encodePcm16kToWavBlob(pcm16k: Float32Array): Blob {
  const numSamples = pcm16k.length;
  const bytesPerSample = 2;
  const dataByteLength = numSamples * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, TARGET_SAMPLE_RATE, true); // 16000 Hz
  view.setUint32(28, TARGET_SAMPLE_RATE * bytesPerSample, true); // Byte rate
  view.setUint16(32, bytesPerSample, true); // Block align
  view.setUint16(34, 16, true); // 16-bit
  writeAscii(36, 'data');
  view.setUint32(40, dataByteLength, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, pcm16k[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Converts a raw recorded browser Audio Blob into a studio-conditioned 16kHz mono WAV Blob
 * (silence-gated, trimmed with 240ms consonant pad, peak-normalized).
 * Returns null if the recording contains only silence / clicks (preventing phantom STT turns).
 */
export async function prepareStudioWavFromBlob(
  blob: Blob
): Promise<{ wavBlob: Blob; durationSec: number } | null> {
  const pcm16k = await decodeAudioBlobTo16kHzMono(blob);
  if (!pcm16k || pcm16k.length < Math.round(TARGET_SAMPLE_RATE * 0.18)) {
    return null;
  }
  return {
    wavBlob: encodePcm16kToWavBlob(pcm16k),
    durationSec: Number((pcm16k.length / TARGET_SAMPLE_RATE).toFixed(2))
  };
}

/**
 * Decodes any recorded browser Audio Blob (webm/ogg/mp4/wav) into a conditioned 16,000 Hz mono Float32Array,
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
    return conditionVoicePcm16k(new Float32Array(rendered.getChannelData(0)));
  }

  // Fallback linear resampling if OfflineAudioContext is unavailable
  const mono = decoded.getChannelData(0);
  if (decoded.sampleRate === TARGET_SAMPLE_RATE) {
    return conditionVoicePcm16k(new Float32Array(mono));
  }
  const ratio = decoded.sampleRate / TARGET_SAMPLE_RATE;
  const out = new Float32Array(targetLength);
  for (let i = 0; i < targetLength; i++) {
    const srcIdx = Math.min(mono.length - 1, Math.floor(i * ratio));
    out[i] = mono[srcIdx];
  }
  return conditionVoicePcm16k(out);
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
  if (!pcm16k || pcm16k.length < Math.round(TARGET_SAMPLE_RATE * 0.18)) {
    onProgress?.({ status: 'complete', message: 'No speech detected in clip.' });
    return { text: '', device: 'wasm' };
  }
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
