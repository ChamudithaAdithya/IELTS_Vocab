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
  BuddyStructuredTurnResponse,
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
  buildSpokenCorrection,
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

export interface OrchestratedFriendPayload extends BuddyFriendReplyResult {
  spokenCorrection: string;
  conversationalResponse: string;
  correctionType: 'none' | 'grammar' | 'naturalness' | 'vocabulary';
  structuredTurn: BuddyStructuredTurnResponse;
}

export interface OrchestratedTurnCallbacks {
  /** Fires live as tokens stream so the Buddy chat bubble renders in real time */
  onFriendPartialReply?: (
    partialText: string,
    packet: FinalizedTurnPacket,
    meta?: {
      spokenCorrection: string;
      conversationalResponse: string;
      correctionType: 'none' | 'grammar' | 'naturalness' | 'vocabulary';
    }
  ) => void;
  /** Fires the moment each sentence finishes streaming so TTS begins speaking immediately */
  onFriendSentenceReady?: (sentence: string, packet: FinalizedTurnPacket) => void;
  onFriendReplyReady: (result: OrchestratedFriendPayload, packet: FinalizedTurnPacket) => void;
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
 * Executes a single finalized conversation turn with:
 *  - Parallel Brain 1 (Friend SSE Stream) + Brain 2 (Grammar Coach) launched simultaneously at t=0ms
 *  - Ordered Stream Merger: prepends the exact mode-adapted `spokenCorrection` ("You can say, '...'")
 *    right BEFORE the streaming `conversationalResponse` so Lingo Buddy speaks with ONE seamless human voice
 *    and NEVER contradicts the right-hand Grammar Feedback panel!
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
  friendResult: OrchestratedFriendPayload;
  grammarAnalysis: BuddyGrammarAnalysis;
  trace: BuddyTurnTrace;
}> {
  const {
    packet,
    personality,
    mode,
    intensity,
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

  // Ordered stream merger state — holds live friend tokens briefly until grammar resolves so
  // `spokenCorrection` is spoken & displayed FIRST with 0% contradiction and parallel speed!
  let grammarResolved = false;
  let resolvedSpokenCorrection = '';
  let resolvedCorrectionType: 'none' | 'grammar' | 'naturalness' | 'vocabulary' = 'none';
  let latestFriendPartial = '';
  const pendingFriendSentences: string[] = [];

  const emitCombinedPartial = () => {
    const combined = [resolvedSpokenCorrection, latestFriendPartial]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (combined) {
      callbacks.onFriendPartialReply?.(combined, packet, {
        spokenCorrection: resolvedSpokenCorrection,
        conversationalResponse: latestFriendPartial,
        correctionType: resolvedCorrectionType
      });
    }
  };

  // Launch Brain 2 (English Coach) at t=0ms
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

    const recast = buildSpokenCorrection(analysis, intensity);
    grammarResolved = true;
    resolvedSpokenCorrection = recast.spokenCorrection;
    resolvedCorrectionType = recast.correctionType;

    // 1. Update right-hand Grammar Coach panel immediately
    callbacks.onGrammarAnalysisReady(analysis, updatedAnalytics, nextLib, packet);

    // 2. Speak the short inline recast FIRST (if any), then flush any already-streamed friend sentences!
    if (resolvedSpokenCorrection) {
      callbacks.onFriendSentenceReady?.(resolvedSpokenCorrection, packet);
    }
    while (pendingFriendSentences.length > 0) {
      const s = pendingFriendSentences.shift();
      if (s) callbacks.onFriendSentenceReady?.(s, packet);
    }
    emitCombinedPartial();

    return {
      analysis,
      recast,
      latencyMs: Math.max(1, Math.round(gramEnd - gramStart))
    };
  });

  // Launch Brain 1 (AI Friend Responder — Real-Time SSE Streaming!) simultaneously at t=0ms
  const rawFriendPromise = generateBuddyFriendReply({
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
      latestFriendPartial = partialText;
      if (grammarResolved) {
        emitCombinedPartial();
      }
    },
    onSentenceReady: (sentence) => {
      if (grammarResolved) {
        callbacks.onFriendSentenceReady?.(sentence, packet);
      } else {
        pendingFriendSentences.push(sentence);
      }
    }
  });

  const [{ analysis: grammarAnalysis, recast, latencyMs: grammarLatencyMs }, baseFriendResult] =
    await Promise.all([grammarPromise, rawFriendPromise]);

  // Suppress inline recast only when user specifically asked to repeat last message or explain an earlier mistake
  const suppressInlineRecast =
    baseFriendResult.intent === 'repeat_last_buddy' ||
    baseFriendResult.intent === 'explain_earlier_mistake' ||
    baseFriendResult.intent === 'unclear_speech' ||
    baseFriendResult.intent === 'incomplete_sentence';

  const finalSpokenCorrection = suppressInlineRecast ? '' : recast.spokenCorrection;
  const finalCorrectionType = suppressInlineRecast ? 'none' : recast.correctionType;
  const conversationalResponse = baseFriendResult.reply.trim();
  const combinedReply = [finalSpokenCorrection, conversationalResponse]
    .filter(Boolean)
    .join(' ')
    .trim();

  const followUpQuestion =
    conversationalResponse
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .reverse()
      .find(s => s.endsWith('?')) || null;

  const structuredTurn: BuddyStructuredTurnResponse = {
    originalTranscript: packet.finalizedVerbatimTranscript,
    intendedMeaning:
      grammarAnalysis.intendedMeaning ||
      grammarAnalysis.corrected_sentence ||
      packet.analysisTranscript,
    correctionRequired: Boolean(finalSpokenCorrection),
    correctedSentence: grammarAnalysis.corrected_sentence,
    correctionType: finalCorrectionType,
    mistakes: grammarAnalysis.mistakes
      .filter(m => m.severity === 'GRAMMAR_ERROR' || m.severity === 'UNNATURAL')
      .map(m => ({
        original: m.original,
        corrected: m.correction,
        explanation: m.explanation
      })),
    spokenCorrection: finalSpokenCorrection,
    conversationalResponse,
    followUpQuestion
  };

  const friendResult: OrchestratedFriendPayload = {
    ...baseFriendResult,
    reply: combinedReply,
    spokenCorrection: finalSpokenCorrection,
    conversationalResponse,
    correctionType: finalCorrectionType,
    structuredTurn
  };

  callbacks.onFriendReplyReady(friendResult, packet);

  const trace: BuddyTurnTrace = {
    turnId: packet.turnId,
    sessionId: packet.sessionId,
    timestamp: packet.timestamp,
    rawTranscript: packet.rawTranscript,
    finalizedVerbatimTranscript: packet.finalizedVerbatimTranscript,
    normalizedTranscript: packet.normalizedTranscript,
    analysisTranscript: packet.analysisTranscript,
    coherenceQuality: packet.coherence.quality,
    conversationalIntent: friendResult.conversationalIntent,
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
    spokenCorrection: finalSpokenCorrection || undefined,
    replyPreview: combinedReply.slice(0, 110)
  };

  if (callbacks.onTraceReady) {
    callbacks.onTraceReady(trace);
  }

  return { friendResult, grammarAnalysis, trace };
}
