/**
 * Web Speech API, Kokoro-82M Local Neural TTS & Cloud Natural Audio Engine
 * Provides studio-quality Kokoro-82M WebGPU/WASM voices, Edge Neural HD streaming,
 * and browser SpeechSynthesis with custom voice selection, persistence, and speed control.
 */

import {
  KOKORO_NATURAL_VOICES,
  getKokoroStatus,
  subscribeKokoroStatus,
  synthesizeKokoroWavBlob,
  warmUpKokoroTts,
  type KokoroEngineStatus,
  type KokoroVoiceDescriptor,
  type KokoroVoiceId
} from './kokoroClient';

export {
  KOKORO_NATURAL_VOICES,
  getKokoroStatus,
  subscribeKokoroStatus,
  warmUpKokoroTts,
  type KokoroEngineStatus,
  type KokoroVoiceDescriptor,
  type KokoroVoiceId
};

export interface VoiceSettings {
  voiceURI: string;
  voiceName: string;
  lang: string;
  rate: number;
  pitch: number;
  showExampleSpeakers: boolean;
}

export interface AppVoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  isNatural: boolean;
  isCloud: boolean;
  isRobotic?: boolean;
  flag: string;
  badge: string;
  description?: string;
  rawVoice?: SpeechSynthesisVoice;
}

export const CLOUD_NATURAL_VOICES: AppVoiceOption[] = [
  {
    voiceURI: 'cloud-natural-uk',
    name: 'Natural British Examiner (Studio HD)',
    lang: 'en-GB',
    isNatural: true,
    isCloud: true,
    flag: '🇬🇧',
    badge: '🌟 Studio HD Natural',
    description: 'Human-grade British English with authentic cadence and pronunciation'
  },
  {
    voiceURI: 'cloud-natural-us',
    name: 'Natural American Voice (Studio HD)',
    lang: 'en-US',
    isNatural: true,
    isCloud: true,
    flag: '🇺🇸',
    badge: '🌟 Studio HD Natural',
    description: 'Crisp, natural conversational American English pronunciation'
  },
  {
    voiceURI: 'cloud-natural-au',
    name: 'Natural Australian Voice (Studio HD)',
    lang: 'en-AU',
    isNatural: true,
    isCloud: true,
    flag: '🇦🇺',
    badge: '🌟 Studio HD Natural',
    description: 'Authentic Australian English cadence and clear articulation'
  }
];

const VOICE_SETTINGS_STORAGE_KEY = 'ielts_master_voice_settings_v1';

export const defaultVoiceSettings: VoiceSettings = {
  voiceURI: 'cloud-natural-uk',
  voiceName: 'Natural British Examiner (Studio HD)',
  lang: 'en-GB',
  rate: 0.95,
  pitch: 1.0,
  showExampleSpeakers: true,
};

export function loadVoiceSettings(): VoiceSettings {
  if (typeof window === 'undefined') return defaultVoiceSettings;
  try {
    const raw = localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
    if (!raw) return defaultVoiceSettings;
    const parsed = JSON.parse(raw);
    // If voiceURI is empty or unset, default to cloud-natural-uk
    if (!parsed.voiceURI || parsed.voiceURI === '') {
      return {
        ...defaultVoiceSettings,
        ...parsed,
        voiceURI: 'cloud-natural-uk',
        voiceName: 'Natural British Examiner (Studio HD)'
      };
    }
    return { ...defaultVoiceSettings, ...parsed };
  } catch {
    return defaultVoiceSettings;
  }
}

export function saveVoiceSettings(settings: VoiceSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOICE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('voice-settings-changed', { detail: settings }));
  } catch (e) {
    console.error('Failed to save voice settings:', e);
  }
}

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getBrowserVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

// Listen for async voice population without overwriting other listeners
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getBrowserVoices();
  if (typeof window.speechSynthesis.addEventListener === 'function') {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      getBrowserVoices();
    });
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      getBrowserVoices();
    };
  }
}

/**
 * Filter and categorize all available voices (Cloud Studio HD + Browser Voices)
 */
export function getEnglishVoices(): AppVoiceOption[] {
  const browserList = getBrowserVoices();
  const english = browserList.filter(v => v.lang.toLowerCase().startsWith('en'));

  // Map browser voices with quality badges
  const mappedBrowserVoices: AppVoiceOption[] = english.map(v => {
    const isUK = v.lang.replace('_', '-').toLowerCase().startsWith('en-gb');
    const isUS = v.lang.replace('_', '-').toLowerCase().startsWith('en-us');
    const isAU = v.lang.replace('_', '-').toLowerCase().startsWith('en-au');

    const flag = isUK ? '🇬🇧' : isUS ? '🇺🇸' : isAU ? '🇦🇺' : '🌐';
    const isNatural = 
      v.name.includes('Natural') || 
      v.name.includes('Online (Natural)') || 
      v.name.includes('Enhanced') || 
      v.name.includes('Premium') || 
      v.name.includes('Siri') ||
      v.name.includes('Google');

    const isRobotic = 
      v.name.includes('Desktop') || 
      v.name.includes('David') || 
      v.name.includes('Zira') || 
      v.name.includes('Mark') ||
      v.name.includes('Hazel');

    const badge = isNatural 
      ? '★ Neural Natural' 
      : isRobotic 
      ? '🤖 Basic Robotic' 
      : 'Standard';

    return {
      voiceURI: v.voiceURI || v.name,
      name: v.name,
      lang: v.lang,
      isNatural,
      isCloud: false,
      isRobotic,
      flag,
      badge,
      rawVoice: v
    };
  });

  // Sort browser voices: Natural first, UK first, then others
  mappedBrowserVoices.sort((a, b) => {
    if (a.isNatural && !b.isNatural) return -1;
    if (!a.isNatural && b.isNatural) return 1;
    if (a.isRobotic && !b.isRobotic) return 1;
    if (!a.isRobotic && b.isRobotic) return -1;

    const aIsUK = a.lang.replace('_', '-').toLowerCase().startsWith('en-gb');
    const bIsUK = b.lang.replace('_', '-').toLowerCase().startsWith('en-gb');
    if (aIsUK && !bIsUK) return -1;
    if (!aIsUK && bIsUK) return 1;

    return a.name.localeCompare(b.name);
  });

  // Combine Cloud Natural Voices at the very top, followed by browser voices
  return [...CLOUD_NATURAL_VOICES, ...mappedBrowserVoices];
}

/**
 * Find best matching browser voice for fallback
 */
