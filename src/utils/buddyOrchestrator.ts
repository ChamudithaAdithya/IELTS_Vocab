/**
 * AI Speaking Buddy (Lingo Buddy) — Central Conversation Orchestrator
 *
 * Audit Section 3 Architectural Backbone:
 * Coordinates Voice/Text Input -> Transcript Normalization -> Stage A Coherence ->
 * Single Immutable FinalizedTurnPacket -> Parallel Friend Engine & English Coach ->
 * Verified Learning Intelligence Updates + Live Execution Trace.
 *
 * Guarantees:
 * 1. Both Friend Engine and Grammar Engine consume the EXACT SAME `analysisTranscript` & `coherence`.
 * 2. Every async callback is locked to `sessionId` + `turnId` + `messageId` (zero stale cross-session bleed!).
 * 3. Every turn produces an inspectable `BuddyTurnTrace` (provider, fallback reason, intent, topic, latency).
 */

import type {
  BuddyGrammarAnalysis,
  BuddyLearningAnalytics,
  BuddyMemoryState,
  BuddyMessage,
  BuddyMode,
  BuddyPersonality,
  BuddySpeechEngine,
  BuddyTurnTrace,
  CorrectionIntensity,
  FinalizedTurnPacket,
  PersonalGrammarNote
} from '../types/speakingBuddy';
import {
  extractSessionContext,
  generateBuddyFriendReply,
  processBuddyTranscript,
  type BuddyFriendReplyResult
} from './speakingBuddyEngine';
import {
  analyzeBuddyGrammar,
  validateTranscriptCoherence
} from './buddyGrammarEngine';
import {
  extractAndStoreLongTermMemories,
  getTopRecurringMistakes,
  loadGrammarLibrary,
  recordTurnAnalytics,
  saveMistakeToGrammarLibrary
} from './buddyLearningStore';

/**
 * Mathematical 0%-Autocorrect Guard: ensures punctuation/capitalization restoration
 * NEVER adds, deletes, or substitutes a single spoken word token.
 */
function ensureZeroWordMutation(verbatim: string, normalized: string): string {
  const tokenize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

  const a = tokenize(verbatim);
  const b = tokenize(normalized);
  if (a.length !== b.length) return verbatim;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return verbatim;
  }
  return normalized;
}

export function buildFinalizedTurnPacket(params: {
  sessionId: string;
  rawTranscript: string;
  editedTranscript?: string;
  engine: BuddySpeechEngine | 'typed';
  recordedAudioUrl?: string;
  uncertainWords?: string[];
  sttConfidence?: number;
  durationSec?: number;
  priorHistory: BuddyMessage[];
}): FinalizedTurnPacket {
  const now = Date.now();
  const cleanRaw = params.rawTranscript.trim();
  // Stage 1 -> Stage 2: Preserve exact finalized verbatim words separately from punctuation restoration
  const finalizedVerbatimTranscript = cleanRaw.replace(/\s+/g, ' ').trim();
  const normalizedTranscript = ensureZeroWordMutation(
    finalizedVerbatimTranscript,
    processBuddyTranscript(finalizedVerbatimTranscript)
  );
  const cleanEdited = params.editedTranscript ? params.editedTranscript.trim() : undefined;
  const analysisTranscript = cleanEdited
    ? ensureZeroWordMutation(cleanEdited, processBuddyTranscript(cleanEdited))
    : normalizedTranscript;

  // Stage A Coherence runs ONCE here and is shared by BOTH Friend Engine & Grammar Coach
  const coherence = validateTranscriptCoherence(
    analysisTranscript,
    params.uncertainWords,
    params.sttConfidence
  );

  return {
    turnId: `turn-${now}-${Math.random().toString(36).slice(2, 6)}`,
    sessionId: params.sessionId,
    messageId: `msg-user-${now}`,
    timestamp: now,
    rawTranscript: cleanRaw,
    finalizedVerbatimTranscript,
    normalizedTranscript,
    punctuationNormalizedTranscript: normalizedTranscript,
    editedTranscript: cleanEdited,
    userEditedTranscript: cleanEdited,
    analysisTranscript,
    recordedAudioUrl: params.recordedAudioUrl,
    uncertainWords:
      params.uncertainWords && params.uncertainWords.length > 0
        ? params.uncertainWords
        : undefined,
    sttConfidence: params.sttConfidence,
    sttEngine: params.engine,
    audioDurationSec: params.durationSec,
    coherence,
    priorHistory: [...params.priorHistory]
  };
}

export interface OrchestratedTurnCallbacks {
  /** Fires live as tokens stream from Gemini so the Buddy chat bubble renders in real time */
  onFriendPartialReply?: (partialText: string, packet: FinalizedTurnPacket) => void;
  /** Fires the moment each sentence finishes streaming so TTS begins speaking immediately */
  onFriendSentenceReady?: (sentence: string, packet: FinalizedTurnPacket) => void;
  onFriendReplyReady: (result: BuddyFriendReplyResult, packet: FinalizedTurnPacket) => void;
  onGrammarAnalysisReady: (
    analysis: BuddyGrammarAnalysis,
    updatedAnalytics: BuddyLearningAnalytics,
    updatedGrammarLib: PersonalGrammarNote[],
    packet: FinalizedTurnPacket
  ) => void;
  onMemoryUpdated?: (memory: BuddyMemoryState) => void;
  onTraceReady?: (trace: BuddyTurnTrace) => void;
}

