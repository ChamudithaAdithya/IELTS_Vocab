/**
 * Web Speech API Audio Engine with custom voice selection,
 * voice persistence, iPhone/Android voice detection, and speed control.
 */

export interface VoiceSettings {
  voiceURI: string;
  voiceName: string;
  lang: string;
  rate: number;
  pitch: number;
  showExampleSpeakers: boolean;
}

const VOICE_SETTINGS_STORAGE_KEY = 'ielts_master_voice_settings_v1';

export const defaultVoiceSettings: VoiceSettings = {
  voiceURI: '',
  voiceName: '',
  lang: 'en-GB',
  rate: 0.9,
  pitch: 1.0,
  showExampleSpeakers: true,
};

export function loadVoiceSettings(): VoiceSettings {
  if (typeof window === 'undefined') return defaultVoiceSettings;
  try {
    const raw = localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
    if (!raw) return defaultVoiceSettings;
    return { ...defaultVoiceSettings, ...JSON.parse(raw) };
  } catch (e) {
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
let activeAiAudio: HTMLAudioElement | null = null;
const AI_TTS_URL = import.meta.env.VITE_AI_TTS_URL?.trim();

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
 * Filter English voices suitable for IELTS pronunciation
 */
export function getEnglishVoices(): SpeechSynthesisVoice[] {
  const all = getBrowserVoices();
  const english = all.filter(v => v.lang.toLowerCase().startsWith('en'));
  
  // Sort prioritized: UK English first, then enhanced/natural, then others
  return english.sort((a, b) => {
    const aIsUK = a.lang.replace('_', '-').toLowerCase().startsWith('en-gb');
    const bIsUK = b.lang.replace('_', '-').toLowerCase().startsWith('en-gb');
    if (aIsUK && !bIsUK) return -1;
    if (!aIsUK && bIsUK) return 1;

    const aIsNatural = a.name.includes('Natural') || a.name.includes('Enhanced') || a.name.includes('Premium') || a.name.includes('Siri');
    const bIsNatural = b.name.includes('Natural') || b.name.includes('Enhanced') || b.name.includes('Premium') || b.name.includes('Siri');
    if (aIsNatural && !bIsNatural) return -1;
    if (!aIsNatural && bIsNatural) return 1;

    return a.name.localeCompare(b.name);
  });
}

/**
 * Find best voice matching user settings or default British English
 */
export function resolveVoice(customURI?: string): SpeechSynthesisVoice | null {
  const voices = getBrowserVoices();
  if (voices.length === 0) return null;

  // 1. Check custom URI from settings
  if (customURI) {
    const found = voices.find(v => v.voiceURI === customURI || v.name === customURI);
    if (found) return found;
  }

  // 2. Check stored settings
  const stored = loadVoiceSettings();
  if (stored.voiceURI) {
    const found = voices.find(v => v.voiceURI === stored.voiceURI || v.name === stored.voiceName);
    if (found) return found;
  }

  // 3. Fallback to British English natural/enhanced voice
  const ukVoice = 
    voices.find(v => (v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Google') || v.name.includes('Oliver') || v.name.includes('Serena') || v.name.includes('Daniel') || v.name.includes('George')) && v.lang.replace('_', '-').toLowerCase().startsWith('en-gb')) ||
    voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('en-gb')) ||
    voices.find(v => (v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.replace('_', '-').toLowerCase().startsWith('en-us')) ||
    voices.find(v => v.lang.toLowerCase().startsWith('en'));

  return ukVoice || null;
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
  if (AI_TTS_URL && typeof Audio !== 'undefined') {
    stopAllSpeech();
    const audio = new Audio(`${AI_TTS_URL}?text=${encodeURIComponent(text.slice(0, 500))}`);
    activeAiAudio = audio;
    audio.playbackRate = options.rate ?? loadVoiceSettings().rate ?? 0.9;
    audio.onplay = () => options.onStart?.();
    audio.onended = () => { activeAiAudio = null; options.onEnd?.(); };
    audio.onerror = () => { activeAiAudio = null; options.onError?.(new Error('AI voice playback failed')); };
    void audio.play().catch(error => options.onError?.(error));
    return;
  }
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Web Speech API is not supported in this browser.');
    options.onError?.(new Error('Speech synthesis not supported'));
    return;
  }

  // Clear pending utterances
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  const cleanText = text.replace(/[/\\()[\]]/g, '').trim();
  if (!cleanText) return;

  const storedSettings = loadVoiceSettings();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = options.rate ?? storedSettings.rate ?? 0.9;
  utterance.pitch = options.pitch ?? storedSettings.pitch ?? 1.0;

  const voice = resolveVoice(options.voiceURI || storedSettings.voiceURI);
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
      console.warn('Speech error:', e);
      options.onError?.(e);
    } else {
      options.onEnd?.();
    }
  };

  window.speechSynthesis.speak(utterance);
}

export function stopAllSpeech(): void {
  if (activeAiAudio) {
    activeAiAudio.pause();
    activeAiAudio.currentTime = 0;
    activeAiAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export type EnglishAccent = 'en-GB' | 'en-US' | 'en-AU';

export const stopSpeech = stopAllSpeech;

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
  playSpeech(text, {
    rate: options.rate,
    pitch: options.pitch,
    onStart: options.onStart,
    onEnd: options.onEnd,
    onError: options.onError,
  });
}