export function resolveVoice(customURI?: string): SpeechSynthesisVoice | null {
  const voices = getBrowserVoices();
  if (voices.length === 0) return null;

  // 1. Check custom URI from settings if it's a browser voice
  if (customURI && !customURI.startsWith('cloud-')) {
    const found = voices.find(v => v.voiceURI === customURI || v.name === customURI);
    if (found) return found;
  }

  // 2. Check stored settings
  const stored = loadVoiceSettings();
  if (stored.voiceURI && !stored.voiceURI.startsWith('cloud-')) {
    const found = voices.find(v => v.voiceURI === stored.voiceURI || v.name === stored.voiceName);
    if (found) return found;
  }

  const isUS = customURI === 'cloud-natural-us' || stored.voiceURI === 'cloud-natural-us';
  const isAU = customURI === 'cloud-natural-au' || stored.voiceURI === 'cloud-natural-au';

  if (isUS) {
    const usNatural = 
      voices.find(v => (v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Google') || v.name.includes('Jenny') || v.name.includes('Guy') || v.name.includes('Aria') || v.name.includes('Samantha')) && v.lang.replace('_', '-').toLowerCase().startsWith('en-us')) ||
      voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('en-us'));
    if (usNatural) return usNatural;
  }

  if (isAU) {
    const auNatural = 
      voices.find(v => (v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Natasha') || v.name.includes('William') || v.name.includes('Karen')) && v.lang.replace('_', '-').toLowerCase().startsWith('en-au')) ||
      voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('en-au'));
    if (auNatural) return auNatural;
  }

  // 3. Fallback to British English natural/enhanced voice (Examiner standard)
  const ukNatural = 
    voices.find(v => (v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Google') || v.name.includes('Ryan') || v.name.includes('Sonia') || v.name.includes('Libby') || v.name.includes('Oliver') || v.name.includes('Serena') || v.name.includes('Daniel') || v.name.includes('George')) && v.lang.replace('_', '-').toLowerCase().startsWith('en-gb')) ||
    voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('en-gb')) ||
    voices.find(v => (v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Google') || v.name.includes('Jenny') || v.name.includes('Samantha')) && v.lang.replace('_', '-').toLowerCase().startsWith('en-us')) ||
    voices.find(v => v.lang.toLowerCase().startsWith('en'));

  return ukNatural || null;
}

/* ------------------------------------------------------------------ */
/* Audio Playback Engine (Cloud Studio HD + Web Speech Synthesis)      */
/* ------------------------------------------------------------------ */

let currentSpeechSessionId = 0;
let currentAudioElement: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;
let currentTtsAbortController: AbortController | null = null;
let ttsAnalyserRaf: number | null = null;
let isCloudAudioCancelled = false;
/** Module-level anchor prevents Chrome/Edge from garbage-collecting active utterances mid-speech! */
let activeUtterances: SpeechSynthesisUtterance[] = [];
let speechStartTimer: ReturnType<typeof setTimeout> | null = null;
let speechCancelDelayTimer: ReturnType<typeof setTimeout> | null = null;
let lastSpeechCancelAt = 0;
let audioUnlocked = false;
let decodeEnvelopeCtx: AudioContext | null = null;

// 44-byte valid silent 8kHz mono PCM WAV used once on first user gesture to unlock HTMLAudioElement autoplay
const SILENT_UNLOCK_WAV_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

const cloudNaturalAudioCache = new Map<string, Blob>();
const MAX_CLOUD_NATURAL_CACHE = 48;

function isStaticHostWithoutTtsProxy(): boolean {
  if (typeof window === 'undefined') return false;
  const host = (window.location.hostname || '').toLowerCase();
  return host.endsWith('.github.io') || host.endsWith('.pages.dev');
}

function cleanupTtsAnalyser(): void {
  if (ttsAnalyserRaf !== null) {
    cancelAnimationFrame(ttsAnalyserRaf);
    ttsAnalyserRaf = null;
  }
}

function clearSpeechTimers(): void {
  if (speechStartTimer) {
    clearTimeout(speechStartTimer);
    speechStartTimer = null;
  }
  if (speechCancelDelayTimer) {
    clearTimeout(speechCancelDelayTimer);
    speechCancelDelayTimer = null;
  }
}

/**
 * Call inside a user gesture (Orb tap / Speak click / Send) to warm up HTMLAudioElement & SpeechSynthesis
 * so subsequent async/hands-free AI replies are never silently blocked by browser autoplay policy.
 */
export function unlockAudioOutput(): void {
  if (typeof window === 'undefined') return;
  if (!audioUnlocked) {
    audioUnlocked = true;
    try {
      const silentAudio = new Audio(SILENT_UNLOCK_WAV_URI);
      silentAudio.volume = 0.01;
      const p = silentAudio.play();
      if (p !== undefined) {
        p.then(() => {
          silentAudio.pause();
        }).catch(() => {
          audioUnlocked = false;
        });
      }
    } catch {
      audioUnlocked = false;
    }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx && !decodeEnvelopeCtx) {
        decodeEnvelopeCtx = new AudioCtx();
      }
      if (decodeEnvelopeCtx && decodeEnvelopeCtx.state === 'suspended') {
        decodeEnvelopeCtx.resume().catch(() => {});
      }
    } catch {}
  }
  if ('speechSynthesis' in window) {
    try {
      getBrowserVoices();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}
  }
}

// Automatically unlock audio output on the first pointer/key/touch gesture anywhere in the app
if (typeof window !== 'undefined') {
  const autoUnlock = () => {
    unlockAudioOutput();
    if (audioUnlocked) {
      window.removeEventListener('pointerdown', autoUnlock);
      window.removeEventListener('keydown', autoUnlock);
      window.removeEventListener('touchstart', autoUnlock);
    }
  };
  window.addEventListener('pointerdown', autoUnlock, { passive: true });
  window.addEventListener('keydown', autoUnlock, { passive: true });
  window.addEventListener('touchstart', autoUnlock, { passive: true });
}

export function stopAllSpeech(): void {
  // Immediately invalidate any active or queued speech sessions
  currentSpeechSessionId++;
  isCloudAudioCancelled = true;
  clearSpeechTimers();
  cleanupTtsAnalyser();
  activeUtterances = [];

  if (currentTtsAbortController) {
    try { currentTtsAbortController.abort(); } catch {}
    currentTtsAbortController = null;
  }

  if (currentAudioElement) {
    try {
      // Detach listeners before pausing/clearing src to prevent triggering onerror/onended
      currentAudioElement.onplay = null;
      currentAudioElement.onended = null;
      currentAudioElement.onerror = null;
      currentAudioElement.onstalled = null;
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement.removeAttribute('src');
      currentAudioElement.load();
    } catch {}
    currentAudioElement = null;
  }

  if (currentBlobUrl) {
    try { URL.revokeObjectURL(currentBlobUrl); } catch {}
    currentBlobUrl = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      // NEVER call speechSynthesis.pause() here — in Chrome/Edge on Windows it leaves
      // the speech queue stuck paused and causes subsequent speak() calls to play silently!
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        lastSpeechCancelAt = Date.now();
        window.speechSynthesis.cancel();
      } else if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}
  }
}

export const stopSpeech = stopAllSpeech;

/**
 * Split text into fluent sentence/clause chunks suitable for Google TTS API (< 160 chars)
 * Uses standard regex without lookbehind for universal browser compatibility.
 */
function splitIntoAudioChunks(text: string, maxLen: number = 160): string[] {
  // Universally compatible sentence extraction without regex lookbehind
  const rawSentences = text.match(/[^.!?\n]+[.!?]?/g) || [text];
  const chunks: string[] = [];

  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxLen) {
      chunks.push(trimmed);
    } else {
      const subClauses = trimmed.match(/[^,;:\-]+[,;:\-]?/g) || [trimmed];
      let currentSub = '';

      for (const clause of subClauses) {
        if ((currentSub + ' ' + clause).trim().length <= maxLen) {
          currentSub = (currentSub + ' ' + clause).trim();
        } else {
          if (currentSub) chunks.push(currentSub);
          if (clause.length <= maxLen) {
            currentSub = clause;
          } else {
            const words = clause.split(/\s+/);
            let wordSub = '';
            for (const w of words) {
              if ((wordSub + ' ' + w).trim().length <= maxLen) {
                wordSub = (wordSub + ' ' + w).trim();
              } else {
                if (wordSub) chunks.push(wordSub);
                wordSub = w;
              }
            }
            if (wordSub) currentSub = wordSub;
          }
        }
      }
      if (currentSub) chunks.push(currentSub);
    }
  }

  return chunks;
}

