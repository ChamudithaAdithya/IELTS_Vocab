/**
 * Web Speech API & Cloud Natural Audio Engine
 * Provides studio-quality Natural British/American speech streaming
 * as well as browser SpeechSynthesis with custom voice selection,
 * voice persistence, Windows/Edge/iPhone/Android guides, and speed control.
 */

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

// Listen for async voice population
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getBrowserVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    getBrowserVoices();
  };
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
let ttsAudioCtx: AudioContext | null = null;
let isCloudAudioCancelled = false;
/** Module-level anchor prevents Chrome/Edge from garbage-collecting active utterances mid-speech! */
let activeUtterances: SpeechSynthesisUtterance[] = [];
let speechStartTimer: ReturnType<typeof setTimeout> | null = null;
let speechCancelDelayTimer: ReturnType<typeof setTimeout> | null = null;
let audioUnlocked = false;

function cleanupTtsAnalyser(): void {
  if (ttsAnalyserRaf !== null) {
    cancelAnimationFrame(ttsAnalyserRaf);
    ttsAnalyserRaf = null;
  }
  if (ttsAudioCtx && ttsAudioCtx.state !== 'closed') {
    try { ttsAudioCtx.close(); } catch {}
  }
  ttsAudioCtx = null;
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
 * Call inside a user gesture (Orb tap / Speak click / Send) to warm up Audio & SpeechSynthesis
 * so subsequent async/hands-free AI replies are never silently blocked by browser autoplay policy.
 */
export function unlockAudioOutput(): void {
  if (typeof window === 'undefined') return;
  if (!audioUnlocked) {
    audioUnlocked = true;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        setTimeout(() => {
          try { ctx.close(); } catch {}
        }, 300);
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
      currentAudioElement.src = '';
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
      window.speechSynthesis.cancel();
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

  const playChunk = () => {
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
    // Use local proxy /api/tts to avoid CORS and Google 404 external-origin blocking
    let url = `/api/tts?tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(chunk)}`;
    if (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null') {
      url = `${window.location.origin}/api/tts?tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(chunk)}`;
    }

    const audio = new Audio();
    // Do NOT set crossOrigin = 'anonymous' to avoid CORS restrictions on media playback
    audio.volume = 1.0;
    audio.muted = false;
    audio.preload = 'auto';
    audio.src = url;
    currentAudioElement = audio;

    if (effectiveRate && effectiveRate !== 1.0) {
      audio.playbackRate = Math.max(0.7, Math.min(1.4, effectiveRate));
    }

    let chunkStarted = false;
    let fallbackTriggered = false;

    const triggerBrowserFallback = () => {
      if (fallbackTriggered || sessionId !== currentSpeechSessionId || isCloudAudioCancelled) {
        return;
      }
      fallbackTriggered = true;
      clearSpeechTimers();
      try {
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.src = '';
      } catch {}
      if (currentAudioElement === audio) currentAudioElement = null;
      const remainingText = chunks.slice(currentChunkIdx - 1).join(' ');
      playBrowserSpeech(remainingText, voiceURI, options);
    };

    // Watchdog: if Cloud /api/tts hangs or never starts playing within 3.2s, seamlessly switch to Browser Speech!
    clearSpeechTimers();
    speechStartTimer = setTimeout(() => {
      if (!chunkStarted && sessionId === currentSpeechSessionId && !isCloudAudioCancelled) {
        triggerBrowserFallback();
      }
    }, 3200);

    audio.onplay = () => {
      if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) {
        audio.pause();
        return;
      }
      chunkStarted = true;
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
      if (sessionId === currentSpeechSessionId && !isCloudAudioCancelled) {
        playChunk();
      }
    };

    audio.onerror = () => {
      triggerBrowserFallback();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Do NOT fallback if speech was explicitly cancelled or superseded
        if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) {
          return;
        }
        if (err && (err.name === 'AbortError' || err.message?.includes('interrupted') || err.message?.includes('pause'))) {
          return;
        }
        triggerBrowserFallback();
      });
    }
  };

  playChunk();
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

  // Cancel any stale Chrome speech queue, then wait 50ms so Chrome's async cancel()
  // NEVER silently swallows our new utterance!
  try {
    window.speechSynthesis.cancel();
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

    // Watchdog: if a remote browser voice (e.g. Google UK) stalls silently for >2.6s,
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
    }, 2600);

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

  speechCancelDelayTimer = setTimeout(() => {
    if (sessionId === currentSpeechSessionId && !isCloudAudioCancelled) {
      speakNextChunk();
    }
  }, 55);
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
  provider: 'neural-free' | 'standard';
  freeNeuralVoice: FreeNeuralVoiceName;
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
  freeNeuralVoice: 'en-US-AvaMultilingualNeural',
  rate: 1.0
};

