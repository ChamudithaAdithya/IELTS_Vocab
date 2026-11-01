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

  // 3. Fallback to British English natural/enhanced voice
  const ukNatural = 
    voices.find(v => (v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Google') || v.name.includes('Oliver') || v.name.includes('Serena') || v.name.includes('Daniel') || v.name.includes('George')) && v.lang.replace('_', '-').toLowerCase().startsWith('en-gb')) ||
    voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('en-gb')) ||
    voices.find(v => (v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.replace('_', '-').toLowerCase().startsWith('en-us')) ||
    voices.find(v => v.lang.toLowerCase().startsWith('en'));

  return ukNatural || null;
}

/* ------------------------------------------------------------------ */
/* Audio Playback Engine (Cloud Studio HD + Web Speech Synthesis)      */
/* ------------------------------------------------------------------ */

let currentAudioElement: HTMLAudioElement | null = null;
let isCloudAudioCancelled = false;

export function stopAllSpeech(): void {
  isCloudAudioCancelled = true;
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement.src = '';
    } catch {}
    currentAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export const stopSpeech = stopAllSpeech;

/**
 * Split text into fluent sentence/clause chunks suitable for Google TTS API (< 160 chars)
 */
function splitIntoAudioChunks(text: string, maxLen: number = 160): string[] {
  const rawSentences = text.split(/(?<=[.?!])\s+|\n+/).filter(Boolean);
  const chunks: string[] = [];

  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxLen) {
      chunks.push(trimmed);
    } else {
      const subClauses = trimmed.split(/(?<=[,;:\-])\s+/);
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
    if (isCloudAudioCancelled || currentChunkIdx >= chunks.length) {
      currentAudioElement = null;
      options.onEnd?.();
      return;
    }

    const chunk = chunks[currentChunkIdx++];
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = url;
    currentAudioElement = audio;

    if (effectiveRate && effectiveRate !== 1.0) {
      audio.playbackRate = Math.max(0.7, Math.min(1.4, effectiveRate));
    }

    audio.onplay = () => {
      if (currentChunkIdx === 1) {
        options.onStart?.();
      }
    };

    audio.onended = () => {
      if (!isCloudAudioCancelled) {
        playChunk();
      }
    };

    audio.onerror = (e) => {
      console.warn('Cloud natural audio stream error, falling back to local speech synthesis:', e);
      const remainingText = chunks.slice(currentChunkIdx - 1).join(' ');
      playBrowserSpeech(remainingText, '', options);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (!isCloudAudioCancelled) {
          console.warn('Audio play was prevented or interrupted, falling back to speech synthesis:', err);
          const remainingText = chunks.slice(currentChunkIdx - 1).join(' ');
          playBrowserSpeech(remainingText, '', options);
        }
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

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = (e) => {
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