function playNaturalCloudSpeech(
  text: string,
  voiceURI: string,
  options: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): void {
  if (isStaticHostWithoutTtsProxy()) {
    playBrowserSpeech(text, voiceURI, options);
    return;
  }

  const sessionId = ++currentSpeechSessionId;
  isCloudAudioCancelled = false;

  let lang = 'en-GB';
  if (voiceURI === 'cloud-natural-us') lang = 'en-US';
  else if (voiceURI === 'cloud-natural-au') lang = 'en-AU';

  const chunks = splitIntoAudioChunks(text, 160);
  if (chunks.length === 0) {
    options.onEnd?.();
    return;
  }

  const storedSettings = loadVoiceSettings();
  const effectiveRate = options.rate ?? storedSettings.rate ?? 0.95;

  let currentChunkIdx = 0;

  const playChunk = async () => {
    // If user cancelled, recording started, or session superseded, bail immediately
    if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled || currentChunkIdx >= chunks.length) {
      if (currentAudioElement) {
        currentAudioElement.onplay = null;
        currentAudioElement.onended = null;
        currentAudioElement.onerror = null;
        currentAudioElement = null;
      }
      if (!isCloudAudioCancelled && sessionId === currentSpeechSessionId) {
        options.onEnd?.();
      }
      return;
    }

    const chunk = chunks[currentChunkIdx++];
    const cacheKey = `${lang}|${chunk}`;
    let blob = cloudNaturalAudioCache.get(cacheKey) || null;

    const triggerBrowserFallback = () => {
      if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
      clearSpeechTimers();
      const remainingText = chunks.slice(currentChunkIdx - 1).join(' ');
      playBrowserSpeech(remainingText, voiceURI, options);
    };

    if (!blob) {
      let url = `/api/tts?tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(chunk)}`;
      if (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null') {
        url = `${window.location.origin}/api/tts?tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(chunk)}`;
      }
      const controller = new AbortController();
      currentTtsAbortController = controller;
      const fetchTimer = setTimeout(() => controller.abort(), 4200);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(fetchTimer);
        if (currentTtsAbortController === controller) currentTtsAbortController = null;
        if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (!res.ok || !ct.includes('audio')) {
          triggerBrowserFallback();
          return;
        }
        const fetchedBlob = await res.blob();
        if (!fetchedBlob || fetchedBlob.size < 128) {
          triggerBrowserFallback();
          return;
        }
        blob = fetchedBlob;
        if (cloudNaturalAudioCache.size >= MAX_CLOUD_NATURAL_CACHE) {
          const oldest = cloudNaturalAudioCache.keys().next().value;
          if (oldest) cloudNaturalAudioCache.delete(oldest);
        }
        cloudNaturalAudioCache.set(cacheKey, blob);
      } catch {
        clearTimeout(fetchTimer);
        if (currentTtsAbortController === controller) currentTtsAbortController = null;
        if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
        triggerBrowserFallback();
        return;
      }
    }

    if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled || !blob) return;

    const blobUrl = URL.createObjectURL(blob);
    currentBlobUrl = blobUrl;

    const audio = new Audio();
    audio.volume = 1.0;
    audio.muted = false;
    audio.preload = 'auto';
    audio.src = blobUrl;
    currentAudioElement = audio;

    if (effectiveRate && effectiveRate !== 1.0) {
      audio.playbackRate = Math.max(0.7, Math.min(1.4, effectiveRate));
    }

    let fallbackTriggered = false;
    const safeFallback = () => {
      if (fallbackTriggered || sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
      fallbackTriggered = true;
      if (currentBlobUrl === blobUrl) {
        try { URL.revokeObjectURL(blobUrl); } catch {}
        currentBlobUrl = null;
      }
      if (currentAudioElement === audio) currentAudioElement = null;
      triggerBrowserFallback();
    };

    audio.onplay = () => {
      if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) {
        audio.pause();
        return;
      }
      clearSpeechTimers();
      if (currentChunkIdx === 1) {
        options.onStart?.();
      }
    };

    audio.onended = () => {
      clearSpeechTimers();
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;
      if (currentBlobUrl === blobUrl) {
        try { URL.revokeObjectURL(blobUrl); } catch {}
        currentBlobUrl = null;
      }
      if (currentAudioElement === audio) currentAudioElement = null;
      if (sessionId === currentSpeechSessionId && !isCloudAudioCancelled) {
        void playChunk();
      }
    };

    audio.onerror = () => {
      safeFallback();
    };

    try {
      await audio.play();
    } catch (err: any) {
      if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
      if (err && (err.name === 'AbortError' || err.message?.includes('interrupted') || err.message?.includes('pause'))) {
        return;
      }
      safeFallback();
    }
  };

  void playChunk();
}

function resolveGuaranteedLocalVoice(): SpeechSynthesisVoice | null {
  const voices = getBrowserVoices();
  return (
    voices.find(v => v.localService && v.lang.replace('_', '-').toLowerCase().startsWith('en-gb')) ||
    voices.find(v => v.localService && v.lang.replace('_', '-').toLowerCase().startsWith('en-us')) ||
    voices.find(v => v.localService && v.lang.toLowerCase().startsWith('en')) ||
    voices.find(v => v.lang.toLowerCase().startsWith('en')) ||
    null
  );
}

