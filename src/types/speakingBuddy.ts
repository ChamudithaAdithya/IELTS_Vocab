/**
 * AI Speaking Buddy (Lingo Buddy) — Phase 1 & Phase 2 Core Type Definitions
 * Tagline: "Speak freely. Make mistakes. Learn naturally."
 */

/** Phase 5 — Complete 14-State Living AI Energy Orb Specification */
export type BuddyOrbState =
  | 'idle'
  | 'listening'
  | 'transcribing'
  | 'understanding'
  | 'thinking'
  | 'speaking'
  | 'interrupted'
  | 'happy'
  | 'encouraging'
  | 'analyzing'
  | 'correcting'
  | 'deep_thinking'
  | 'confused'
  | 'error'
  | 'sleeping';

/** Stage A — Transcription Coherence Status (separates mic/STT garbage from grammar evaluation) */
export type TranscriptQuality = 'clear' | 'partially_unclear' | 'unclear';

/** 5-Way Diagnostic Distinction (+ clean & unclear) so STT/pronunciation/incomplete speech are NEVER misclassified as grammar errors */
export type BuddyUtteranceCategory =
  | 'clean'
  | 'grammar_mistake'
  | 'stt_error'
  | 'pronunciation_difficulty'
  | 'incomplete_speech'
  | 'unusual_but_correct'
  | 'unclear_speech';

export interface ContextualWordInterpretation {
  heardWord: string;
  intendedWord: string;
  kind: 'stt_error' | 'pronunciation_difficulty';
  confidence: number;
  phoneticNote: string;
  phoneticNoteSi?: string;
  ipaComparison?: string;
}

export interface TranscriptCoherenceResult {
  quality: TranscriptQuality;
  reason?: string;
  suspiciousSpans?: string[];
  incompleteFragment?: string;
  clarificationHint?: string;
  utteranceCategory?: BuddyUtteranceCategory;
  contextualWord?: ContextualWordInterpretation;
}

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

/** Phase 4 — P2.3 Four Explanation Language Modes */
export type ExplanationLangMode =
  | 'english'
  | 'simple_english'
  | 'bilingual_si'
  | 'sinhala_focused';

export type BuddySpeechEngine = 'gemini-cloud' | 'live-solo';

/** Phase 2 — 10 Core Grammar Categories + Vocabulary & Repetition */
export type GrammarCategoryCode =
  | 'VERB_TENSE'
  | 'ARTICLES'
  | 'PREPOSITIONS'
  | 'SVA'
  | 'VERB_FORMS'
  | 'PLURALS'
  | 'SENTENCE_STRUCTURE'
  | 'WORD_CHOICE'
  | 'WORD_ORDER'
  | 'CONDITIONALS'
  | 'VOCABULARY'
  | 'REPETITION';

/** Phase 2 — Critical 4-Way Feedback Classification (never label valid English as Incorrect) */
export type FeedbackSeverity =
  | 'GRAMMAR_ERROR'
  | 'UNNATURAL'
  | 'ALTERNATIVE'
  | 'ADVANCED';

export interface BuddyMistake {
  id: string;
  original: string;
  correction: string;
  category: GrammarCategoryCode;
  categoryLabel: string;
  severity: FeedbackSeverity;
  explanation: string;
  /** Phase 4 P2.3 — Plain ultra-simple English explanation for Simple English mode */
  simpleExplanation?: string;
  explanationSi?: string;
  /** Phase 4 P2.3 — Optional V1 / V2 / V3 verb form reference table */
  verbFormTable?: { v1: string; v2: string; v3: string };
  /** Phase 4 P2.3 — Targeted Sinhala-to-English structural transfer note */
  sinhalaTransferNote?: string;
  grammar_rule: string;
  example: string;
  more_examples?: string[];
  learning_tip: string;
  confidence: number; // 0.0 – 1.0
  learned?: boolean;
  /** True when the fix infers intended meaning from an incomplete or partially misheard phrase */
  isProvisional?: boolean;
}

export interface BuddyVocabUpgradeOption {
  word: string;
  nuance: string;
}

export interface BuddyVocabUpgrade {
  id: string;
  original: string;
  upgrades: BuddyVocabUpgradeOption[];
  explanation: string;
  explanationSi?: string;
  example: string;
  naturalSentence?: string;
  category: 'vocabulary' | 'collocation' | 'expression';
}

export interface TryAgainAttemptResult {
  attemptedText: string;
  matched: boolean;
  score: number; // 0 - 100
  missedWords: string[];
  completedAt: number;
}

