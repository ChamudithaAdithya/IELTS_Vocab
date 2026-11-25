/**
 * Studio-grade 16kHz Mono PCM Audio Conditioner & WAV Encoder.
 * Converts browser MediaRecorder blobs (WebM/Opus/OGG/MP4) into uncompressed,
 * silence-trimmed, peak-normalized 16kHz 16-bit PCM WAV for maximum speech-to-text accuracy.
 */

const TARGET_SAMPLE_RATE = 16000;

/**
 * Conditions 16kHz mono PCM for maximum acoustic fidelity:
 *  1. Rejects pure silence / brief clicks (< 160ms) so STT never hallucinates phantom words on dead air.
 *  2. Trims leading/trailing dead air while preserving a 240ms safety margin
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

  // Pure silence / unplugged mic -> return empty so STT never hallucinates words
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
 * Decodes any recorded browser Audio Blob (webm/ogg/mp4/wav) into a conditioned 16,000 Hz mono Float32Array.
 */
export async function decodeAudioBlobTo16kHzMono(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  const decodeCtx = new AudioCtx();
  let decoded: AudioBuffer;
  try {
    decoded = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    try {
      await decodeCtx.close();
    } catch {}
  }

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
 * Encodes a conditioned 16kHz mono Float32Array into an uncompressed 16-bit PCM WAV Blob.
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
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, TARGET_SAMPLE_RATE, true);
  view.setUint32(28, TARGET_SAMPLE_RATE * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
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
 * Converts a raw recorded browser Audio Blob into a studio-conditioned 16kHz mono WAV Blob.
 * Returns null if the recording contains only silence / clicks.
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