function playBrowserSpeech(
  text: string,
  voiceURI: string,
  options: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  },
  forceLocalOnly: boolean = false
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onError?.(new Error('Speech synthesis not supported'));
    return;
  }

  const sessionId = ++currentSpeechSessionId;
  isCloudAudioCancelled = false;
  clearSpeechTimers();
  activeUtterances = [];

  const chunks = splitIntoAudioChunks(text, 180);
  if (chunks.length === 0) {
    options.onEnd?.();
    return;
  }

  const storedSettings = loadVoiceSettings();
  const effectiveRate = options.rate ?? storedSettings.rate ?? 0.94;
  const effectivePitch = options.pitch ?? storedSettings.pitch ?? 1.0;

  // Only cancel if speechSynthesis is actively speaking/pending, and wait 65ms after any cancel()
  // so Chromium's async cancel IPC NEVER swallows our newly queued utterance!
  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      lastSpeechCancelAt = Date.now();
      window.speechSynthesis.cancel();
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {}

  let chunkIdx = 0;

  const speakNextChunk = () => {
    if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
    if (chunkIdx >= chunks.length) {
      activeUtterances = [];
      options.onEnd?.();
      return;
    }

    const partText = chunks[chunkIdx++];
    const utterance = new SpeechSynthesisUtterance(partText);
    utterance.rate = effectiveRate;
    utterance.pitch = effectivePitch;
    utterance.volume = 1.0;

    const chosenVoice = forceLocalOnly
      ? resolveGuaranteedLocalVoice()
      : resolveVoice(voiceURI || storedSettings.voiceURI);

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    } else {
      utterance.lang = 'en-GB';
    }

    // Anchor utterance in module array so Chrome NEVER garbage-collects it mid-sentence!
    activeUtterances = [utterance];

    let started = false;

    // Watchdog: if a remote browser voice (e.g. Google UK) stalls silently for >1.9s,
    // automatically retry with a guaranteed local OS voice so the user ALWAYS hears audio!
    clearSpeechTimers();
    speechStartTimer = setTimeout(() => {
      if (!started && sessionId === currentSpeechSessionId && !isCloudAudioCancelled) {
        if (!forceLocalOnly) {
          const remaining = chunks.slice(chunkIdx - 1).join(' ');
          playBrowserSpeech(remaining, voiceURI, options, true);
        } else {
          // Even local voice failed to start — cleanly exit Speaking state so orb never hangs!
          activeUtterances = [];
          try { window.speechSynthesis.cancel(); } catch {}
          options.onError?.(new Error('Browser speech failed to start'));
        }
      }
    }, 1900);

    utterance.onstart = () => {
      if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) {
        try { window.speechSynthesis.cancel(); } catch {}
        return;
      }
      started = true;
      clearSpeechTimers();
      if (chunkIdx === 1) {
        options.onStart?.();
      }
    };

    utterance.onend = () => {
      clearSpeechTimers();
      if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
      speakNextChunk();
    };

    utterance.onerror = (e) => {
      clearSpeechTimers();
      if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
      if (e.error === 'canceled' || e.error === 'interrupted') {
        return;
      }
      // If a remote Google voice errored (e.g. synthesis-failed / network), retry with local OS voice!
      if (!forceLocalOnly) {
        const remaining = chunks.slice(chunkIdx - 1).join(' ');
        playBrowserSpeech(remaining, voiceURI, options, true);
        return;
      }
      activeUtterances = [];
      options.onError?.(e);
    };

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      clearSpeechTimers();
      options.onError?.(err);
    }
  };

  const elapsedSinceCancel = Date.now() - lastSpeechCancelAt;
  const settleWaitMs = elapsedSinceCancel < 70 ? 70 - elapsedSinceCancel : 0;
  if (settleWaitMs > 0) {
    speechCancelDelayTimer = setTimeout(() => {
      if (sessionId === currentSpeechSessionId && !isCloudAudioCancelled) {
        speakNextChunk();
      }
    }, settleWaitMs);
  } else {
    speakNextChunk();
  }
}

export function playSpeech(
  text: string,
  options: {
    voiceURI?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
): void {
  stopAllSpeech();

  const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
  if (!cleanText) {
    options.onEnd?.();
    return;
  }

  const storedSettings = loadVoiceSettings();
  const selectedVoiceURI = options.voiceURI || storedSettings.voiceURI || 'cloud-natural-uk';

  // 1. Cloud Studio HD Natural Voice
  if (selectedVoiceURI.startsWith('cloud-natural')) {
    playNaturalCloudSpeech(cleanText, selectedVoiceURI, options);
    return;
  }

  // 2. Local Browser SpeechSynthesis Voice
  playBrowserSpeech(cleanText, selectedVoiceURI, options);
}

export type EnglishAccent = 'en-GB' | 'en-US' | 'en-AU';

export function playPronunciation(
  text: string, 
  options: {
    accent?: EnglishAccent;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
): void {
  const voiceURI = options.accent === 'en-US' 
    ? 'cloud-natural-us' 
    : options.accent === 'en-AU' 
    ? 'cloud-natural-au' 
    : 'cloud-natural-uk';

  playSpeech(text, {
    voiceURI,
    rate: options.rate,
    pitch: options.pitch,
    onStart: options.onStart,
    onEnd: options.onEnd,
    onError: options.onError,
  });
}

/* ------------------------------------------------------------------ */
/* Primary Voice Engine · Free Unlimited Edge Neural HD Voices         */
/* ------------------------------------------------------------------ */

export type FreeNeuralVoiceName =
  | 'en-US-AvaMultilingualNeural'
  | 'en-US-EmmaMultilingualNeural'
  | 'en-US-AndrewMultilingualNeural'
  | 'en-GB-SoniaNeural'
  | 'en-GB-RyanNeural'
  | 'en-AU-NatashaNeural';

export interface BuddyVoiceConfig {
  provider: 'kokoro' | 'neural-free' | 'standard';
  kokoroVoice: KokoroVoiceId;
  freeNeuralVoice: FreeNeuralVoiceName;
  osVoiceURI?: string;
  rate: number;
}

export const FREE_NEURAL_VOICES: Array<{
  id: FreeNeuralVoiceName;
  label: string;
  trait: string;
}> = [
  { id: 'en-US-AvaMultilingualNeural', label: 'Ava (US)', trait: 'Bright & Friendly' },
  { id: 'en-US-EmmaMultilingualNeural', label: 'Emma (US)', trait: 'Cheerful & Playful' },
  { id: 'en-US-AndrewMultilingualNeural', label: 'Andrew (US)', trait: 'Warm & Casual' },
  { id: 'en-GB-SoniaNeural', label: 'Sonia (UK)', trait: 'Natural British' },
  { id: 'en-GB-RyanNeural', label: 'Ryan (UK)', trait: 'Friendly British' },
  { id: 'en-AU-NatashaNeural', label: 'Natasha (AU)', trait: 'Upbeat Australian' }
];

const BUDDY_VOICE_CONFIG_KEY = 'lingo_buddy_voice_config_v1';

export const DEFAULT_BUDDY_VOICE_CONFIG: BuddyVoiceConfig = {
  provider: 'neural-free',
  kokoroVoice: 'af_heart',
  freeNeuralVoice: 'en-US-AvaMultilingualNeural',
  osVoiceURI: '',
  rate: 1.0
};

export function loadBuddyVoiceConfig(): BuddyVoiceConfig {
  if (typeof window === 'undefined') return DEFAULT_BUDDY_VOICE_CONFIG;
  try {
    const raw = localStorage.getItem(BUDDY_VOICE_CONFIG_KEY);
    if (!raw) return DEFAULT_BUDDY_VOICE_CONFIG;
    const parsed = JSON.parse(raw);
    const resolvedProvider: 'kokoro' | 'neural-free' | 'standard' =
      parsed.provider === 'kokoro'
        ? 'kokoro'
        : parsed.provider === 'standard'
        ? 'standard'
        : 'neural-free';
    return {
      provider: resolvedProvider,
      kokoroVoice: KOKORO_NATURAL_VOICES.some(v => v.id === parsed.kokoroVoice)
        ? parsed.kokoroVoice
        : DEFAULT_BUDDY_VOICE_CONFIG.kokoroVoice,
      freeNeuralVoice: FREE_NEURAL_VOICES.some(v => v.id === parsed.freeNeuralVoice)
        ? parsed.freeNeuralVoice
        : DEFAULT_BUDDY_VOICE_CONFIG.freeNeuralVoice,
      osVoiceURI: typeof parsed.osVoiceURI === 'string' ? parsed.osVoiceURI : '',
      rate:
        typeof parsed.rate === 'number' && parsed.rate >= 0.75 && parsed.rate <= 1.3
          ? parsed.rate
          : 1.0
    };
  } catch {
    return DEFAULT_BUDDY_VOICE_CONFIG;
  }
}

export function saveBuddyVoiceConfig(config: BuddyVoiceConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BUDDY_VOICE_CONFIG_KEY, JSON.stringify(config));
  } catch {}
}