/** Phase 4 — P2.1 Seven-Metric Fluency Suite (distinct from grammar accuracy) */
export interface BuddyFluencyMetrics {
  wpm: number;
  paceLabel: 'Slow & Deliberate' | 'Comfortable Pace' | 'Brisk Pace' | 'Very Fast';
  pauseCount: number;
  avgPauseSec: number;
  hesitationCount: number;
  hesitationFillers: string[];
  repetitionCount: number;
  repeatedPhrases: string[];
  selfCorrectionCount: number;
  avgSentenceLength: number;
  responseDevelopment: 'Brief' | 'Developing' | 'Well-Developed';
  developmentScore: number; // 0 – 100
  clarityRhythmNote: string;
}

/** Phase 4 — P2.1 Word-Stress, Phonetics & Connected-Speech Spotlight */
export interface PronunciationSpotlight {
  word: string;
  stressPattern: string;
  ipa: string;
  tip: string;
  tipSi: string;
  category: 'stress' | 'consonant_vowel' | 'linking';
  example: string;
}

export interface BuddyGrammarAnalysis {
  original_sentence: string;
  corrected_sentence: string;
  mistakes: BuddyMistake[];
  vocabUpgrades?: BuddyVocabUpgrade[];
  natural_expression: string | null;
  learning_recommendation: string | null;
  /** Stage A coherence result — 'unclear' blocks false "Clean English" badges */
  transcriptQuality: TranscriptQuality;
  /** Explicit 5-way distinction: grammar_mistake vs stt_error vs pronunciation_difficulty vs incomplete_speech vs unusual_but_correct */
  utteranceCategory?: BuddyUtteranceCategory;
  /** Contextually inferred intended word when STT heard a homophone or pronunciation minimal-pair neighbor */
  contextualWord?: ContextualWordInterpretation;
  clarificationNote?: string;
  isProvisional?: boolean;
  tryAgainResult?: TryAgainAttemptResult;
  /** Phase 4 — P2.1 Per-turn Fluency & Pronunciation Diagnostics */
  fluency?: BuddyFluencyMetrics;
  pronunciationSpotlights?: PronunciationSpotlight[];
  skippedUncertainWords?: string[];
  intendedMeaning?: string;
  analyzerSource: 'gemini' | 'local';
  analyzedAt: number;
}

/** Structured unified response contract for Natural Conversation + Instant English Correction */
export interface BuddyStructuredTurnResponse {
  originalTranscript: string;
  intendedMeaning: string;
  correctionRequired: boolean;
  correctedSentence: string;
  correctionType: 'none' | 'grammar' | 'naturalness' | 'vocabulary';
  mistakes: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  spokenCorrection: string;
  conversationalResponse: string;
  followUpQuestion: string | null;
}

/** Phase 3 — P1.2 Personal Vocabulary Collection Item */
export interface SavedBuddyVocabItem {
  id: string;
  phrase: string;
  original?: string;
  explanation: string;
  explanationSi?: string;
  example: string;
  synonyms: string[];
  category: 'vocabulary' | 'collocation' | 'expression';
  savedAt: number;
}

/** Phase 3 — P1.3 Long-Term Personal Memory Item (strictly separated from analytics) */
export interface BuddyMemoryItem {
  id: string;
  label: string;
  detail: string;
  category: 'interest' | 'goal' | 'topic' | 'preference';
  createdAt: number;
}

export interface BuddyMemoryState {
  enabled: boolean;
  items: BuddyMemoryItem[];
  lastUpdatedAt: number;
}

/** Phase 3 — P1.4 Recurring Mistake Tracking & Normalized Error Rate */
export interface MistakeRecurrenceRecord {
  category: GrammarCategoryCode;
  categoryLabel: string;
  count: number;
  masteredCount: number;
  recentExamples: { original: string; correction: string; timestamp: number }[];
  lastSeenAt: number;
}

/** Phase 4 — P2.2 Daily Activity Bucket for 7-Day Weekly English Report */
export interface DailyBuddyActivity {
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue, ...
  secondsSpoken: number;
  wordsSpoken: number;
  confirmedErrors: number;
  turnsCount: number;
  hesitationCount: number;
  wpmSum: number;
  wpmSamples: number;
}