export function loadBuddyVoiceConfig(): BuddyVoiceConfig {
  if (typeof window === 'undefined') return DEFAULT_BUDDY_VOICE_CONFIG;
  try {
    const raw = localStorage.getItem(BUDDY_VOICE_CONFIG_KEY);
    if (!raw) return DEFAULT_BUDDY_VOICE_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      // Automatically migrate any legacy 'gemini' setting to primary 'neural-free'
      provider: parsed.provider === 'standard' ? 'standard' : 'neural-free',
      freeNeuralVoice: FREE_NEURAL_VOICES.some(v => v.id === parsed.freeNeuralVoice)
        ? parsed.freeNeuralVoice
        : DEFAULT_BUDDY_VOICE_CONFIG.freeNeuralVoice,
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

function attachAudioWaveformAnalyser(
  audio: HTMLAudioElement,
  onAudioLevel?: (level: number) => void
): void {
  if (!onAudioLevel || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    cleanupTtsAnalyser();
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    ttsAudioCtx = ctx;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      if (!ttsAudioCtx || currentAudioElement !== audio) return;
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length;
      const normalized = Math.min(100, Math.round(avg * 1.45));
      onAudioLevel(normalized);
      ttsAnalyserRaf = requestAnimationFrame(tick);
    };
    ttsAnalyserRaf = requestAnimationFrame(tick);
  } catch {
    // Non-fatal: audio still plays cleanly even if Web Audio graph is unavailable
  }
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

  const fallbackToBrowser = () => {
    playSpeech(cleanText, {
      rate: effectiveRate,
      onStart: options.onStart,
      onEnd: options.onEnd,
      onError: options.onError
    });
  };

  const cacheKey = `${voice}|${rateParam}|${cleanText}`;
  let audioBlob = freeNeuralAudioCache.get(cacheKey) || null;

  if (!audioBlob) {
    const controller = new AbortController();
    currentTtsAbortController = controller;
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    try {
      let url = `/api/neural-tts?voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(
        rateParam
      )}&q=${encodeURIComponent(cleanText)}`;
      if (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null') {
        url = `${window.location.origin}${url}`;
      }

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (currentTtsAbortController === controller) currentTtsAbortController = null;

      if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
      if (!res.ok) {
        fallbackToBrowser();
        return;
      }

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('audio')) {
        fallbackToBrowser();
        return;
      }

      const blob = await res.blob();
      if (!blob || blob.size < 256) {
        fallbackToBrowser();
        return;
      }
      audioBlob = blob;

      if (freeNeuralAudioCache.size >= MAX_NEURAL_TTS_CACHE) {
        const oldestKey = freeNeuralAudioCache.keys().next().value;
        if (oldestKey) freeNeuralAudioCache.delete(oldestKey);
      }
      freeNeuralAudioCache.set(cacheKey, audioBlob);
    } catch {
      clearTimeout(timeoutId);
      if (currentTtsAbortController === controller) currentTtsAbortController = null;
      if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
      fallbackToBrowser();
      return;
    }
  }

  if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled || !audioBlob) return;

  const blobUrl = URL.createObjectURL(audioBlob);
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
    attachAudioWaveformAnalyser(audio, options.onAudioLevel);
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
      fallbackToBrowser();
    }
  };

  try {
    await audio.play();
  } catch (err: any) {
    if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
    if (err && (err.name === 'AbortError' || err.message?.includes('interrupted'))) return;
    fallbackToBrowser();
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
  signal: AbortSignal
): Promise<Blob | null> {
  const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
  if (!cleanText) return null;
  const ratePctNum = Math.round((Math.max(0.75, Math.min(1.3, rate)) - 1.0) * 100);
  const rateParam = `${ratePctNum >= 0 ? '+' : ''}${ratePctNum}%`;
  const cacheKey = `${voice}|${rateParam}|${cleanText}`;
  const cached = freeNeuralAudioCache.get(cacheKey);
  if (cached) return cached;

  let url = `/api/neural-tts?voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(
    rateParam
  )}&q=${encodeURIComponent(cleanText)}`;
  if (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null') {
    url = `${window.location.origin}${url}`;
  }

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('audio')) return null;
    const blob = await res.blob();
    if (!blob || blob.size < 256) return null;
    if (freeNeuralAudioCache.size >= MAX_NEURAL_TTS_CACHE) {
      const oldest = freeNeuralAudioCache.keys().next().value;
      if (oldest) freeNeuralAudioCache.delete(oldest);
    }
    freeNeuralAudioCache.set(cacheKey, blob);
    return blob;
  } catch {
    return null;
  }
}