/** In-memory LRU cache so "Listen again" replays instantly in 0ms */
const freeNeuralAudioCache = new Map<string, Blob>();
const MAX_NEURAL_TTS_CACHE = 32;

/**
 * Safe Non-Invasive Audio Waveform Envelope Monitor:
 * NEVER calls `AudioContext.createMediaElementSource(audio)`!
 * Creating a `MediaElementAudioSourceNode` inside an async `onplay` callback detaches `<audio>`
 * from native speaker output and mutes it completely whenever the AudioContext is suspended.
 * Instead, `<audio>` ALWAYS outputs directly to OS speakers while we read decoded RMS buckets
 * from a passive copy of the Blob buffer (with smooth prosody fallback).
 */
function startSafeAudioLevelMonitor(
  audio: HTMLAudioElement,
  blob: Blob | null,
  onAudioLevel?: (level: number) => void
): void {
  if (!onAudioLevel || typeof window === 'undefined') return;
  cleanupTtsAnalyser();

  let rmsBuckets: Float32Array | null = null;
  const bucketHz = 50; // 20ms resolution

  if (blob) {
    blob
      .arrayBuffer()
      .then(async (buf) => {
        if (currentAudioElement !== audio) return;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        if (!decodeEnvelopeCtx || decodeEnvelopeCtx.state === 'closed') {
          decodeEnvelopeCtx = new AudioCtx();
        }
        const decoded = await decodeEnvelopeCtx.decodeAudioData(buf.slice(0));
        if (currentAudioElement !== audio) return;
        const ch = decoded.getChannelData(0);
        const samplesPerBucket = Math.max(1, Math.floor(decoded.sampleRate / bucketHz));
        const totalBuckets = Math.ceil(ch.length / samplesPerBucket);
        const env = new Float32Array(totalBuckets);
        for (let b = 0; b < totalBuckets; b++) {
          const start = b * samplesPerBucket;
          const end = Math.min(ch.length, start + samplesPerBucket);
          let sumSq = 0;
          for (let i = start; i < end; i++) {
            sumSq += ch[i] * ch[i];
          }
          const rms = Math.sqrt(sumSq / Math.max(1, end - start));
          env[b] = Math.min(100, Math.round(rms * 380));
        }
        rmsBuckets = env;
      })
      .catch(() => {
        // Fallback cadence envelope below handles animation automatically
      });
  }

  const startedAt = performance.now();
  const tick = () => {
    if (currentAudioElement !== audio || audio.paused || audio.ended) {
      onAudioLevel(0);
      return;
    }
    if (rmsBuckets && rmsBuckets.length > 0) {
      const idx = Math.min(
        rmsBuckets.length - 1,
        Math.max(0, Math.floor(audio.currentTime * bucketHz))
      );
      onAudioLevel(rmsBuckets[idx]);
    } else {
      const t = (performance.now() - startedAt) / 1000;
      const synthetic = Math.round(
        38 + 26 * Math.abs(Math.sin(t * 7.5)) + 16 * Math.abs(Math.cos(t * 13.2))
      );
      onAudioLevel(synthetic);
    }
    ttsAnalyserRaf = requestAnimationFrame(tick);
  };
  ttsAnalyserRaf = requestAnimationFrame(tick);
}

function synthesizeKokoroWithTimeout(
  text: string,
  voice: KokoroVoiceId,
  rate: number,
  signal: AbortSignal,
  timeoutMs: number,
  onFirstByte?: (delivery: 'neural-stream' | 'neural-cache') => void
): Promise<Blob | null> {
  return new Promise<Blob | null>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(null);
    }, timeoutMs);

    synthesizeKokoroWavBlob(text, voice, rate, signal, onFirstByte)
      .then((blob) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(blob);
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(null);
      });
  });
}

/**
 * Play 100% Free Unlimited Microsoft Edge Neural HD Voices (Ava, Emma, Andrew, Sonia, Ryan, Natasha)
 * with live Orb waveform sync & seamless Browser TTS fallback if `/api/neural-tts` is unavailable.
 */
export async function playFreeNeuralSpeech(
  text: string,
  options: {
    voice?: FreeNeuralVoiceName;
    rate?: number;
    strictNoFallback?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    onAudioLevel?: (level: number) => void;
  } = {}
): Promise<void> {
  stopAllSpeech();

  const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
  if (!cleanText) {
    options.onEnd?.();
    return;
  }

  const voice: FreeNeuralVoiceName = options.voice || 'en-US-AvaMultilingualNeural';
  const effectiveRate = Math.max(0.75, Math.min(1.3, options.rate ?? 1.0));
  const ratePctNum = Math.round((effectiveRate - 1.0) * 100);
  const rateParam = `${ratePctNum >= 0 ? '+' : ''}${ratePctNum}%`;

  const sessionId = ++currentSpeechSessionId;
  isCloudAudioCancelled = false;

  const fallbackToBrowser = (errMsg?: string) => {
    if (options.strictNoFallback) {
      options.onError?.(new Error(errMsg || 'Edge Neural HD audio stream unavailable.'));
      return;
    }
    playSpeech(cleanText, {
      rate: effectiveRate,
      onStart: options.onStart,
      onEnd: options.onEnd,
      onError: options.onError
    });
  };

  const cacheKey = `${voice}|${rateParam}|${cleanText}`;
  const cachedBlob = freeNeuralAudioCache.get(cacheKey) || null;

  if (!cachedBlob && isStaticHostWithoutTtsProxy()) {
    fallbackToBrowser('Edge Neural proxy is local-server only on static GitHub Pages.');
    return;
  }

  let streamUrl = `/api/neural-tts?voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(
    rateParam
  )}&q=${encodeURIComponent(cleanText)}`;
  if (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null') {
    streamUrl = `${window.location.origin}${streamUrl}`;
  }

  // Play cached Blob in 0ms if available; otherwise point `<audio>` directly at `/api/neural-tts`
  // so progressive HTTP MP3 playback starts as soon as the FIRST ~2KB frames arrive (zero full-body wait!)
  const blobUrl = cachedBlob ? URL.createObjectURL(cachedBlob) : null;
  if (blobUrl) currentBlobUrl = blobUrl;

  const audio = new Audio();
  audio.volume = 1.0;
  audio.muted = false;
  audio.preload = 'auto';
  audio.src = blobUrl || streamUrl;
  currentAudioElement = audio;

  let hasStartedPlaying = false;
  let fallbackFired = false;
  const triggerSafeFallback = (msg?: string) => {
    if (fallbackFired || sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
    fallbackFired = true;
    clearSpeechTimers();
    cleanupTtsAnalyser();
    options.onAudioLevel?.(0);
    try {
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute('src');
    } catch {}
    if (blobUrl && currentBlobUrl === blobUrl) {
      try { URL.revokeObjectURL(blobUrl); } catch {}
      currentBlobUrl = null;
    }
    if (currentAudioElement === audio) currentAudioElement = null;
    fallbackToBrowser(msg);
  };

  if (!cachedBlob) {
    clearSpeechTimers();
    speechStartTimer = setTimeout(() => {
      if (!hasStartedPlaying) {
        triggerSafeFallback('Edge Neural HD stream timed out.');
      }
    }, 3600);
  }

  audio.onplay = () => {
    if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) {
      audio.pause();
      return;
    }
    hasStartedPlaying = true;
    clearSpeechTimers();
    startSafeAudioLevelMonitor(audio, cachedBlob, options.onAudioLevel);
    options.onStart?.();
  };

  audio.onended = () => {
    clearSpeechTimers();
    cleanupTtsAnalyser();
    options.onAudioLevel?.(0);
    if (blobUrl && currentBlobUrl === blobUrl) {
      try { URL.revokeObjectURL(blobUrl); } catch {}
      currentBlobUrl = null;
    }
    if (currentAudioElement === audio) currentAudioElement = null;
    if (sessionId === currentSpeechSessionId && !isCloudAudioCancelled) {
      options.onEnd?.();
    }
  };

  audio.onerror = () => {
    triggerSafeFallback();
  };

  try {
    await audio.play();
  } catch (err: any) {
    if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
    if (err && (err.name === 'AbortError' || err.message?.includes('interrupted'))) return;
    triggerSafeFallback(err?.message);
  }
}

