/**
 * AI Speaking Buddy (Lingo Buddy) — Phase 1 Core Type Definitions
 * Tagline: "Speak freely. Make mistakes. Learn naturally."
 */

export type BuddyOrbState =
  | 'idle'
  | 'listening'
  | 'transcribing'
  | 'understanding'
  | 'thinking'
  | 'speaking'
  | 'correcting'
  | 'error'
  | 'sleeping';

export type BuddyLifecyclePhase =
  | 'PHASE_01_IDLE'
  | 'PHASE_02_LISTENING'
  | 'PHASE_03_TRANSCRIBING'
  | 'PHASE_04_UNDERSTANDING'
  | 'PHASE_05_RESPONDING'
  | 'PHASE_06_SPEAKING'
  | 'PHASE_07_SAVED';

export type BuddyPersonality =
  | 'friendly'
  | 'curious'
  | 'funny'
  | 'intellectual'
  | 'calm'
  | 'motivational';

export type BuddyMode =
  | 'friendly'
  | 'speak_and_correct'
  | 'fluency'
  | 'ielts_partner'
  | 'vocabulary';

export type CorrectionIntensity = 'gentle' | 'balanced' | 'detailed';

export type BuddySpeechEngine = 'live-solo' | 'whisper-local' | 'gemini-cloud';

export interface BuddyMessage {
  id: string;
  role: 'user' | 'buddy';
  timestamp: number;
  /** Processed, punctuated, or user-edited text shown in the conversation */
  text: string;
  /** Immutable original STT transcript preserved for debugging & STT-vs-grammar separation */
  originalRawTranscript?: string;
  /** Whether the user manually corrected a misheard STT word */
  isEdited?: boolean;
  /** Words flagged as low-confidence by STT (never auto-penalized as grammar errors) */
  uncertainWords?: string[];
  /** Average STT confidence (0.0 – 1.0) if reported by speech engine */
  sttConfidence?: number;
  sttEngine?: BuddySpeechEngine | 'typed';
  audioDurationSec?: number;
  responseSource?: 'gemini' | 'local';
}

export interface BuddySession {
  id: string;
  title: string;
  startedAt: number;
  updatedAt: number;
  personality: BuddyPersonality;
  mode: BuddyMode;
  intensity: CorrectionIntensity;
  messages: BuddyMessage[];
}

export interface BuddyPersonalityConfig {
  id: BuddyPersonality;
  label: string;
  emoji: string;
  tagline: string;
  speechRate: number;
  systemTone: string;
  greeting: string;
}

export interface BuddyModeConfig {
  id: BuddyMode;
  label: string;
  badge?: string;
  description: string;
}