export interface WeeklyEnglishReport {
  minutesSpoken: number;
  wordsSpoken: number;
  mistakesCorrected: number;
  expressionsLearned: number;
  sessionsCount: number;
  dailySeries: (DailyBuddyActivity & { normalizedErrorRate: number; avgWpm: number })[];
  weekOverWeek: {
    direction: 'improving' | 'steady' | 'needs_focus' | 'first_week';
    summary: string;
    currentErrorRate: number;
    previousErrorRate: number | null;
  };
  weeklyAchievement: string;
  fluencyHighlight: string;
  topRecurringCategories: MistakeRecurrenceRecord[];
  resolvedCategories: string[];
  nextWeekActionPlan: string[];
}

export interface BuddyLearningAnalytics {
  totalAnalyzedWords: number;
  totalConfirmedErrors: number;
  totalMistakesCorrected: number;
  totalTryAgainAttempts: number;
  totalTryAgainSuccesses: number;
  totalSecondsSpoken?: number;
  totalHesitations?: number;
  categoryStats: Record<string, MistakeRecurrenceRecord>;
  errorRateHistory: { timestamp: number; errorRate: number; words: number; errors: number }[];
  dailyActivity?: Record<string, DailyBuddyActivity>;
}

/** Phase 3 — 5.4 Personal English Knowledge Base Grammar Entry */
export interface PersonalGrammarNote {
  id: string;
  original: string;
  correction: string;
  category: GrammarCategoryCode;
  categoryLabel: string;
  rule: string;
  explanation: string;
  example: string;
  savedAt: number;
  mastered: boolean;
}

/** High-level 12-Category Context-Aware Conversational Intent Taxonomy */
export type BuddyConversationalIntent =
  | 'ANSWER_TO_PREVIOUS_QUESTION'
  | 'ASKING_QUESTION'
  | 'ASKING_WORD_MEANING'
  | 'ASKING_FOR_CLARIFICATION'
  | 'CORRECTING_AI'
  | 'CHANGING_TOPIC'
  | 'EXPRESSING_EMOTION'
  | 'SHARING_INFORMATION'
  | 'DISAGREEING'
  | 'UNCLEAR_SPEECH'
  | 'INCOMPLETE_SENTENCE'
  | 'GENERAL_CONVERSATION';

/** Audit Architecture — Explicit Conversational Intent Taxonomy */
export type BuddyTurnIntent =
  | 'unclear_speech'
  | 'incomplete_sentence'
  | 'repeat_last_buddy'
  | 'explain_earlier_mistake'
  | 'ask_word_meaning'
  | 'clarify_specific_term'
  | 'clarify_last_question'
  | 'correcting_ai'
  | 'topic_correction'
  | 'topic_change'
  | 'user_disagreement'
  | 'context_retention'
  | 'project_continuation'
  | 'empathy_negative_day'
  | 'quiet_day'
  | 'school_cancellation'
  | 'cooking_process'
  | 'topic_chat'
  | 'greeting_or_ack'
  | 'grounded_general';

/** Audit Architecture — Single Immutable Turn Packet Consumed by Both Friend Engine & Grammar Coach */
export interface FinalizedTurnPacket {
  turnId: string;
  sessionId: string;
  messageId: string;
  timestamp: number;
  /** 1. Immutable raw capture from STT or keyboard (NEVER overwritten) */
  rawTranscript: string;
  /** 2. Finalized verbatim recognized words before any punctuation normalization */
  finalizedVerbatimTranscript: string;
  /** 3. Non-destructive punctuation/capitalization-only transcript (never substitutes words!) */
  normalizedTranscript: string;
  /** Alias matching strict 6-field data integrity contract */
  punctuationNormalizedTranscript: string;
  /** 4. Optional user-edited override (preserved separately from originalRawTranscript) */
  editedTranscript?: string;
  userEditedTranscript?: string;
  /** Single canonical transcript consumed by BOTH Friend Engine & English Coach */
  analysisTranscript: string;
  /** Optional session-scoped audio Blob URL so user can replay and verify exact spoken words */
  recordedAudioUrl?: string;
  uncertainWords?: string[];
  sttConfidence?: number;
  sttEngine: BuddySpeechEngine | 'typed';
  audioDurationSec?: number;
  coherence: TranscriptCoherenceResult;
  /** Ordered conversation messages strictly BEFORE this turn (prevents duplicate user turns) */
  priorHistory: BuddyMessage[];
}