/**
 * Play Kokoro-82M Natural Local Neural Voices (Heart, Bella, Nicole, Sarah, Michael, Emma UK, George UK, etc.)
 * via WebGPU / WASM background worker with live Crystal Orb waveform sync!
 */
export async function playKokoroSpeech(
  text: string,
  options: {
    voice?: KokoroVoiceId;
    fallbackEdgeVoice?: FreeNeuralVoiceName;
    rate?: number;
    strictNoFallback?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    onAudioLevel?: (level: number) => void;
  } = {}
): Promise<void> {
  stopAllSpeech();

  const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
  if (!cleanText) {
    options.onEnd?.();
    return;
  }

  const voice: KokoroVoiceId = options.voice || 'af_heart';
  const effectiveRate = Math.max(0.75, Math.min(1.3, options.rate ?? 1.0));
  const sessionId = ++currentSpeechSessionId;
  isCloudAudioCancelled = false;

  const controller = new AbortController();
  currentTtsAbortController = controller;

  const handleFallback = (reason?: string) => {
    if (options.strictNoFallback) {
      options.onError?.(new Error(reason || 'Kokoro-82M voice failed to synthesize.'));
      return;
    }
    void playFreeNeuralSpeech(cleanText, {
      voice: options.fallbackEdgeVoice || 'en-US-AvaMultilingualNeural',
      rate: effectiveRate,
      onStart: options.onStart,
      onEnd: options.onEnd,
      onError: options.onError,
      onAudioLevel: options.onAudioLevel
    });
  };

  // In normal conversation (non-strict), if Kokoro weights haven't finished downloading yet,
  // warm Kokoro in the background and immediately speak via Edge Neural HD so Buddy is NEVER mute!
  if (!options.strictNoFallback && getKokoroStatus().state !== 'ready') {
    warmUpKokoroTts();
    handleFallback('Kokoro-82M is still warming up in the background.');
    return;
  }

  const wavBlob = options.strictNoFallback
    ? await synthesizeKokoroWavBlob(cleanText, voice, effectiveRate, controller.signal)
    : await synthesizeKokoroWithTimeout(cleanText, voice, effectiveRate, controller.signal, 5500);
  if (currentTtsAbortController === controller) currentTtsAbortController = null;
  if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;

  if (!wavBlob) {
    handleFallback('Kokoro-82M model could not be loaded on this browser/network.');
    return;
  }

  const blobUrl = URL.createObjectURL(wavBlob);
  currentBlobUrl = blobUrl;

  const audio = new Audio();
  audio.volume = 1.0;
  audio.muted = false;
  audio.preload = 'auto';
  audio.src = blobUrl;
  currentAudioElement = audio;

  audio.onplay = () => {
    if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) {
      audio.pause();
      return;
    }
    startSafeAudioLevelMonitor(audio, wavBlob, options.onAudioLevel);
    options.onStart?.();
  };

  audio.onended = () => {
    cleanupTtsAnalyser();
    options.onAudioLevel?.(0);
    if (currentBlobUrl === blobUrl) {
      try { URL.revokeObjectURL(blobUrl); } catch {}
      currentBlobUrl = null;
    }
    if (currentAudioElement === audio) currentAudioElement = null;
    if (sessionId === currentSpeechSessionId && !isCloudAudioCancelled) {
      options.onEnd?.();
    }
  };

  audio.onerror = () => {
    cleanupTtsAnalyser();
    options.onAudioLevel?.(0);
    if (currentBlobUrl === blobUrl) {
      try { URL.revokeObjectURL(blobUrl); } catch {}
      currentBlobUrl = null;
    }
    if (sessionId === currentSpeechSessionId && !isCloudAudioCancelled) {
      handleFallback('Audio playback error.');
    }
  };

  try {
    await audio.play();
  } catch (err: any) {
    if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
    if (err && (err.name === 'AbortError' || err.message?.includes('interrupted'))) return;
    handleFallback(err?.message);
  }
}

/* ------------------------------------------------------------------ */
/* Real-Time Pipelined Sentence TTS Queue (Zero-Gap Streaming Speech)  */
/* Pre-fetches sentence N+1 while sentence N plays aloud!              */
/* ------------------------------------------------------------------ */

async function fetchFreeNeuralAudioBlob(
  text: string,
  voice: FreeNeuralVoiceName,
  rate: number,
  signal: AbortSignal,
  onFirstByte?: (delivery: 'neural-stream' | 'neural-cache') => void
): Promise<Blob | null> {
  const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
  if (!cleanText || isStaticHostWithoutTtsProxy()) return null;
  const ratePctNum = Math.round((Math.max(0.75, Math.min(1.3, rate)) - 1.0) * 100);
  const rateParam = `${ratePctNum >= 0 ? '+' : ''}${ratePctNum}%`;
  const cacheKey = `${voice}|${rateParam}|${cleanText}`;
  const cached = freeNeuralAudioCache.get(cacheKey);
  if (cached) {
    onFirstByte?.('neural-cache');
    return cached;
  }

  let url = `/api/neural-tts?voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(
    rateParam
  )}&q=${encodeURIComponent(cleanText)}`;
  if (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null') {
    url = `${window.location.origin}${url}`;
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    if (signal.aborted) return null;
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) continue;
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (!ct.includes('audio')) continue;
      const delivery =
        res.headers.get('x-tts-delivery') === 'memory-cache' ? 'neural-cache' : 'neural-stream';

      let blob: Blob;
      if (res.body && typeof res.body.getReader === 'function') {
        const reader = res.body.getReader();
        const parts: Uint8Array[] = [];
        let gotByte = false;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value && value.byteLength > 0) {
            if (!gotByte) {
              gotByte = true;
              onFirstByte?.(delivery);
            }
            parts.push(value);
          }
        }
        blob = new Blob(parts as unknown as BlobPart[], { type: 'audio/mpeg' });
      } else {
        blob = await res.blob();
        if (blob.size >= 256) onFirstByte?.(delivery);
      }

      if (!blob || blob.size < 256) continue;
      if (freeNeuralAudioCache.size >= MAX_NEURAL_TTS_CACHE) {
        const oldest = freeNeuralAudioCache.keys().next().value;
        if (oldest) freeNeuralAudioCache.delete(oldest);
      }
      freeNeuralAudioCache.set(cacheKey, blob);
      return blob;
    } catch {
      if (signal.aborted) return null;
    }
  }
  return null;
}

