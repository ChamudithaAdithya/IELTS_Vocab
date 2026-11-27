/**
 * AI Speaking Buddy (Lingo Buddy) — Phase 2 Dedicated English Correction Engine
 * Coordinates Stage A Coherence/Phonetics, Declarative Grammar Patterns, Spoken Recast Generation,
 * and Stage B Gemini Structured JSON Analysis.
 */

import type {
  BuddyGrammarAnalysis,
  BuddyMistake,
  BuddyMode,
  BuddyUtteranceCategory,
  CorrectionIntensity,
  FeedbackSeverity,
  GrammarCategoryCode,
  TranscriptCoherenceResult,
  TranscriptQuality
} from '../types/speakingBuddy';
import {
  analyzeBuddyFluency,
  extractPronunciationSpotlights
} from './buddySpeechCoach';
import {
  discoverFastVoiceModelsForKey,
  getFastVoiceModelCandidates,
  markDeadGeminiModel,
  markVerifiedFastVoiceModel
} from './speakingEngine';
import {
  detectContextualWordInterpretation,
  detectIncompleteSpeech,
  detectUnusualButCorrectExpression,
  validateTranscriptCoherence
} from './buddyCoherenceAndPhonetics';
import {
  CATEGORY_LABELS,
  detectVocabUpgrades,
  LOCAL_BUDDY_PATTERNS,
  preservesInitialCap,
  type LocalGrammarPattern
} from './buddyGrammarPatterns';

export {
  CATEGORY_LABELS,
  detectContextualWordInterpretation,
  detectIncompleteSpeech,
  detectUnusualButCorrectExpression,
  detectVocabUpgrades,
  LOCAL_BUDDY_PATTERNS,
  preservesInitialCap,
  validateTranscriptCoherence,
  type LocalGrammarPattern
};

/**
 * Local Offline Grammar Analyzer (Instant < 15ms, High-Precision, Zero False Positives on Valid English).
 * Runs Stage A (Transcription Coherence Validation) BEFORE Stage B (Grammar Analysis).
 * Respects uncertainWords (STT Confidence Guard) and CorrectionIntensity.
 */