/** Section 4 — 12 Independent Real-Time Voice Pipeline Timestamps (performance.now() ms) */
export interface BuddyTurnPerfTimestamps {
  speechStart: number | null;
  firstPartialSTT: number | null;
  lastPartialSTT: number | null;
  finalTranscript: number | null;
  aiRequestStart: number | null;
  aiFirstToken: number | null;
  grammarStart: number | null;
  grammarComplete: number | null;
  ttsRequestStart: number | null;
  ttsFirstByte: number | null;
  playbackStart: number | null;
  turnComplete: number | null;
}

/** Derived End-to-End Voice Latency Metrics (ms) */
export interface BuddyTurnPerfDurations {
  timeToFirstTranscriptMs: number | null;
  partialWindowSpanMs: number | null;
  finalTranscriptionLatencyMs: number | null;
  aiTimeToFirstTokenMs: number | null;
  grammarAnalysisLatencyMs: number | null;
  ttsTimeToFirstAudioMs: number | null;
  userEndToFirstAudioMs: number | null;
  totalResponseCompletionMs: number | null;
}

export interface BuddyTurnPerfRecord {
  turnId: string;
  sessionId: string;
  recordedAt: number;
  sttEngineUsed: string;
  aiProviderUsed: 'gemini' | 'local';
  ttsProviderUsed: 'neural-stream' | 'neural-cache' | 'browser-speech' | 'muted';
  wordCount: number;
  bargeInInterrupted?: boolean;
  timestamps: BuddyTurnPerfTimestamps;
  durations: BuddyTurnPerfDurations;
}

/** Audit Architecture — Per-Turn Execution Trace for Transparency & QA Debugging */
export interface BuddyTurnTrace {
  turnId: string;
  sessionId: string;
  timestamp: number;
  rawTranscript: string;
  finalizedVerbatimTranscript?: string;
  normalizedTranscript: string;
  analysisTranscript: string;
  coherenceQuality: TranscriptQuality;
  conversationalIntent?: BuddyConversationalIntent;
  intent: BuddyTurnIntent;
  activeTopic: string;
  activeSubject: string | null;
  providerRequested: 'gemini' | 'local';
  providerUsed: 'gemini' | 'local';
  fallbackReason?: string;
  friendLatencyMs: number;
  aiFirstTokenMs?: number;
  grammarLatencyMs: number;
  grammarSource: 'gemini' | 'local';
  mistakesCount: number;
  spokenCorrection?: string;
  replyPreview: string;
  perf?: BuddyTurnPerfRecord;
}

export interface BuddyMessage {
  id: string;
  role: 'user' | 'buddy';
  timestamp: number;
  /** Display transcript shown in conversation (never overwritten with correctedSentence!) */
  text: string;
  /** For buddy messages: optional short spoken grammar/naturalness recast preceding conversationalResponse */
  spokenCorrection?: string;
  /** For buddy messages: the pure conversational friend continuation */
  conversationalResponse?: string;
  /** For buddy messages: whether the recast fixed a grammar mistake vs unnatural phrasing */
  correctionType?: 'none' | 'grammar' | 'naturalness' | 'vocabulary';
  /** Full structured turn output (Section 7 contract) */
  structuredTurn?: BuddyStructuredTurnResponse;
  /** 1. Immutable original STT transcript preserved for debugging & STT-vs-grammar separation */
  originalRawTranscript?: string;
  /** 2. Finalized verbatim transcript before punctuation restoration */
  finalizedVerbatimTranscript?: string;
  /** 3. Separate user-edited transcript if the learner fixed a misheard word */
  userEditedTranscript?: string;
  /** 4. Non-destructive punctuation-normalized transcript (same words as verbatim/edited) */
  punctuationNormalizedTranscript?: string;
  /** 5. Grammar-corrected sentence stored separately — NEVER overwrites originalRawTranscript or text */
  correctedSentence?: string;
  /** 6. Structured grammar mistakes detected for this turn */
  grammarMistakes?: BuddyMistake[];
  /** Optional in-memory Blob URL of the user's recorded audio for verbatim verification */
  recordedAudioUrl?: string;
  /** Whether the user manually corrected a misheard STT word */
  isEdited?: boolean;
  /** Words flagged as low-confidence by STT (never auto-penalized as grammar errors) */
  uncertainWords?: string[];
  /** Average STT confidence (0.0 – 1.0) if reported by speech engine */
  sttConfidence?: number;
  sttEngine?: BuddySpeechEngine | 'typed';
  audioDurationSec?: number;
  responseSource?: 'gemini' | 'local';
  /** Phase 2 — Decoupled structured grammar & naturalness analysis attached asynchronously */
  analysis?: BuddyGrammarAnalysis;
  isAnalyzing?: boolean;
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
