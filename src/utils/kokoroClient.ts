/**
 * Main-Thread Client & Status Store for Kokoro-82M Natural Neural TTS Worker.
 * Provides reactive engine status updates for the Settings UI, LRU audio Blob caching,
 * and AbortSignal-aware synthesis for Lingo Buddy's real-time sentence queue.
 */

export type KokoroVoiceId =
  | 'af_heart'
  | 'af_bella'
  | 'af_nicole'
  | 'af_sarah'
  | 'af_nova'
  | 'am_fenrir'
  | 'am_michael'
  | 'am_puck'
  | 'bf_emma'
  | 'bf_isabella'
  | 'bm_george'
  | 'bm_fable';

export interface KokoroVoiceDescriptor {
  id: KokoroVoiceId;
  label: string;
  accent: 'US' | 'UK';
  gender: 'Female' | 'Male';
  trait: string;
}

export const KOKORO_NATURAL_VOICES: KokoroVoiceDescriptor[] = [
  { id: 'af_heart', label: 'Heart (US)', accent: 'US', gender: 'Female', trait: 'Warmest Flagship · Grade A' },
  { id: 'af_bella', label: 'Bella (US)', accent: 'US', gender: 'Female', trait: 'Expressive & Natural' },
  { id: 'af_nicole', label: 'Nicole (US)', accent: 'US', gender: 'Female', trait: 'Calm & Soft-Spoken' },
  { id: 'af_sarah', label: 'Sarah (US)', accent: 'US', gender: 'Female', trait: 'Clear & Articulate' },
  { id: 'af_nova', label: 'Nova (US)', accent: 'US', gender: 'Female', trait: 'Bright & Friendly' },
  { id: 'am_michael', label: 'Michael (US)', accent: 'US', gender: 'Male', trait: 'Warm Conversational' },
  { id: 'am_fenrir', label: 'Fenrir (US)', accent: 'US', gender: 'Male', trait: 'Confident & Clear' },
  { id: 'am_puck', label: 'Puck (US)', accent: 'US', gender: 'Male', trait: 'Upbeat & Casual' },
  { id: 'bf_emma', label: 'Emma (UK)', accent: 'UK', gender: 'Female', trait: 'Natural British · IELTS Ideal' },
  { id: 'bf_isabella', label: 'Isabella (UK)', accent: 'UK', gender: 'Female', trait: 'Crisp British Accent' },
  { id: 'bm_george', label: 'George (UK)', accent: 'UK', gender: 'Male', trait: 'Warm British Gentleman' },
  { id: 'bm_fable', label: 'Fable (UK)', accent: 'UK', gender: 'Male', trait: 'Expressive British Male' }
];

export type KokoroEngineState = 'idle' | 'loading' | 'ready' | 'error';

export interface KokoroEngineStatus {
  state: KokoroEngineState;
  progress: number;
  backend?: 'webgpu' | 'wasm' | null;
  detail: string;
}

let currentStatus: KokoroEngineStatus = {
  state: 'idle',
  progress: 0,
  backend: null,
  detail: 'Click Preview or select Kokoro AI to load (~86 MB cached once)'
};

const statusListeners = new Set<(status: KokoroEngineStatus) => void>();
let workerInstance: Worker | null = null;
let reqCounter = 0;

const pendingRequests = new Map<
  number,
  {
    resolve: (blob: Blob) => void;
    reject: (err: Error) => void;
  }
>();

const kokoroWavCache = new Map<string, Blob>();
const MAX_KOKORO_CACHE = 32;

function emitStatus(next: KokoroEngineStatus): void {
  currentStatus = next;
  statusListeners.forEach(fn => {
    try {
      fn(next);
    } catch {}
  });
}

export function getKokoroStatus(): KokoroEngineStatus {
  return currentStatus;
}

export function subscribeKokoroStatus(
  listener: (status: KokoroEngineStatus) => void
): () => void {
  statusListeners.add(listener);
  listener(currentStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

function getOrCreateKokoroWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
  if (workerInstance) return workerInstance;

  try {
    const w = new Worker(new URL('./kokoroWorker.ts', import.meta.url), {
      type: 'module'
    });

    w.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'status') {
        emitStatus({
          state: msg.state,
          progress: typeof msg.progress === 'number' ? msg.progress : 0,
          backend: msg.backend || currentStatus.backend,
          detail: msg.detail || ''
        });
        return;
      }

      if (msg.type === 'audio') {
        const entry = pendingRequests.get(msg.requestId);
        if (entry) {
          pendingRequests.delete(msg.requestId);
          const blob = new Blob([msg.wavBuffer], { type: 'audio/wav' });
          entry.resolve(blob);
        }
        return;
      }

      if (msg.type === 'generate_error') {
        const entry = pendingRequests.get(msg.requestId);
        if (entry) {
          pendingRequests.delete(msg.requestId);
          entry.reject(new Error(msg.error || 'Kokoro generation failed'));
        }
      }
    };

    w.onerror = (err) => {
      emitStatus({
        state: 'error',
        progress: 0,
        detail: err?.message || 'Kokoro Web Worker failed to start.'
      });
    };

    workerInstance = w;
    return w;
  } catch (err: any) {
    emitStatus({
      state: 'error',
      progress: 0,
      detail: err?.message || 'Web Workers are not supported in this browser.'
    });
    return null;
  }
}

export function warmUpKokoroTts(): void {
  const w = getOrCreateKokoroWorker();
  if (!w) return;
  w.postMessage({ type: 'warmup' });
}

export async function synthesizeKokoroWavBlob(
  text: string,
  voice: KokoroVoiceId = 'af_heart',
  rate: number = 1.0,
  signal?: AbortSignal,
  onFirstByte?: (delivery: 'neural-stream' | 'neural-cache') => void
): Promise<Blob | null> {
  const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
  if (!cleanText) return null;

  const clampedRate = Number(Math.max(0.75, Math.min(1.3, rate)).toFixed(2));
  const cacheKey = `kokoro|${voice}|${clampedRate}|${cleanText}`;
  const cached = kokoroWavCache.get(cacheKey);
  if (cached) {
    onFirstByte?.('neural-cache');
    return cached;
  }

  if (signal?.aborted) return null;
  const w = getOrCreateKokoroWorker();
  if (!w) return null;

  const requestId = ++reqCounter;

  return new Promise<Blob | null>((resolve) => {
    let settled = false;
    const onAbort = () => {
      if (settled) return;
      settled = true;
      pendingRequests.delete(requestId);
      resolve(null);
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    pendingRequests.set(requestId, {
      resolve: (blob) => {
        if (settled) return;
        settled = true;
        signal?.removeEventListener('abort', onAbort);
        if (blob.size >= 128) {
          if (kokoroWavCache.size >= MAX_KOKORO_CACHE) {
            const oldest = kokoroWavCache.keys().next().value;
            if (oldest) kokoroWavCache.delete(oldest);
          }
          kokoroWavCache.set(cacheKey, blob);
          onFirstByte?.('neural-stream');
          resolve(blob);
        } else {
          resolve(null);
        }
      },
      reject: () => {
        if (settled) return;
        settled = true;
        signal?.removeEventListener('abort', onAbort);
        resolve(null);
      }
    });

    w.postMessage({
      type: 'generate',
      requestId,
      text: cleanText,
      voice,
      speed: clampedRate
    });
  });
}