export interface RealtimeTtsQueue {
  enqueue: (sentence: string) => void;
  markStreamDone: () => void;
  cancel: () => void;
}

/**
 * Starts synthesizing & playing each streamed sentence immediately via Free Unlimited Neural HD
 * while pre-fetching upcoming sentences in parallel — zero quota limits, near-instant real-time speech!
 */
export function createRealtimeTtsQueue(options: {
  voiceConfig: BuddyVoiceConfig;
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
    promise: Promise<Blob | null>;
  }

  const items: QueueItem[] = [];
  let playIdx = 0;
  let isPlayingLoop = false;
  let streamDone = false;
  let startedOnce = false;
  let finishedOnce = false;

  const isAlive = () => sessionId === currentSpeechSessionId && !isCloudAudioCancelled;

  const finishIfComplete = () => {
    if (finishedOnce || !isAlive()) return;
    if (streamDone && playIdx >= items.length) {
      finishedOnce = true;
      cleanupTtsAnalyser();
      options.onAudioLevel?.(0);
      options.onAllEnd?.();
    }
  };

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
        attachAudioWaveformAnalyser(audio, options.onAudioLevel);
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

  const playBrowserOnce = (text: string): Promise<void> =>
    new Promise((resolve) => {
      if (!isAlive() || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = options.voiceConfig.rate || 1.0;
      utt.volume = 1.0;
      const chosen = resolveVoice();
      if (chosen) {
        utt.voice = chosen;
        utt.lang = chosen.lang;
      } else {
        utt.lang = 'en-GB';
      }
      activeUtterances = [utt];
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      const watchdog = setTimeout(finish, 12000);
      utt.onstart = () => {
        if (!startedOnce) {
          startedOnce = true;
          options.onFirstStart?.();
        }
      };
      utt.onend = () => {
        clearTimeout(watchdog);
        finish();
      };
      utt.onerror = () => {
        clearTimeout(watchdog);
        finish();
      };
      try {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.speak(utt);
      } catch {
        clearTimeout(watchdog);
        finish();
      }
    });

  const pump = async () => {
    if (isPlayingLoop) return;
    isPlayingLoop = true;
    try {
      while (isAlive() && playIdx < items.length) {
        const current = items[playIdx++];
        const blob = await current.promise;
        if (!isAlive()) return;
        if (blob) {
          const ok = await playBlobOnce(blob);
          if (!ok && isAlive()) {
            await playBrowserOnce(current.text);
          }
        } else if (isAlive()) {
          await playBrowserOnce(current.text);
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
      const promise =
        options.voiceConfig.provider === 'standard'
          ? Promise.resolve(null)
          : fetchFreeNeuralAudioBlob(
              clean,
              options.voiceConfig.freeNeuralVoice,
              options.voiceConfig.rate,
              controller.signal
            );
      items.push({ text: clean, promise });
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