/**
 * Pre-warms the server's Edge Neural HD WebSocket pool while the user is speaking or on view mount
 * so `tts_request_start -> tts_first_audio` skips cold TLS/WSS setup!
 */
export function warmUpNeuralTts(voice: FreeNeuralVoiceName = 'en-US-AvaMultilingualNeural'): void {
  if (typeof window === 'undefined' || isStaticHostWithoutTtsProxy()) return;
  let url = `/api/neural-tts?warmup=1&voice=${encodeURIComponent(voice)}`;
  if (window.location.origin && window.location.origin !== 'null') {
    url = `${window.location.origin}${url}`;
  }
  fetch(url, { method: 'GET', keepalive: true }).catch(() => {});
}

export interface RealtimeTtsQueue {
  enqueue: (sentence: string) => void;
  markStreamDone: () => void;
  cancel: () => void;
}

/**
 * Low-Latency Consistent Neural HD TTS Queue:
 *  - Every segment (Segment 0, 1, 2...) uses the warm-pooled `/api/neural-tts` stream (~290ms)
 *    and decodes cleanly as a frame-valid `<audio>` MP3 Blob — preventing Chromium `MediaSource`
 *    mid-MP3-frame split errors that previously caused Segment 0 to fall back to a robotic OS voice!
 *  - Prefetches Segment 1+ in parallel while Segment 0 plays so both sentences use the exact same
 *    Natural Neural HD voice with zero voice switching.
 */
