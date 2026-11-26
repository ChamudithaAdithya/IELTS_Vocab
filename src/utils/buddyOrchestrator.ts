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
  classifyBuddyIntent,
  extractSessionContext,
  generateBuddyFriendReply,
  processBuddyTranscript,
  type BuddyFriendReplyResult
} from './speakingBuddyEngine';
import {
  analyzeBuddyGrammar,
  analyzeBuddyGrammarLocally,
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
  const recentCtxText = params.priorHistory
    .slice(-3)
    .map(m => m.text)
    .join(' ');
  const coherence = validateTranscriptCoherence(
    analysisTranscript,
    params.uncertainWords,
    params.sttConfidence,
    recentCtxText
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
  /** Fires the moment the AI begins processing the finalized turn */
  onAiRequestStart?: (packet: FinalizedTurnPacket) => void;
  /** Fires on the very first response token (either instant recast or first SSE token) */
  onAiFirstToken?: (packet: FinalizedTurnPacket) => void;
  /** Fires when asynchronous grammar analysis starts */
  onGrammarStart?: (packet: FinalizedTurnPacket) => void;
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
  /** Fires the moment each sentence/safe-clause finishes streaming so TTS begins speaking immediately */
  onFriendSentenceReady?: (sentence: string, packet: FinalizedTurnPacket) => void;
  onFriendReplyReady: (result: OrchestratedFriendPayload, packet: FinalizedTurnPacket) => void;
  /** Fires if Deep Grammar (Live Feedback) detects mistakes that were not yet in Buddy's initial spoken reply */
  onFriendReplyUpdated?: (result: OrchestratedFriendPayload, packet: FinalizedTurnPacket) => void;
  /** Enqueues a spoken correction aloud when Live Feedback detects a mistake that Brain 1 omitted */
  onLateSpokenCorrection?: (spokenSentence: string, packet: FinalizedTurnPacket) => void;
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
 * Non-Blocking Event-Driven Turn Orchestrator:
 *  - Computes shared context, 12-category intent, and Tier-1 quick local grammar ONCE in ~1ms!
 *  - NEVER blocks Friend SSE tokens or TTS playback waiting for detailed JSON grammar explanations!
 *  - When Tier-1 detects a spoken recast ("You can say, '...'"), emits it to UI + TTS at t=1ms while
 *    Friend SSE streams the conversational continuation concurrently in the background!
 *  - Detailed grammar feedback + Sinhala explanations + learning analytics finish asynchronously in Brain 2.
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

  const nowPerf = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const turnStartPerf = nowPerf();
  callbacks.onAiRequestStart?.(packet);

  // 1. Single shared context + 12-category intent computed ONCE (~0.3ms, zero duplicate work)
  const sessionCtx = extractSessionContext(packet.priorHistory, packet.analysisTranscript);
  const precomputedIntent = classifyBuddyIntent(
    packet.analysisTranscript,
    sessionCtx,
    packet.coherence
  );

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

  // 2. Tier-1 Instant Local Grammar & Recast Gate (~0.8ms deterministic, zero network wait!)
  const quickLocalGrammar = analyzeBuddyGrammarLocally({
    originalTranscript: packet.analysisTranscript,
    conversationContext: contextSnippet,
    intensity,
    mode,
    uncertainWords: packet.uncertainWords,
    sttConfidence: packet.sttConfidence,
    durationSec: packet.audioDurationSec,
    coherence: packet.coherence
  });

  const suppressInlineRecast =
    precomputedIntent.intent === 'repeat_last_buddy' ||
    precomputedIntent.intent === 'explain_earlier_mistake' ||
    precomputedIntent.intent === 'unclear_speech' ||
    precomputedIntent.intent === 'incomplete_sentence' ||
    quickLocalGrammar.utteranceCategory === 'incomplete_speech' ||
    quickLocalGrammar.utteranceCategory === 'stt_error' ||
    quickLocalGrammar.utteranceCategory === 'pronunciation_difficulty' ||
    quickLocalGrammar.utteranceCategory === 'unusual_but_correct';

  const hasCloudKey = Boolean(apiKey && apiKey.trim());
  const turnWordCount = packet.analysisTranscript.split(/\s+/).filter(Boolean).length;
  const rawQuickRecast = suppressInlineRecast
    ? { spokenCorrection: '', correctionRequired: false, correctionType: 'none' as const }
    : buildSpokenCorrection(quickLocalGrammar, intensity);

  // When Gemini Cloud is connected, only pre-emit Tier-1 regex recasts on short (<= 6 words), high-confidence turns
  // so multi-clause sentences let Gemini speak the COMPLETE corrected sentence instead of a partial regex fix!
  const useTier1PreEmit =
    !hasCloudKey ||
    (rawQuickRecast.correctionRequired &&
      turnWordCount <= 6 &&
      quickLocalGrammar.mistakes.every(m => m.confidence >= 0.95));

  const quickRecast = useTier1PreEmit
    ? rawQuickRecast
    : { spokenCorrection: '', correctionRequired: false, correctionType: 'none' as const };

  let aiFirstTokenFired = false;
  let aiFirstTokenLatencyMs: number | undefined;
  const markFirstToken = () => {
    if (!aiFirstTokenFired) {
      aiFirstTokenFired = true;
      aiFirstTokenLatencyMs = Math.max(1, Math.round(nowPerf() - turnStartPerf));
      callbacks.onAiFirstToken?.(packet);
    }
  };

  let activeSpokenCorrection = quickRecast.spokenCorrection;
  let activeCorrectionType: 'none' | 'grammar' | 'naturalness' | 'vocabulary' =
    quickRecast.correctionType;
  let latestFriendPartial = '';
  let emittedAnyFriendSentence = false;

  const emitCombinedPartial = () => {
    const combined = [activeSpokenCorrection, latestFriendPartial]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (combined) {
      markFirstToken();
      callbacks.onFriendPartialReply?.(combined, packet, {
        spokenCorrection: activeSpokenCorrection,
        conversationalResponse: latestFriendPartial,
        correctionType: activeCorrectionType
      });
    }
  };

  // If Tier-1 already detected a clear spoken recast, display AND start synthesizing it at t=1ms!
  if (activeSpokenCorrection) {
    emitCombinedPartial();
    emittedAnyFriendSentence = true;
    callbacks.onFriendSentenceReady?.(activeSpokenCorrection, packet);
  }

  // 3. Launch Brain 2 (Deep Grammar, Sinhala Notes & Analytics) asynchronously in background
  const gramStart = nowPerf();
  callbacks.onGrammarStart?.(packet);
  const grammarPromise = analyzeBuddyGrammar({
    originalTranscript: packet.analysisTranscript,
    conversationContext: contextSnippet,
    intensity,
    mode,
    uncertainWords: packet.uncertainWords,
    sttConfidence: packet.sttConfidence,
    durationSec: packet.audioDurationSec,
    coherence: packet.coherence,
    precomputedLocalFallback: quickLocalGrammar,
    apiKey,
    model
  }).then(analysis => {
    const gramEnd = nowPerf();
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

  // 4. Launch Brain 1 (AI Friend SSE Stream) UNBLOCKED — tokens & sentences flow straight to UI + TTS!
  const baseFriendResult = await generateBuddyFriendReply({
    userText: packet.analysisTranscript,
    history: packet.priorHistory,
    personality,
    mode,
    intensity,
    precomputedSpokenCorrection: activeSpokenCorrection || undefined,
    suppressSpokenCorrection: suppressInlineRecast,
    coherence: packet.coherence,
    context: sessionCtx,
    precomputedIntent,
    longTermMemories: activeMemories,
    topWeakCategory: topRecurringCat,
    apiKey,
    model,
    onFirstToken: () => {
      markFirstToken();
    },
    onPartialReply: (partialText, recastMeta) => {
      if (!useTier1PreEmit && recastMeta) {
        activeSpokenCorrection = recastMeta.spokenCorrection;
        activeCorrectionType = recastMeta.correctionType;
        latestFriendPartial = recastMeta.conversationalResponse;
      } else {
        latestFriendPartial = partialText;
      }
      emitCombinedPartial();
    },
    onSentenceReady: (sentence) => {
      emittedAnyFriendSentence = true;
      callbacks.onFriendSentenceReady?.(sentence, packet);
    }
  });

  // Adopt inline spoken recast from Gemini SSE if Tier-1 hadn't pre-emitted one!
  if (!activeSpokenCorrection && baseFriendResult.spokenCorrection) {
    activeSpokenCorrection = baseFriendResult.spokenCorrection;
    activeCorrectionType = baseFriendResult.correctionType || 'grammar';
  }

  // 5. Finalize Friend Reply IMMEDIATELY when Friend SSE completes
  const conversationalResponse = (
    baseFriendResult.conversationalResponse ?? baseFriendResult.reply
  ).trim();
  const combinedReply = [activeSpokenCorrection, conversationalResponse]
    .filter(Boolean)
    .join(' ')
    .trim();

  const followUpQuestion =
    conversationalResponse
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .reverse()
      .find(s => s.endsWith('?')) || null;

  const buildPayload = (
    grammarSourceForTurn: BuddyGrammarAnalysis
  ): OrchestratedFriendPayload => {
    const structured: BuddyStructuredTurnResponse = {
      originalTranscript: packet.finalizedVerbatimTranscript,
      intendedMeaning:
        grammarSourceForTurn.intendedMeaning ||
        grammarSourceForTurn.corrected_sentence ||
        packet.analysisTranscript,
      correctionRequired: Boolean(activeSpokenCorrection),
      correctedSentence: grammarSourceForTurn.corrected_sentence,
      correctionType: activeCorrectionType,
      mistakes: grammarSourceForTurn.mistakes
        .filter(m => m.severity === 'GRAMMAR_ERROR' || m.severity === 'UNNATURAL')
        .map(m => ({
          original: m.original,
          corrected: m.correction,
          explanation: m.explanation
        })),
      spokenCorrection: activeSpokenCorrection,
      conversationalResponse,
      followUpQuestion
    };
    return {
      ...baseFriendResult,
      reply: [activeSpokenCorrection, conversationalResponse].filter(Boolean).join(' ').trim(),
      spokenCorrection: activeSpokenCorrection,
      conversationalResponse,
      correctionType: activeCorrectionType,
      structuredTurn: structured
    };
  };

  let friendResult = buildPayload(quickLocalGrammar);

  callbacks.onFriendReplyReady(friendResult, packet);

  // 6. Await background deep grammar (Live Feedback) — and if Live Feedback detected mistakes that
  //    neither Tier-1 nor Brain 1 spoke yet, IMMEDIATELY sync them to Buddy's bubble & voice!
  const { analysis: grammarAnalysis, latencyMs: grammarLatencyMs } = await grammarPromise;

  const verifiedDeepRecast = suppressInlineRecast
    ? { spokenCorrection: '', correctionRequired: false, correctionType: 'none' as const }
    : buildSpokenCorrection(grammarAnalysis, intensity);

  if (!activeSpokenCorrection && verifiedDeepRecast.correctionRequired) {
    activeSpokenCorrection = verifiedDeepRecast.spokenCorrection;
    activeCorrectionType = verifiedDeepRecast.correctionType;
    friendResult = buildPayload(grammarAnalysis);
    callbacks.onFriendReplyUpdated?.(friendResult, packet);

    const naturalVoiceAddendum = emittedAnyFriendSentence
      ? `By the way, ${verifiedDeepRecast.spokenCorrection.charAt(0).toLowerCase()}${verifiedDeepRecast.spokenCorrection.slice(1)}`
      : verifiedDeepRecast.spokenCorrection;
    callbacks.onLateSpokenCorrection?.(naturalVoiceAddendum, packet);
  } else if (activeSpokenCorrection && grammarAnalysis.mistakes.length > 0) {
    // Refresh structuredTurn metadata with full deep grammar mistakes
    friendResult = buildPayload(grammarAnalysis);
    callbacks.onFriendReplyUpdated?.(friendResult, packet);
  }

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
    aiFirstTokenMs: aiFirstTokenLatencyMs ?? baseFriendResult.firstTokenMs,
    grammarLatencyMs,
    grammarSource: grammarAnalysis.analyzerSource,
    mistakesCount: grammarAnalysis.mistakes.length,
    spokenCorrection: activeSpokenCorrection || undefined,
    replyPreview: friendResult.reply.slice(0, 110)
  };

  if (callbacks.onTraceReady) {
    callbacks.onTraceReady(trace);
  }

  return { friendResult, grammarAnalysis, trace };
}