/**
 * Executes a single finalized conversation turn with strict parallel isolation,
 * shared session context, and full trace telemetry.
 */
export async function orchestrateBuddyTurn(params: {
  packet: FinalizedTurnPacket;
  personality: BuddyPersonality;
  mode: BuddyMode;
  intensity: CorrectionIntensity;
  memory: BuddyMemoryState;
  analytics: BuddyLearningAnalytics;
  apiKey?: string;
  model?: string;
  callbacks: OrchestratedTurnCallbacks;
}): Promise<{
  friendResult: BuddyFriendReplyResult;
  grammarAnalysis: BuddyGrammarAnalysis;
  trace: BuddyTurnTrace;
}> {
  const {
    packet,
    personality,
    mode,
    intensity,
    memory,
    analytics,
    apiKey,
    model,
    callbacks
  } = params;

  // Single shared session context computed once from strictly priorHistory + analysisTranscript
  const sessionCtx = extractSessionContext(packet.priorHistory, packet.analysisTranscript);

  // Safe long-term memory extraction (only when enabled & speech is clear)
  const memOutcome = extractAndStoreLongTermMemories(
    packet.analysisTranscript,
    packet.coherence.quality === 'unclear'
  );
  if (memOutcome.newlyAdded.length > 0 && callbacks.onMemoryUpdated) {
    callbacks.onMemoryUpdated(memOutcome.state);
  }

  const contextSnippet = packet.priorHistory
    .slice(-4)
    .map(m => `${m.role === 'user' ? 'User' : 'Buddy'}: ${m.text}`)
    .join(' | ');

  const topRecurringCat = getTopRecurringMistakes(analytics)[0]?.category || null;
  const activeMemories = memOutcome.state.enabled ? memOutcome.state.items : [];

  // Run Brain 2 (English Coach) in parallel without delaying Brain 1 (Friend Voice Reply)
  const gramStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const grammarPromise = analyzeBuddyGrammar({
    originalTranscript: packet.analysisTranscript,
    conversationContext: contextSnippet,
    intensity,
    mode,
    uncertainWords: packet.uncertainWords,
    sttConfidence: packet.sttConfidence,
    durationSec: packet.audioDurationSec,
    coherence: packet.coherence,
    apiKey,
    model
  }).then(analysis => {
    const gramEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const updatedAnalytics = recordTurnAnalytics(analysis, packet.audioDurationSec);
    let nextLib = loadGrammarLibrary();
    if (analysis.transcriptQuality !== 'unclear' && analysis.mistakes.length > 0) {
      for (const mk of analysis.mistakes) {
        if (mk.severity === 'GRAMMAR_ERROR' || mk.severity === 'UNNATURAL') {
          nextLib = saveMistakeToGrammarLibrary(mk, false);
        }
      }
    }
    callbacks.onGrammarAnalysisReady(analysis, updatedAnalytics, nextLib, packet);
    return {
      analysis,
      latencyMs: Math.max(1, Math.round(gramEnd - gramStart))
    };
  });

  // Run Brain 1 (AI Friend Responder — Real-Time SSE Streaming!)
  const friendResult = await generateBuddyFriendReply({
    userText: packet.analysisTranscript,
    history: packet.priorHistory,
    personality,
    mode,
    coherence: packet.coherence,
    context: sessionCtx,
    longTermMemories: activeMemories,
    topWeakCategory: topRecurringCat,
    apiKey,
    model,
    onPartialReply: (partialText) => {
      callbacks.onFriendPartialReply?.(partialText, packet);
    },
    onSentenceReady: (sentence) => {
      callbacks.onFriendSentenceReady?.(sentence, packet);
    }
  });

  // Deliver Friend Reply immediately so voice playback starts with zero wait for Grammar
  callbacks.onFriendReplyReady(friendResult, packet);

  const { analysis: grammarAnalysis, latencyMs: grammarLatencyMs } = await grammarPromise;

  const trace: BuddyTurnTrace = {
    turnId: packet.turnId,
    sessionId: packet.sessionId,
    timestamp: packet.timestamp,
    rawTranscript: packet.rawTranscript,
    finalizedVerbatimTranscript: packet.finalizedVerbatimTranscript,
    normalizedTranscript: packet.normalizedTranscript,
    analysisTranscript: packet.analysisTranscript,
    coherenceQuality: packet.coherence.quality,
    intent: friendResult.intent,
    activeTopic: friendResult.activeTopic,
    activeSubject: friendResult.activeSubject,
    providerRequested: friendResult.providerRequested,
    providerUsed: friendResult.source,
    fallbackReason: friendResult.fallbackReason,
    friendLatencyMs: friendResult.latencyMs,
    grammarLatencyMs,
    grammarSource: grammarAnalysis.analyzerSource,
    mistakesCount: grammarAnalysis.mistakes.length,
    replyPreview: friendResult.reply.slice(0, 90)
  };

  if (callbacks.onTraceReady) {
    callbacks.onTraceReady(trace);
  }

  return { friendResult, grammarAnalysis, trace };
}