export function analyzeBuddyGrammarLocally(params: {
  originalTranscript: string;
  conversationContext?: string;
  intensity?: CorrectionIntensity;
  mode?: BuddyMode;
  uncertainWords?: string[];
  sttConfidence?: number;
  durationSec?: number;
  coherence?: TranscriptCoherenceResult;
}): BuddyGrammarAnalysis {
  const {
    originalTranscript,
    conversationContext = '',
    intensity = 'balanced',
    mode = 'friendly',
    uncertainWords = [],
    sttConfidence,
    durationSec,
    coherence: providedCoherence
  } = params;
  const clean = originalTranscript.trim();
  const coherence =
    providedCoherence ||
    validateTranscriptCoherence(clean, uncertainWords, sttConfidence, conversationContext);

  // Stage A Gate 1: If transcript is incoherent / garbled STT, NEVER pretend it's "Clean, natural English"!
  if (coherence.quality === 'unclear') {
    return {
      original_sentence: clean,
      corrected_sentence: clean,
      mistakes: [],
      natural_expression: null,
      learning_recommendation: null,
      transcriptQuality: 'unclear',
      utteranceCategory: 'unclear_speech',
      clarificationNote:
        coherence.clarificationHint ||
        coherence.reason ||
        "That sounded unclear — try speaking again or click Edit to fix any misheard words.",
      skippedUncertainWords: uncertainWords.length > 0 ? uncertainWords : undefined,
      analyzerSource: 'local',
      analyzedAt: Date.now()
    };
  }

  // Stage A Gate 2: Incomplete / trailing learner speech ("About my...", "I was thinking...")
  // NEVER generate unnecessary grammar corrections for an unfinished thought!
  if (coherence.utteranceCategory === 'incomplete_speech') {
    return {
      original_sentence: clean,
      corrected_sentence: clean,
      mistakes: [],
      natural_expression: null,
      learning_recommendation: null,
      transcriptQuality: 'partially_unclear',
      utteranceCategory: 'incomplete_speech',
      clarificationNote:
        coherence.clarificationHint ||
        'No grammar mistake here — it sounds like you were still finishing your thought. Keep going whenever you are ready!',
      isProvisional: true,
      analyzerSource: 'local',
      analyzedAt: Date.now()
    };
  }

  const contextualWord =
    coherence.contextualWord || detectContextualWordInterpretation(clean, conversationContext);
  const phoneticExemptWord = contextualWord?.heardWord.toLowerCase();

  const uncertainSet = new Set(uncertainWords.map(w => w.toLowerCase()));
  if (phoneticExemptWord) {
    uncertainSet.add(phoneticExemptWord);
  }
  const skippedUncertain = new Set<string>();

  interface SpanMatch {
    start: number;
    end: number;
    mistake: BuddyMistake;
  }

  const rawMatches: SpanMatch[] = [];

  for (const pat of LOCAL_BUDDY_PATTERNS) {
    // Intensity gating: Gentle focuses on genuine GRAMMAR_ERRORs and clear UNNATURAL phrasings
    if (
      intensity === 'gentle' &&
      pat.severity !== 'GRAMMAR_ERROR' &&
      pat.severity !== 'UNNATURAL'
    ) {
      continue;
    }
    // Balanced keeps GRAMMAR_ERROR & UNNATURAL, plus at most 1 ADVANCED vocab hint
    pat.regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pat.regex.exec(clean)) !== null) {
      const span = pat.getSpan ? pat.getSpan(m) : null;
      const matchedText = span ? span.original : m[0];
      const matchStart = m.index + (span ? span.startOffset : 0);
      const matchEnd = m.index + (span ? span.endOffset : m[0].length);
      const matchTokens = matchedText
        .toLowerCase()
        .replace(/[^a-z0-9'\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

      // STT Confidence Guard: never blame learner for a low-confidence STT token!
      const overlapsUncertain = matchTokens.some(tok => uncertainSet.has(tok));
      if (overlapsUncertain && pat.severity === 'GRAMMAR_ERROR') {
        matchTokens.filter(t => uncertainSet.has(t)).forEach(t => skippedUncertain.add(t));
        continue;
      }

      const rawCorr = pat.getCorrection(m, clean);
      const finalCorr = preservesInitialCap(matchedText, rawCorr);

      // Guard: never report a "mistake" if correction equals original
      if (finalCorr.toLowerCase() === matchedText.toLowerCase()) continue;

      rawMatches.push({
        start: matchStart,
        end: matchEnd,
        mistake: {
          id: `${pat.id}-${matchStart}`,
          original: matchedText,
          correction: finalCorr,
          category: pat.category,
          categoryLabel: CATEGORY_LABELS[pat.category],
          severity: pat.severity,
          explanation: pat.explanation,
          simpleExplanation: pat.simpleExplanation,
          explanationSi: pat.explanationSi,
          verbFormTable: pat.verbFormTable,
          sinhalaTransferNote: pat.sinhalaTransferNote,
          grammar_rule: pat.grammar_rule,
          example: pat.example,
          more_examples: pat.more_examples,
          learning_tip: pat.learning_tip,
          confidence: pat.confidence,
          learned: false,
          isProvisional: pat.isProvisional
        }
      });

      if (!pat.regex.global) break;
    }
  }

  // Contextual Past-Tense Agreement:
  // If the AI's immediately preceding turn asked a past-tense question ("What did you do today?", "Where did you go?", "How was your weekend?")
  // and the user answered with a bare present-simple action ("I just stay at home", "I watch a movie", "I go to the park"),
  // catch the past-tense error using conversation context!
  const lastBuddyPart = conversationContext.split('|').pop() || conversationContext;
  const aiAskedPastQuestion =
    /\b(?:what|where|who|how|when)\s+did\s+you\b|\bdid\s+you\s+(?:do|go|have|watch|eat|see|buy|enjoy|get|finish|meet)\b|\bwhat\s+happened\b|\bhow\s+was\s+your\b/i.test(
      lastBuddyPart
    );
  if (aiAskedPastQuestion && !/\b(usually|always|every\s+day|normally|often|tomorrow)\b/i.test(clean)) {
    const ctxPastRegex = /\b(I|we|they)\s+(?:(just|only|mostly|really)\s+)?(stay|watch|play|go|eat|sleep|cook|work|study|visit|meet|buy|walk|clean|rest|relax)\b(?!\s+to\b)/gi;
    let cm: RegExpExecArray | null;
    const pastVerbLookup: Record<string, string> = {
      stay: 'stayed',
      watch: 'watched',
      play: 'played',
      go: 'went',
      eat: 'ate',
      sleep: 'slept',
      cook: 'cooked',
      work: 'worked',
      study: 'studied',
      visit: 'visited',
      meet: 'met',
      buy: 'bought',
      walk: 'walked',
      clean: 'cleaned',
      rest: 'rested',
      relax: 'relaxed'
    };
    while ((cm = ctxPastRegex.exec(clean)) !== null) {
      const verb = cm[3];
      const verbStart = cm.index + cm[0].length - verb.length;
      const verbEnd = cm.index + cm[0].length;
      if (uncertainSet.has(verb.toLowerCase())) continue;
      const pastForm = pastVerbLookup[verb.toLowerCase()];
      if (!pastForm) continue;
      rawMatches.push({
        start: verbStart,
        end: verbEnd,
        mistake: {
          id: `ctx-past-${verbStart}`,
          original: verb,
          correction: preservesInitialCap(verb, pastForm),
          category: 'VERB_TENSE',
          categoryLabel: CATEGORY_LABELS.VERB_TENSE,
          severity: 'GRAMMAR_ERROR',
          explanation: `Because the question asked about a past time ("What did you do today?"), use the past tense "${pastForm}" instead of "${verb}".`,
          simpleExplanation: `Use the past tense "${pastForm}" when talking about earlier today.`,
          explanationSi: 'ප්‍රශ්නයෙන් අතීතයේ කළ දෙයක් ("What did you do today?") ඇසූ බැවින් ක්‍රියාපදය අතීත කාලයෙන් ("' + pastForm + '") යෙදිය යුතුය.',
          grammar_rule: 'Contextual Past Simple: Answer "What did you do...?" with a past-tense verb',
          example: `I just ${pastForm} at home and relaxed.`,
          learning_tip: 'When a question uses "did", answer with a past-tense verb!',
          confidence: 0.96,
          learned: false
        }
      });
    }
  }

  // Contextual Habitual Present-Simple Agreement:
  // If the AI's preceding question asked about a habit/routine ("What do you usually do in your free time?")
  // and vf-bare-ing-present turned "I watching..." into "I'm watching...", prefer simple present ("I watch...")!
  const aiAskedHabitQuestion =
    /\b(?:what|where|how)\s+do\s+you\s+(?:usually|normally|often|like\s+to)\b|\bin\s+your\s+free\s+time\b|\bon\s+weekends\b/i.test(
      lastBuddyPart
    );
  if (aiAskedHabitQuestion && !/\b(right\s+now|at\s+the\s+moment|currently|today|tonight|yesterday)\b/i.test(clean)) {
    const habitBaseMap: Record<string, string> = {
      watching: 'watch',
      going: 'go',
      doing: 'do',
      eating: 'eat',
      playing: 'play',
      working: 'work',
      studying: 'study',
      staying: 'stay',
      reading: 'read',
      cooking: 'cook',
      walking: 'walk',
      running: 'run',
      sleeping: 'sleep'
    };
    for (const item of rawMatches) {
      if (item.mistake.id.startsWith('vf-bare-ing-present-')) {
        const parts = item.mistake.original.trim().split(/\s+/);
        const subj = parts[0];
        const ing = (parts[1] || '').toLowerCase();
        if (/^(i|we|they|you)$/i.test(subj) && habitBaseMap[ing]) {
          item.mistake.correction = `${subj} ${habitBaseMap[ing]}`;
          item.mistake.category = 'VERB_TENSE';
          item.mistake.categoryLabel = CATEGORY_LABELS.VERB_TENSE;
          item.mistake.explanation =
            'Because the question asks what you usually do, use the simple present tense ("' +
            `${subj} ${habitBaseMap[ing]}` +
            '").';
          item.mistake.simpleExplanation = `Use "${subj} ${habitBaseMap[ing]}" for things you usually do.`;
        }
      }
    }
  }

  // Deduplicate overlapping spans (prefer earlier match, then higher severity, preserving pattern priority order)
  const sevRank = (s: FeedbackSeverity) => (s === 'GRAMMAR_ERROR' ? 0 : s === 'UNNATURAL' ? 1 : 2);
  rawMatches.sort((a, b) => a.start - b.start || sevRank(a.mistake.severity) - sevRank(b.mistake.severity));
  const accepted: SpanMatch[] = [];
  let cursorEnd = -1;
  for (const item of rawMatches) {
    if (item.start >= cursorEnd) {
      accepted.push(item);
      cursorEnd = item.end;
    }
  }

  // Filter count by intensity
  let filtered = accepted;
  if (intensity === 'gentle') {
    filtered = accepted.slice(0, 2);
  } else if (intensity === 'balanced') {
    let advCount = 0;
    filtered = accepted.filter(item => {
      if (item.mistake.severity === 'ADVANCED') {
        advCount += 1;
        return advCount <= 1;
      }
      return true;
    });
  }

  // Reconstruct corrected_sentence by applying GRAMMAR_ERROR & UNNATURAL fixes cleanly
  let correctedSentence = clean;
  const fixesToApply = filtered
    .filter(f => f.mistake.severity === 'GRAMMAR_ERROR' || f.mistake.severity === 'UNNATURAL')
    .sort((a, b) => b.start - a.start);

  for (const f of fixesToApply) {
    correctedSentence =
      correctedSentence.slice(0, f.start) +
      f.mistake.correction +
      correctedSentence.slice(f.end);
  }

  // Build optional natural_expression if only ADVANCED upgrades exist
  const advOnly = filtered.filter(f => f.mistake.severity === 'ADVANCED');
  let naturalExpression: string | null = null;
  if (advOnly.length > 0) {
    let upgraded = correctedSentence;
    for (const f of [...advOnly].sort((a, b) => b.start - a.start)) {
      upgraded = upgraded.replace(new RegExp(f.mistake.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), f.mistake.correction);
    }
    if (upgraded !== correctedSentence) {
      naturalExpression = upgraded;
    }
  }

  const mistakes = filtered.map(f => f.mistake);
  const topCat = mistakes.find(m => m.severity === 'GRAMMAR_ERROR')?.categoryLabel;
  const hasProvisional =
    coherence.quality === 'partially_unclear' || mistakes.some(m => m.isProvisional);
  const vocabUpgrades = detectVocabUpgrades(clean, correctedSentence, intensity, mode);

  // If multiple upgrades exist (e.g. "very good" + "very interesting"), build a combined fluent sentence
  if (!naturalExpression && vocabUpgrades.length > 0) {
    let combinedNatural = correctedSentence;
    for (const vu of vocabUpgrades) {
      const escaped = vu.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      combinedNatural = combinedNatural.replace(
        new RegExp(escaped, 'i'),
        preservesInitialCap(vu.original, vu.upgrades[0].word)
      );
    }
    if (combinedNatural.toLowerCase() !== correctedSentence.toLowerCase()) {
      naturalExpression = combinedNatural;
    }
  }

  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  // Only compute delivery/fluency stats on turns with >= 6 words (avoid grading "Hello." as 40 WPM!)
  const fluency = wordCount >= 6 ? analyzeBuddyFluency(clean, durationSec) : undefined;
  const pronunciationSpotlights = extractPronunciationSpotlights(clean, uncertainWords);

  const hasActionableGrammarMistake = mistakes.some(
    m => m.severity === 'GRAMMAR_ERROR' || m.severity === 'UNNATURAL'
  );
  const utteranceCategory: BuddyUtteranceCategory = hasActionableGrammarMistake
    ? 'grammar_mistake'
    : contextualWord
    ? contextualWord.kind
    : coherence.incompleteFragment
    ? 'incomplete_speech'
    : detectUnusualButCorrectExpression(clean)
    ? 'unusual_but_correct'
    : 'clean';

  return {
    original_sentence: clean,
    corrected_sentence: correctedSentence,
    mistakes,
    vocabUpgrades: vocabUpgrades.length > 0 ? vocabUpgrades : undefined,
    natural_expression: naturalExpression,
    learning_recommendation: topCat
      ? `Focus area: ${topCat} — keep practising this pattern in your next few turns.`
      : contextualWord
      ? `${contextualWord.kind === 'pronunciation_difficulty' ? 'Sound tip' : 'Context note'}: "${contextualWord.intendedWord}"${contextualWord.ipaComparison ? ` (${contextualWord.ipaComparison})` : ''}.`
      : vocabUpgrades.length > 0
      ? `Vocabulary boost: try swapping "${vocabUpgrades[0].original}" for "${vocabUpgrades[0].upgrades[0].word}".`
      : null,
    transcriptQuality: coherence.quality,
    utteranceCategory,
    contextualWord,
    clarificationNote:
      contextualWord?.phoneticNote || coherence.clarificationHint || coherence.reason,
    isProvisional: hasProvisional || undefined,
    fluency,
    pronunciationSpotlights: pronunciationSpotlights.length > 0 ? pronunciationSpotlights : undefined,
    skippedUncertainWords: skippedUncertain.size > 0 ? Array.from(skippedUncertain) : undefined,
    intendedMeaning: contextualWord
      ? clean.replace(
          new RegExp(`\\b${contextualWord.heardWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'),
          contextualWord.intendedWord
        )
      : undefined,
    analyzerSource: 'local',
    analyzedAt: Date.now()
  };
}

/**
 * Builds the natural, human spoken recast for Lingo Buddy's voice & chat response
 * directly from the canonical `BuddyGrammarAnalysis`, adapting cleanly to the 3 modes:
 *  - `gentle`   (Gentle Friend — Default): Short friendly recast ("You can say, '...'") with zero rules.
 *  - `balanced` (Balanced Coach):          Short recast + 1 brief, plain-English 1-clause reason.
 *  - `detailed` (Detailed Teacher):        Short recast + concise rule + 1 natural example.
 *
 * Guarantees 0% contradiction between Lingo Buddy's spoken correction and the right-hand Feedback panel!
 */
export function buildSpokenCorrection(
  analysis: BuddyGrammarAnalysis,
  intensity: CorrectionIntensity = 'gentle'
): {
  spokenCorrection: string;
  correctionRequired: boolean;
  correctionType: 'none' | 'grammar' | 'naturalness' | 'vocabulary';
} {
  // Never invent grammar corrections on unclear speech, incomplete thoughts, STT homophones, pronunciation slips, or valid unusual expressions!
  if (
    !analysis ||
    analysis.transcriptQuality === 'unclear' ||
    analysis.utteranceCategory === 'incomplete_speech' ||
    analysis.utteranceCategory === 'stt_error' ||
    analysis.utteranceCategory === 'pronunciation_difficulty' ||
    analysis.utteranceCategory === 'unusual_but_correct' ||
    (analysis.transcriptQuality === 'partially_unclear' && analysis.mistakes.length === 0)
  ) {
    return { spokenCorrection: '', correctionRequired: false, correctionType: 'none' };
  }

  const actionable = (analysis.mistakes || []).filter(
    m => m.severity === 'GRAMMAR_ERROR' || m.severity === 'UNNATURAL'
  );

  const origClean = (analysis.original_sentence || '').trim();
  const corrClean = (analysis.corrected_sentence || '').trim();

  if (
    actionable.length === 0 ||
    !corrClean ||
    corrClean.toLowerCase() === origClean.toLowerCase()
  ) {
    return { spokenCorrection: '', correctionRequired: false, correctionType: 'none' };
  }

  const hasGrammarError = actionable.some(m => m.severity === 'GRAMMAR_ERROR');
  const correctionType: 'grammar' | 'naturalness' = hasGrammarError ? 'grammar' : 'naturalness';

  // Smart multi-sentence focus: if the user spoke 2 short sentences (e.g. "Nothing much. I just stay at home.")
  // and ONLY one sentence changed, quote just the changed sentence so Lingo Buddy sounds concise and natural!
  let targetSentenceToQuote = corrClean;
  const origParts = origClean.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  const corrParts = corrClean.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  if (origParts.length > 1 && origParts.length === corrParts.length) {
    const changedParts = corrParts.filter(
      (cp, idx) => cp.toLowerCase() !== origParts[idx].toLowerCase()
    );
    if (changedParts.length === 1) {
      targetSentenceToQuote = changedParts[0];
    }
  }

  const quotedTarget = /[.!?]$/.test(targetSentenceToQuote)
    ? targetSentenceToQuote
    : `${targetSentenceToQuote}.`;

  const baseRecast =
    correctionType === 'grammar'
      ? `You can say, "${quotedTarget}"`
      : `A more natural way to say that is, "${quotedTarget}"`;

  // Gentle Friend (Default): strictly concise, warm recast with ZERO grammar lecture
  if (intensity === 'gentle') {
    return {
      spokenCorrection: baseRecast,
      correctionRequired: true,
      correctionType
    };
  }

  const primary = actionable.find(m => m.severity === 'GRAMMAR_ERROR') || actionable[0];
  const rawShortNote = (primary.simpleExplanation || primary.explanation || '')
    .split(/(?<=[.!?])\s+/)[0]
    .trim();
  const shortNote = rawShortNote
    ? /[.!?]$/.test(rawShortNote)
      ? rawShortNote
      : `${rawShortNote}.`
    : '';

  // Balanced Coach: short recast + 1 ultra-brief plain-English tip (no long lecture)
  if (intensity === 'balanced') {
    return {
      spokenCorrection: shortNote ? `${baseRecast} ${shortNote}` : baseRecast,
      correctionRequired: true,
      correctionType
    };
  }

  // Detailed Teacher: recast + short rule + 1 crisp spoken example (deep notes stay in Feedback panel)
  const ex = (primary.example || '').trim();
  const exClause = ex ? ` For example, "${/[.!?]$/.test(ex) ? ex : `${ex}.`}"` : '';
  return {
    spokenCorrection: `${baseRecast}${shortNote ? ` ${shortNote}` : ''}${exClause}`,
    correctionRequired: true,
    correctionType
  };
}

/**
 * Dedicated Phase 2, 3 & 4 Grammar + Vocabulary + Fluency Analyzer (Stage A Coherence + Stage B Gemini Structured JSON + Local Fallback).
 */
export async function analyzeBuddyGrammar(params: {
  originalTranscript: string;
  conversationContext: string;
  intensity: CorrectionIntensity;
  mode?: BuddyMode;
  uncertainWords?: string[];
  sttConfidence?: number;
  durationSec?: number;
  coherence?: TranscriptCoherenceResult;
  /** Optional precomputed local grammar baseline from Tier-1 instant recast gate (avoids duplicate work!) */
  precomputedLocalFallback?: BuddyGrammarAnalysis;
  apiKey?: string;
  model?: string;
}): Promise<BuddyGrammarAnalysis> {
  const {
    originalTranscript,
    conversationContext,
    intensity,
    mode = 'friendly',
    uncertainWords = [],
    sttConfidence,
    durationSec,
    coherence: providedCoherence,
    precomputedLocalFallback,
    apiKey,
    model
  } = params;

  const clean = originalTranscript.trim();
  if (!clean) {
    return {
      original_sentence: '',
      corrected_sentence: '',
      mistakes: [],
      natural_expression: null,
      learning_recommendation: null,
      transcriptQuality: 'unclear',
      analyzerSource: 'local',
      analyzedAt: Date.now()
    };
  }

  const coherence =
    providedCoherence ||
    validateTranscriptCoherence(clean, uncertainWords, sttConfidence, conversationContext);

  const localFallback =
    precomputedLocalFallback ||
    analyzeBuddyGrammarLocally({
      originalTranscript: clean,
      conversationContext,
      intensity,
      mode,
      uncertainWords,
      sttConfidence,
      durationSec,
      coherence
    });

  // Fast-path guard: never call Gemini to invent grammar errors on incomplete speech ("About my...", "I was thinking...")
  // or when no API key is configured!
  if (
    !apiKey ||
    !apiKey.trim() ||
    localFallback.utteranceCategory === 'incomplete_speech'
  ) {
    return localFallback;
  }

  const intensityInstruction =
    intensity === 'gentle'
      ? 'Gentle mode: return ONLY 1–2 major GRAMMAR_ERROR items that impact clarity. Ignore minor stylistic tweaks.'
      : intensity === 'detailed'
      ? 'Detailed mode: identify every meaningful grammar error, unnatural expression, and high-value vocabulary upgrade with clear rules and multiple examples.'
      : 'Balanced mode: identify meaningful grammar mistakes and clear unnatural expressions, plus at most 1 optional vocabulary upgrade if genuinely helpful.';

  const phoneticGuardClause = localFallback.contextualWord
    ? `CRITICAL STT/PRONUNCIATION GUARD: Transcript contains "${localFallback.contextualWord.heardWord}", which is a ${localFallback.contextualWord.kind} for "${localFallback.contextualWord.intendedWord}". NEVER mark "${localFallback.contextualWord.heardWord}" as a GRAMMAR_ERROR!`
    : 'CRITICAL: Distinguish between (1) genuine grammar mistakes, (2) STT homophone errors (e.g. "my carrier" for "career", "board" for "bored", "coarse" for "course"), (3) pronunciation minimal-pair slips ("I leave in Colombo" for "live"), (4) incomplete sentences ("About my...", "I was thinking..."), and (5) correct but unusual/formal expressions ("Seldom do I..."). NEVER mark STT errors, pronunciation slips, incomplete sentences, or valid unusual expressions as GRAMMAR_ERROR!';

  const uncertainClause =
    uncertainWords.length > 0
      ? `IMPORTANT STT CONFIDENCE GUARD: The speech-to-text microphone was uncertain about these words: [${uncertainWords.join(', ')}]. Do NOT penalize those words as GRAMMAR_ERROR.`
      : '';

  const prompt = `You are a dedicated, precision English Grammar & Speech-Coherence Analysis Engine (NOT a chatbot).
Perform TWO STAGES strictly in order:

STAGE A — TRANSCRIPTION COHERENCE CHECK:
- Evaluate whether "original_transcript" makes coherent sense or is likely garbled speech-to-text noise (e.g., random unrelated word salads like "Must will be cappuccino potato mango" or broken mic collisions like "No nothing resting thing I think happen").
- Set "transcript_quality" to:
  - "unclear": The meaning cannot be reliably understood (garbled STT/nonsense). In this case, return "mistakes": [], keep "corrected_sentence" identical to input, and write a warm, helpful "clarification_note" asking the user to repeat or edit. NEVER claim an unclear transcript is clean English!
  - "partially_unclear": One phrase looks like a mic slip, but the overall intended meaning is recoverable (e.g., "So when I question I put some ginger and cooking oil"). Provide a provisional correction with "is_provisional": true and a short "clarification_note".
  - "clear": The speaker's intended meaning is understandable (even if there are real grammar mistakes!).

STAGE B — DEEP SPOKEN GRAMMAR & NATURALNESS ANALYSIS (when quality is "clear" or "partially_unclear"):
1. Catch real spoken grammar errors accurately — including missing auxiliaries ("what you asking" -> "what you were asking"), broken word order / modals ("maybe will School not tomorrow" -> "there might not be school tomorrow"), missing noun objects after bare adjectives ("I will cook big" -> "I will cook a big meal", with is_provisional: true), verb tense, SVA, prepositions, articles, plurals, and conditionals.
2. Preserve the user's original meaning — NEVER invent unrelated facts or alter already-correct English unnecessarily.
3. Support BOTH British and American English equally (do NOT flag "travelling", "colour", "favourite", or "have got").
4. Classify every finding accurately using ONLY these 4 severities:
   - "GRAMMAR_ERROR": Genuine grammatical, tense, article, preposition, SVA, verb form, plural, missing-auxiliary, or word-order error.
   - "UNNATURAL": Grammatically acceptable, but non-idiomatic or cluttered (e.g., "I am having a doubt" -> "I have a question").
   - "ALTERNATIVE": Equally valid phrasing option.
   - "ADVANCED": More sophisticated vocabulary (e.g., "very good" -> "excellent"), NEVER labelled as incorrect.
5. ONLY when the sentence is genuinely clear AND natural, correct English, return "transcript_quality": "clear", "mistakes": [], and keep "corrected_sentence" identical to "original_transcript".
6. ${intensityInstruction}
7. ${uncertainClause}
8. ${phoneticGuardClause}
9. For each genuine grammar mistake, include a clear plain-English "explanation" AND a conceptual Sinhala "explanationSi".

INPUT:
${JSON.stringify({
  original_transcript: clean,
  conversation_context: conversationContext,
  correction_mode: intensity,
  stage_a_hint: coherence.quality,
  language: 'en'
})}

Respond STRICTLY in valid JSON matching this schema:
{
  "transcript_quality": "clear | partially_unclear | unclear",
  "clarification_note": "Short helpful note if partially_unclear or unclear, else null",
  "is_provisional": false,
  "corrected_sentence": "Full sentence with genuine errors fixed (identical to input if no errors or unclear)",
  "mistakes": [
    {
      "original": "exact wrong phrase from transcript",
      "correction": "exact corrected phrase",
      "category": "VERB_TENSE | ARTICLES | PREPOSITIONS | SVA | VERB_FORMS | PLURALS | SENTENCE_STRUCTURE | WORD_CHOICE | WORD_ORDER | CONDITIONALS | VOCABULARY | REPETITION",
      "severity": "GRAMMAR_ERROR | UNNATURAL | ALTERNATIVE | ADVANCED",
      "explanation": "Clear explanation of what was wrong and why",
      "explanationSi": "Clear conceptual explanation in Sinhala",
      "grammar_rule": "Short reusable grammar rule",
      "example": "Natural example sentence using the rule",
      "more_examples": ["Second example sentence"],
      "learning_tip": "Memorable tip to avoid repeating the mistake",
      "confidence": 0.96,
      "is_provisional": false
    }
  ],
  "natural_expression": null,
  "learning_recommendation": "Short actionable focus tip or null"
}`;

  const candidateModels = getFastVoiceModelCandidates(model, apiKey);
  if (candidateModels.length === 0) {
    candidateModels.push(...(await discoverFastVoiceModelsForKey(apiKey)));
  }
  let didLiveDiscovery = false;

  for (let idx = 0; idx < candidateModels.length; idx++) {
    const candidateModel = candidateModels[idx];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4800);

      const generationConfig: Record<string, any> = {
        temperature: 0.12,
        responseMimeType: 'application/json'
      };
      if (candidateModel.startsWith('gemini-2.5-flash')) {
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidateModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig
        })
      });

      clearTimeout(timeoutId);
      if (!response.ok) {
        if (response.status === 404) {
          markDeadGeminiModel(candidateModel, apiKey);
        }
        if (idx === candidateModels.length - 1 && !didLiveDiscovery) {
          didLiveDiscovery = true;
          const discovered = await discoverFastVoiceModelsForKey(apiKey);
          for (const dm of discovered) {
            if (!candidateModels.includes(dm)) candidateModels.push(dm);
          }
        }
        if ([400, 404, 429, 500, 503].includes(response.status)) continue;
        return localFallback;
      }

      markVerifiedFastVoiceModel(candidateModel, apiKey);

      const data = await response.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) continue;

      const parsed = JSON.parse(rawJson);
    const validCategories = new Set(Object.keys(CATEGORY_LABELS));
    const validSeverities = new Set<FeedbackSeverity>([
      'GRAMMAR_ERROR',
      'UNNATURAL',
      'ALTERNATIVE',
      'ADVANCED'
    ]);
    const validQualities = new Set<TranscriptQuality>(['clear', 'partially_unclear', 'unclear']);

    let resolvedQuality: TranscriptQuality = validQualities.has(parsed.transcript_quality)
      ? parsed.transcript_quality
      : coherence.quality;

    // Safety invariant: if local Stage A detected hard garble and Gemini returned 0 mistakes as "clear",
    // preserve Stage A's 'unclear' classification so we never show a false "Clean English" badge!
    if (coherence.quality === 'unclear' && resolvedQuality === 'clear' && (!Array.isArray(parsed.mistakes) || parsed.mistakes.length === 0)) {
      resolvedQuality = 'unclear';
    }

    const exemptHeardLower = localFallback.contextualWord?.heardWord.toLowerCase();
    const seenOriginals = new Set<string>();
    const mistakes: BuddyMistake[] =
      resolvedQuality === 'unclear'
        ? []
        : Array.isArray(parsed.mistakes)
        ? parsed.mistakes
            .filter((item: any) => {
              if (!item || !item.original || !item.correction) return false;
              const origKey = String(item.original).trim().toLowerCase();
              const corrKey = String(item.correction).trim().toLowerCase();
              if (!origKey || origKey === corrKey || seenOriginals.has(origKey)) return false;
              // Never blame the learner with a grammar mistake for an STT homophone or pronunciation minimal-pair word!
              if (exemptHeardLower && origKey.includes(exemptHeardLower)) return false;
              seenOriginals.add(origKey);
              return true;
            })
            .map((item: any, idx: number): BuddyMistake => {
              const cat = (validCategories.has(item.category)
                ? item.category
                : 'WORD_CHOICE') as GrammarCategoryCode;
              const sev = (validSeverities.has(item.severity)
                ? item.severity
                : 'GRAMMAR_ERROR') as FeedbackSeverity;
              return {
                id: `gem-m-${Date.now()}-${idx}`,
                original: String(item.original).trim(),
                correction: String(item.correction).trim(),
                category: cat,
                categoryLabel: CATEGORY_LABELS[cat],
                severity: sev,
                explanation: String(item.explanation || '').trim(),
                explanationSi: item.explanationSi ? String(item.explanationSi).trim() : undefined,
                grammar_rule: String(item.grammar_rule || CATEGORY_LABELS[cat]).trim(),
                example: String(item.example || '').trim(),
                more_examples: Array.isArray(item.more_examples)
                  ? item.more_examples.map(String).filter(Boolean)
                  : undefined,
                learning_tip: String(item.learning_tip || '').trim(),
                confidence:
                  typeof item.confidence === 'number' && item.confidence >= 0 && item.confidence <= 1
                    ? item.confidence
                    : 0.92,
                learned: false,
                isProvisional: Boolean(item.is_provisional) || undefined
              };
            })
        : [];

    // Safety cross-check: if Gemini returned 0 mistakes on a sentence where our deterministic local analyzer
    // caught high-confidence (>= 0.94) GRAMMAR_ERRORs (e.g. "buyed", "with a friends", "I not ..."),
    // preserve those local errors so a lenient LLM response never shows a false "✓ Clean English" badge!
    if (
      resolvedQuality !== 'unclear' &&
      mistakes.length === 0 &&
      localFallback.mistakes.some(m => m.severity === 'GRAMMAR_ERROR' && m.confidence >= 0.94)
    ) {
      return localFallback;
    }

    const resolvedCorrected =
      resolvedQuality === 'unclear' || mistakes.length === 0
        ? clean
        : typeof parsed.corrected_sentence === 'string' && parsed.corrected_sentence.trim()
        ? parsed.corrected_sentence.trim()
        : clean;

    const hasActionable = mistakes.some(
      m => m.severity === 'GRAMMAR_ERROR' || m.severity === 'UNNATURAL'
    );
    const resolvedUtteranceCategory: BuddyUtteranceCategory =
      resolvedQuality === 'unclear'
        ? 'unclear_speech'
        : hasActionable
        ? 'grammar_mistake'
        : localFallback.contextualWord
        ? localFallback.contextualWord.kind
        : localFallback.utteranceCategory || 'clean';

    const vocabUpgrades =
      resolvedQuality === 'unclear'
        ? undefined
        : (() => {
            const detected = detectVocabUpgrades(clean, resolvedCorrected, intensity, mode);
            return detected.length > 0 ? detected : undefined;
          })();

    return {
      original_sentence: clean,
      corrected_sentence: resolvedCorrected,
      mistakes,
      vocabUpgrades,
      natural_expression:
        resolvedQuality === 'unclear'
          ? null
          : typeof parsed.natural_expression === 'string' && parsed.natural_expression.trim()
          ? parsed.natural_expression.trim()
          : vocabUpgrades?.[0]?.naturalSentence || null,
      learning_recommendation:
        resolvedQuality === 'unclear'
          ? null
          : typeof parsed.learning_recommendation === 'string' && parsed.learning_recommendation.trim()
          ? parsed.learning_recommendation.trim()
          : localFallback.learning_recommendation,
      transcriptQuality: resolvedQuality,
      utteranceCategory: resolvedUtteranceCategory,
      contextualWord: localFallback.contextualWord,
      clarificationNote:
        localFallback.contextualWord?.phoneticNote ||
        (typeof parsed.clarification_note === 'string' && parsed.clarification_note.trim()
          ? parsed.clarification_note.trim()
          : coherence.clarificationHint || coherence.reason),
      isProvisional:
        Boolean(parsed.is_provisional) ||
        resolvedQuality === 'partially_unclear' ||
        mistakes.some(m => m.isProvisional) ||
        undefined,
      fluency: resolvedQuality === 'unclear' ? undefined : localFallback.fluency,
      pronunciationSpotlights:
        resolvedQuality === 'unclear' ? undefined : localFallback.pronunciationSpotlights,
      analyzerSource: 'gemini',
      analyzedAt: Date.now()
    };
    } catch {
      continue;
    }
  }

  return localFallback;
}
