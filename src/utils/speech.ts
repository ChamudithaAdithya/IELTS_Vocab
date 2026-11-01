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
let isCloudAudioCancelled = false;

export function stopAllSpeech(): void {
  // Immediately invalidate any active or queued speech sessions
  currentSpeechSessionId++;
  isCloudAudioCancelled = true;

  if (currentAudioElement) {
    try {
      // Detach listeners before pausing/clearing src to prevent triggering onerror/onended
      currentAudioElement.onplay = null;
      currentAudioElement.onended = null;
      currentAudioElement.onerror = null;
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement.src = '';
    } catch {}
    currentAudioElement = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
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
    audio.src = url;
    currentAudioElement = audio;

    if (effectiveRate && effectiveRate !== 1.0) {
      audio.playbackRate = Math.max(0.7, Math.min(1.4, effectiveRate));
    }

    audio.onplay = () => {
      if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) {
        audio.pause();
        return;
      }
      if (currentChunkIdx === 1) {
        options.onStart?.();
      }
    };

    audio.onended = () => {
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;
      if (sessionId === currentSpeechSessionId && !isCloudAudioCancelled) {
        playChunk();
      }
    };

    audio.onerror = () => {
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;
      // Do NOT fallback if speech was stopped or superseded
      if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) {
        return;
      }
      // Gracefully switch to browser neural speech with matching accent
      const remainingText = chunks.slice(currentChunkIdx - 1).join(' ');
      playBrowserSpeech(remainingText, voiceURI, options);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Do NOT fallback if speech was cancelled or interrupted
        if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) {
          return;
        }
        if (err && (err.name === 'AbortError' || err.message?.includes('interrupted') || err.message?.includes('pause'))) {
          return;
        }
        const remainingText = chunks.slice(currentChunkIdx - 1).join(' ');
        playBrowserSpeech(remainingText, voiceURI, options);
      });
    }
  };

  playChunk();
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
  }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onError?.(new Error('Speech synthesis not supported'));
    return;
  }

  const sessionId = ++currentSpeechSessionId;
  isCloudAudioCancelled = false;

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  const storedSettings = loadVoiceSettings();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? storedSettings.rate ?? 0.9;
  utterance.pitch = options.pitch ?? storedSettings.pitch ?? 1.0;

  const voice = resolveVoice(voiceURI || storedSettings.voiceURI);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = 'en-GB';
  }

  utterance.onstart = () => {
    if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) {
      window.speechSynthesis.cancel();
      return;
    }
    options.onStart?.();
  };

  utterance.onend = () => {
    if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    if (sessionId !== currentSpeechSessionId || isCloudAudioCancelled) return;
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      options.onError?.(e);
    } else {
      options.onEnd?.();
    }
  };

  window.speechSynthesis.speak(utterance);
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