export function createRealtimeTtsQueue(options: {
  voiceConfig: BuddyVoiceConfig;
  onTtsRequestStart?: () => void;
  onTtsFirstAudio?: (delivery: 'neural-stream' | 'neural-cache' | 'browser-speech') => void;
  onFirstStart?: () => void;
  onAllEnd?: () => void;
  onAudioLevel?: (level: number) => void;
}): RealtimeTtsQueue {
  stopAllSpeech();
  const sessionId = ++currentSpeechSessionId;
  isCloudAudioCancelled = false;

  const controller = new AbortController();
  currentTtsAbortController = controller;

  interface QueueItem {
    text: string;
    index: number;
    directStreamOnly: boolean;
    promise: Promise<Blob | null>;
  }

  const items: QueueItem[] = [];
  let playIdx = 0;
  let isPlayingLoop = false;
  let streamDone = false;
  let reqStartedOnce = false;
  let firstAudioOnce = false;
  let startedOnce = false;
  let finishedOnce = false;

  const isAlive = () => sessionId === currentSpeechSessionId && !isCloudAudioCancelled;

  const markReqStart = () => {
    if (!reqStartedOnce) {
      reqStartedOnce = true;
      options.onTtsRequestStart?.();
    }
  };

  const markFirstAudio = (delivery: 'neural-stream' | 'neural-cache' | 'browser-speech') => {
    if (!firstAudioOnce) {
      firstAudioOnce = true;
      options.onTtsFirstAudio?.(delivery);
    }
  };

  const finishIfComplete = () => {
    if (finishedOnce || !isAlive()) return;
    if (streamDone && playIdx >= items.length) {
      finishedOnce = true;
      cleanupTtsAnalyser();
      options.onAudioLevel?.(0);
      options.onAllEnd?.();
    }
  };

  const buildNeuralStreamUrl = (cleanText: string): { url: string; cacheKey: string } => {
    const voice = options.voiceConfig.freeNeuralVoice;
    const rate = options.voiceConfig.rate;
    const ratePctNum = Math.round((Math.max(0.75, Math.min(1.3, rate)) - 1.0) * 100);
    const rateParam = `${ratePctNum >= 0 ? '+' : ''}${ratePctNum}%`;
    const cacheKey = `${voice}|${rateParam}|${cleanText}`;
    let url = `/api/neural-tts?voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(
      rateParam
    )}&q=${encodeURIComponent(cleanText)}`;
    if (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null') {
      url = `${window.location.origin}${url}`;
    }
    return { url, cacheKey };
  };

  /**
   * Plays `/api/neural-tts` progressively via native `<audio>` HTTP chunked streaming
   * so Segment 0 starts speaking as soon as the FIRST ~2KB MP3 frames arrive (~250-380ms!)
   * instead of waiting 2-5s for 100% of the sentence body to finish downloading!
   */
  const playDirectNeuralStreamOnce = (cleanText: string): Promise<boolean> =>
    new Promise((resolve) => {
      if (!isAlive()) {
        resolve(false);
        return;
      }
      const { url, cacheKey } = buildNeuralStreamUrl(cleanText);
      const cached = freeNeuralAudioCache.get(cacheKey);
      if (cached) {
        markFirstAudio('neural-cache');
        void playBlobOnce(cached).then(resolve);
        return;
      }
      if (isStaticHostWithoutTtsProxy()) {
        resolve(false);
        return;
      }

      const audio = new Audio();
      audio.volume = 1.0;
      audio.muted = false;
      audio.preload = 'auto';
      audio.src = url;
      currentAudioElement = audio;

      let settled = false;
      let started = false;

      const finishStream = (ok: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(firstFrameGuard);
        cleanupTtsAnalyser();
        options.onAudioLevel?.(0);
        if (currentAudioElement === audio) {
          if (!ok) {
            try {
              audio.onplay = null;
              audio.onended = null;
              audio.onerror = null;
              audio.pause();
              audio.removeAttribute('src');
            } catch {}
          }
          currentAudioElement = null;
        }
        resolve(ok);
      };

      const firstFrameGuard = setTimeout(() => {
        if (!started) {
          finishStream(false);
        }
      }, 3400);

      audio.onplay = () => {
        if (!isAlive()) {
          audio.pause();
          finishStream(false);
          return;
        }
        started = true;
        clearTimeout(firstFrameGuard);
        markFirstAudio('neural-stream');
        startSafeAudioLevelMonitor(audio, null, options.onAudioLevel);
        if (!startedOnce) {
          startedOnce = true;
          options.onFirstStart?.();
        }
      };

      audio.onended = () => {
        finishStream(true);
      };

      audio.onerror = () => {
        finishStream(false);
      };

      audio.play().catch(() => {
        finishStream(false);
      });
    });

  const playBlobOnce = (blob: Blob): Promise<boolean> =>
    new Promise((resolve) => {
      if (!isAlive()) {
        resolve(false);
        return;
      }
      const blobUrl = URL.createObjectURL(blob);
      currentBlobUrl = blobUrl;

      const audio = new Audio();
      audio.volume = 1.0;
      audio.muted = false;
      audio.preload = 'auto';
      audio.src = blobUrl;
      currentAudioElement = audio;

      const cleanupUrl = () => {
        cleanupTtsAnalyser();
        options.onAudioLevel?.(0);
        if (currentBlobUrl === blobUrl) {
          try { URL.revokeObjectURL(blobUrl); } catch {}
          currentBlobUrl = null;
        }
        if (currentAudioElement === audio) currentAudioElement = null;
      };

      audio.onplay = () => {
        if (!isAlive()) {
          audio.pause();
          cleanupUrl();
          resolve(false);
          return;
        }
        startSafeAudioLevelMonitor(audio, blob, options.onAudioLevel);
        if (!startedOnce) {
          startedOnce = true;
          options.onFirstStart?.();
        }
      };

      audio.onended = () => {
        cleanupUrl();
        resolve(true);
      };

      audio.onerror = () => {
        cleanupUrl();
        resolve(false);
      };

      audio.play().catch(() => {
        cleanupUrl();
        resolve(false);
      });
    });

  const playBrowserOnce = (text: string, forceLocal: boolean = false): Promise<void> =>
    new Promise((resolve) => {
      if (!isAlive() || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const runSpeak = () => {
        if (!isAlive()) {
          resolve();
          return;
        }
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = options.voiceConfig.rate || 1.0;
        utt.volume = 1.0;
        const chosen = forceLocal
          ? resolveGuaranteedLocalVoice()
          : resolveVoice(options.voiceConfig.osVoiceURI || undefined);
        if (chosen) {
          utt.voice = chosen;
          utt.lang = chosen.lang;
        } else {
          utt.lang = 'en-GB';
        }
        activeUtterances = [utt];
        let started = false;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          options.onAudioLevel?.(0);
          resolve();
        };
        const startGuard = setTimeout(() => {
          if (!started && !done && isAlive()) {
            if (!forceLocal) {
              done = true;
              try {
                lastSpeechCancelAt = Date.now();
                window.speechSynthesis.cancel();
              } catch {}
              void playBrowserOnce(text, true).then(resolve);
            } else {
              finish();
            }
          }
        }, 2000);
        const watchdog = setTimeout(() => {
          clearTimeout(startGuard);
          finish();
        }, 14000);
        utt.onstart = () => {
          started = true;
          clearTimeout(startGuard);
          markFirstAudio('browser-speech');
          if (!startedOnce) {
            startedOnce = true;
            options.onFirstStart?.();
          }
          options.onAudioLevel?.(48);
        };
        utt.onend = () => {
          clearTimeout(startGuard);
          clearTimeout(watchdog);
          finish();
        };
        utt.onerror = (e) => {
          clearTimeout(startGuard);
          clearTimeout(watchdog);
          if (!forceLocal && e.error !== 'canceled' && e.error !== 'interrupted' && isAlive()) {
            done = true;
            void playBrowserOnce(text, true).then(resolve);
            return;
          }
          finish();
        };
        try {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
          window.speechSynthesis.speak(utt);
        } catch {
          clearTimeout(startGuard);
          clearTimeout(watchdog);
          finish();
        }
      };

      const elapsed = Date.now() - lastSpeechCancelAt;
      if (elapsed < 70) {
        setTimeout(runSpeak, 70 - elapsed);
      } else {
        runSpeak();
      }
    });

  const waitPauseMs = (ms: number): Promise<void> =>
    new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      controller.signal.addEventListener('abort', () => {
        clearTimeout(t);
        resolve();
      }, { once: true });
    });

  const pump = async () => {
    if (isPlayingLoop) return;
    isPlayingLoop = true;
    try {
      while (isAlive() && playIdx < items.length) {
        const idxNow = playIdx;
        const current = items[playIdx++];
        if (idxNow > 0 && isAlive()) {
          const prevEndedComma = /[,;—]$/.test(items[idxNow - 1]?.text || '');
          await waitPauseMs(prevEndedComma ? 20 : 45);
          if (!isAlive()) return;
        }

        if (options.voiceConfig.provider === 'standard') {
          await playBrowserOnce(current.text);
          continue;
        }

        // Fast-Path Progressive Stream for Segment 0 (starts speaking on first ~2KB MP3 chunk!)
        if (current.directStreamOnly) {
          const streamedOk = await playDirectNeuralStreamOnce(current.text);
          if (!streamedOk && isAlive()) {
            await playBrowserOnce(current.text);
          }
          continue;
        }

        const blob = await current.promise;
        if (!isAlive()) return;
        if (blob) {
          const ok = await playBlobOnce(blob);
          if (!ok && isAlive()) {
            await playBrowserOnce(current.text);
          }
        } else if (isAlive()) {
          // If Kokoro timed out on Segment 0, stream directly via Edge Neural before falling back to OS speech
          const streamedOk = await playDirectNeuralStreamOnce(current.text);
          if (!streamedOk && isAlive()) {
            await playBrowserOnce(current.text);
          }
        }
      }
    } finally {
      isPlayingLoop = false;
      finishIfComplete();
    }
  };

  return {
    enqueue(sentence: string) {
      const clean = sentence.replace(/[*_#`~[\]]/g, '').trim();
      if (!clean || !isAlive()) return;
      markReqStart();
      const idx = items.length;
      const isImmediateHead = idx === playIdx && !isPlayingLoop;

      if (options.voiceConfig.provider === 'standard') {
        items.push({
          text: clean,
          index: idx,
          directStreamOnly: false,
          promise: Promise.resolve(null)
        });
        void pump();
        return;
      }

      if (options.voiceConfig.provider === 'kokoro') {
        if (getKokoroStatus().state !== 'ready') {
          warmUpKokoroTts();
          if (isImmediateHead) {
            items.push({
              text: clean,
              index: idx,
              directStreamOnly: true,
              promise: Promise.resolve(null)
            });
          } else {
            items.push({
              text: clean,
              index: idx,
              directStreamOnly: false,
              promise: fetchFreeNeuralAudioBlob(
                clean,
                options.voiceConfig.freeNeuralVoice,
                options.voiceConfig.rate,
                controller.signal
              )
            });
          }
          void pump();
          return;
        }

        items.push({
          text: clean,
          index: idx,
          directStreamOnly: false,
          promise: synthesizeKokoroWithTimeout(
            clean,
            options.voiceConfig.kokoroVoice,
            options.voiceConfig.rate,
            controller.signal,
            isImmediateHead ? 2400 : 4500,
            idx === 0 ? (d) => markFirstAudio(d) : undefined
          )
        });
        void pump();
        return;
      }

      // Edge Neural HD ('neural-free'):
      //  - Immediate head segment (`idx === 0` or empty queue) streams progressively via `<audio src>` (0 buffering wait!)
      //  - Subsequent segments (`idx >= 1`) prefetch full MP3 Blobs in parallel while Segment 0 plays aloud!
      if (isImmediateHead) {
        items.push({
          text: clean,
          index: idx,
          directStreamOnly: true,
          promise: Promise.resolve(null)
        });
      } else {
        items.push({
          text: clean,
          index: idx,
          directStreamOnly: false,
          promise: fetchFreeNeuralAudioBlob(
            clean,
            options.voiceConfig.freeNeuralVoice,
            options.voiceConfig.rate,
            controller.signal
          )
        });
      }
      void pump();
    },
    markStreamDone() {
      streamDone = true;
      if (!isPlayingLoop) {
        finishIfComplete();
      }
    },
    cancel() {
      if (isAlive()) {
        stopAllSpeech();
      }
    }
  };
}
