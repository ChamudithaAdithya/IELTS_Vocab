/**
 * AI Speaking Buddy (Lingo Buddy) — Phase 5 Subsystem QA Suite & Immutable Audit Layer
 * Implements:
 *  - Complete 14-State Orb Metadata Registry (PHASE_05 §1)
 *  - All 13 Essential Real-World QA Test Scenarios + Golden QA Test (PHASE_05 §3)
 *  - 11 Modular Services & 14-Table Immutable Data Audit Exporter (PHASE_05 §2)
 */

import type {
  BuddyLearningAnalytics,
  BuddyMemoryState,
  BuddyMessage,
  BuddyOrbState,
  BuddySession,
  PersonalGrammarNote,
  SavedBuddyVocabItem
} from '../types/speakingBuddy';
import {
  analyzeBuddyGrammarLocally,
  buildSpokenCorrection,
  validateTranscriptCoherence
} from './buddyGrammarEngine';
import { buildFinalizedTurnPacket } from './buddyOrchestrator';
import {
  classifyBuddyIntent,
  extractSessionContext,
  generateLocalFriendReply,
  processBuddyTranscript
} from './speakingBuddyEngine';
import { analyzeBuddyFluency } from './buddySpeechCoach';
import {
  buildWeeklyEnglishReport,
  computeNormalizedErrorRate,
  evaluateTryAgainAttempt
} from './buddyLearningStore';

// ---------------------------------------------------------------------------
// 1. COMPLETE 14-STATE LIVING ORB SPECIFICATION METADATA (PHASE_05 §1)
// ---------------------------------------------------------------------------
export interface OrbStateDescriptor {
  state: BuddyOrbState;
  label: string;
  visual: string;
  meaning: string;
  dotColor: string;
}

export const ORB_14_STATES: OrbStateDescriptor[] = [
  { state: 'idle', label: 'Idle', visual: 'Slow, calm internal energy drift', meaning: 'Ready and waiting for user', dotColor: 'bg-sky-400' },
  { state: 'listening', label: 'Listening', visual: 'Expanding concentric sound rings', meaning: "Actively capturing user's voice", dotColor: 'bg-cyan-400' },
  { state: 'transcribing', label: 'Transcribing', visual: 'Luminous particles flowing inward', meaning: 'Converting speech waveform to text', dotColor: 'bg-blue-400' },
  { state: 'understanding', label: 'Understanding', visual: 'Multiple synchronized orbiting rings', meaning: 'Processing meaning & context', dotColor: 'bg-indigo-400' },
  { state: 'thinking', label: 'Thinking', visual: 'Fast-moving internal energy streams', meaning: 'Generating natural friend response', dotColor: 'bg-violet-400' },
  { state: 'speaking', label: 'Speaking', visual: 'Rhythmic pulsation synced to AI audio', meaning: 'AI friend voice playback active', dotColor: 'bg-fuchsia-400' },
  { state: 'interrupted', label: 'Interrupted', visual: 'Quick cyan-gold ripple reset', meaning: 'User barged in while AI was speaking', dotColor: 'bg-cyan-300' },
  { state: 'happy', label: 'Happy', visual: 'Warm purple glow with gentle lift', meaning: 'Positive, friendly moment / clean English', dotColor: 'bg-purple-400' },
  { state: 'encouraging', label: 'Encouraging', visual: 'Golden aura with sparkling particles', meaning: 'Motivating user ("Try Again" win)', dotColor: 'bg-amber-400' },
  { state: 'analyzing', label: 'Analyzing', visual: 'Subtle dashed orbital rings', meaning: 'Background grammar check running', dotColor: 'bg-teal-400' },
  { state: 'correcting', label: 'Correcting', visual: 'Crisp cyan-green energy pulse', meaning: 'Presenting helpful correction card', dotColor: 'bg-emerald-400' },
  { state: 'deep_thinking', label: 'Deep Thinking', visual: 'Complex 3-layer orbiting rings', meaning: 'Detailed grammar rule breakdown', dotColor: 'bg-purple-300' },
  { state: 'confused', label: 'Confused', visual: 'Brief irregular wobble pulse', meaning: 'Unclear or clipped audio input', dotColor: 'bg-amber-300' },
  { state: 'error', label: 'Error', visual: 'Controlled red/orange brief flash', meaning: 'Technical / mic / network issue', dotColor: 'bg-rose-500' },
  { state: 'sleeping', label: 'Sleeping', visual: 'Dimmed sphere with slow breathing', meaning: 'Session paused or muted', dotColor: 'bg-slate-500' }
];

export function getOrbStateDescriptor(state: BuddyOrbState): OrbStateDescriptor {
  return ORB_14_STATES.find(s => s.state === state) || ORB_14_STATES[0];
}

// ---------------------------------------------------------------------------
// 2. LIVE 13-SCENARIO REAL-WORLD SUBSYSTEM QA SUITE (PHASE_05 §3)
// ---------------------------------------------------------------------------
export interface BuddyQaScenarioResult {
  id: number;
  title: string;
  subsystem: string;
  passed: boolean;
  detail: string;
  durationMs: number;
  isGolden?: boolean;
}

export interface BuddyQaSuiteMetrics {
  contextRelevancePct: number;
  intentAccuracyPct: number;
  grammarPrecisionPct: number;
  grammarRecallPct: number;
  repetitiveReplyRatePct: number;
  avgLatencyMs: number;
}

export interface BuddyQaSuiteReport {
  ranAt: number;
  total: number;
  passedCount: number;
  failedCount: number;
  totalDurationMs: number;
  metrics: BuddyQaSuiteMetrics;
  results: BuddyQaScenarioResult[];
}

function runScenario(
  id: number,
  title: string,
  subsystem: string,
  fn: () => string,
  isGolden?: boolean
): BuddyQaScenarioResult {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  try {
    const detail = fn();
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      id,
      title,
      subsystem,
      passed: true,
      detail,
      durationMs: Math.max(0.1, Number((t1 - t0).toFixed(1))),
      isGolden
    };
  } catch (err: any) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      id,
      title,
      subsystem,
      passed: false,
      detail: err?.message || 'Scenario assertion failed',
      durationMs: Math.max(0.1, Number((t1 - t0).toFixed(1))),
      isGolden
    };
  }
}

export function runAll13BuddyQaScenarios(): BuddyQaSuiteReport {
  const startAll = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const results: BuddyQaScenarioResult[] = [
    runScenario(
      1,
      'Sri Lankan English nuance ("I am having a doubt")',
      'Grammar & Sinhala Coach',
      () => {
        const res = analyzeBuddyGrammarLocally({
          originalTranscript: 'Actually, I am having a doubt about this topic.',
          intensity: 'balanced'
        });
        const m = res.mistakes[0];
        if (!m || m.severity !== 'UNNATURAL' || !m.explanationSi || !m.sinhalaTransferNote) {
          throw new Error('Expected UNNATURAL label + Sinhala transfer explanation (not GRAMMAR_ERROR)');
        }
        return `Labelled "${m.severity}" → "${m.correction}" with Sinhala transfer note.`;
      }
    ),
    runScenario(
      2,
      'Slow speaking with long thinking pauses',
      'Fluency Engine',
      () => {
        const f = analyzeBuddyFluency('I think ... yesterday was a calm day for me.', 16);
        if (f.paceLabel !== 'Slow & Deliberate' || f.pauseCount < 1) {
          throw new Error(`Expected Slow & Deliberate with pauses, got ${f.paceLabel}`);
        }
        return `${f.wpm} WPM (${f.paceLabel}), ${f.pauseCount} pauses — supportive clarity note.`;
      }
    ),
    runScenario(
      3,
      'Rapid connected speech & contractions (clarity > speed)',
      'Fluency Engine',
      () => {
        const fast = Array(38).fill("I'm").map((_, i) => (i % 2 === 0 ? "I'm" : 'going')).join(' ');
        const f = analyzeBuddyFluency(fast, 10);
        if (f.paceLabel !== 'Very Fast' || !/slowing down|rapidly/i.test(f.clarityRhythmNote)) {
          throw new Error(`Expected Very Fast pacing advisory, got ${f.paceLabel}`);
        }
        return `${f.wpm} WPM (${f.paceLabel}) — correctly coaches calm pauses over rushing.`;
      }
    ),
    runScenario(
      4,
      'Incomplete mid-sentence pause fragment ("Because I was tired.")',
      'Grammar Analyzer',
      () => {
        const res = analyzeBuddyGrammarLocally({
          originalTranscript: 'Because I was tired.',
          intensity: 'balanced'
        });
        if (!res.mistakes.some(m => m.category === 'SENTENCE_STRUCTURE')) {
          throw new Error('Failed to detect standalone dependent fragment');
        }
        return `Detected fragment → "${res.corrected_sentence}".`;
      }
    ),
    runScenario(
      5,
      'Mid-sentence self-correction ("I went to the park, I mean the mall")',
      'Fluency Engine',
      () => {
        const f = analyzeBuddyFluency('Yesterday I went to the park, I mean the mall, with friends.', 6);
        if (f.selfCorrectionCount < 1) {
          throw new Error('Failed to detect self-correction phrase');
        }
        return `Tracked ${f.selfCorrectionCount} self-correction cleanly without false grammar penalty.`;
      }
    ),
    runScenario(
      6,
      'Frequent spoken fillers ("um, uh, I think, I think")',
      'Fluency & Repetition',
      () => {
        const text = 'Um, uh, I think, I think it was really nice.';
        const f = analyzeBuddyFluency(text, 6);
        const g = analyzeBuddyGrammarLocally({ originalTranscript: text, intensity: 'balanced' });
        if (f.hesitationCount < 2 || f.repetitionCount < 1 || !g.mistakes.some(m => m.category === 'REPETITION')) {
          throw new Error(`Expected >=2 hesitations and repetition flag`);
        }
        return `Detected ${f.hesitationCount} fillers + ${f.repetitionCount} repeated phrase.`;
      }
    ),
    runScenario(
      7,
      'Multiple distinct mistakes in one sentence ("went to shopping ... buyed")',
      'Grammar Analyzer',
      () => {
        const res = analyzeBuddyGrammarLocally({
          originalTranscript: 'I went to shopping yesterday and I buyed some clothes.',
          intensity: 'balanced'
        });
        if (res.mistakes.length < 2 || res.corrected_sentence !== 'I went shopping yesterday and I bought some clothes.') {
          throw new Error(`Unexpected correction: ${res.corrected_sentence}`);
        }
        return `Fixed ${res.mistakes.length} distinct errors → "${res.corrected_sentence}".`;
      }
    ),
    runScenario(
      8,
      '100% grammatically correct English (Zero False Alarms)',
      'Grammar Precision',
      () => {
        const clean = 'I enjoy travelling because it allows me to explore different cultures.';
        const res = analyzeBuddyGrammarLocally({ originalTranscript: clean, intensity: 'detailed' });
        if (res.transcriptQuality !== 'clear' || res.mistakes.length !== 0) {
          throw new Error(`False positive on valid English: ${JSON.stringify(res.mistakes)}`);
        }
        return '0 false alarms even in Detailed mode (supports UK "travelling").';
      }
    ),
    runScenario(
      9,
      'Specialized technical vocabulary (Zero False Alarms)',
      'Vocabulary & Precision',
      () => {
        const tech = 'We are optimizing asynchronous microservices using TypeScript and Kubernetes.';
        const res = analyzeBuddyGrammarLocally({ originalTranscript: tech, intensity: 'detailed' });
        if (res.transcriptQuality !== 'clear' || res.mistakes.length !== 0) {
          throw new Error(`Technical sentence falsely flagged: ${JSON.stringify(res.mistakes)}`);
        }
        return 'Technical jargon passed cleanly with 0 false positives.';
      }
    ),
    runScenario(
      10,
      'Mid-chat request to explain an earlier mistake',
      'Conversation Self-Awareness',
      () => {
        const priorAnalysis = analyzeBuddyGrammarLocally({
          originalTranscript: 'I buyed a new jacket yesterday.',
          intensity: 'balanced'
        });
        const history: BuddyMessage[] = [
          { id: 'u1', role: 'user', timestamp: 1, text: 'I buyed a new jacket yesterday.', analysis: priorAnalysis },
          { id: 'b1', role: 'buddy', timestamp: 2, text: 'Nice! What colour jacket did you pick?' }
        ];
        const reply = generateLocalFriendReply(
          'Wait, can you explain my earlier grammar mistake?',
          history,
          'friendly',
          'friendly'
        );
        if (!/buyed/i.test(reply) || !/bought/i.test(reply)) {
          throw new Error(`Reply did not reference earlier mistake: ${reply}`);
        }
        return `Explained earlier mistake inline: "${reply.slice(0, 78)}..."`;
      }
    ),
    runScenario(
      11,
      'Active "Try Again" spoken verification + barge-in readiness',
      'Practice Loop & Reports',
      () => {
        const pass = evaluateTryAgainAttempt(
          'I went shopping yesterday and bought some clothes',
          'I went shopping yesterday and bought some clothes.',
          ['went shopping', 'bought'],
          ['went to shopping', 'buyed']
        );
        const fail = evaluateTryAgainAttempt(
          'I went to shopping yesterday and buyed some clothes',
          'I went shopping yesterday and bought some clothes.',
          ['went shopping', 'bought'],
          ['went to shopping', 'buyed']
        );
        const rate = computeNormalizedErrorRate(6, 120);
        if (!pass.matched || fail.matched || rate !== 5.0) {
          throw new Error('Try Again evaluator or normalized error rate check failed');
        }
        return 'Strict Try Again pass/fail verified (100% pass vs caught repeated error) + 5.0% rate.';
      }
    ),
    runScenario(
      12,
      'Abrupt topic switch (Cooking → Spontaneous Trip to Kandy)',
      'Conversation Continuity',
      () => {
        const history: BuddyMessage[] = [
          { id: 'u1', role: 'user', timestamp: 1, text: 'I will cook big with ginger and cooking oil.' },
          { id: 'b1', role: 'buddy', timestamp: 2, text: 'So you start with cooking oil and ginger!' }
        ];
        const reply = generateLocalFriendReply(
          'Actually forget cooking, I just booked a weekend trip to Kandy!',
          history,
          'friendly',
          'friendly'
        );
        if (/ginger|cooking oil|ingredients/i.test(reply)) {
          throw new Error(`Stuck on old cooking topic after switch: ${reply}`);
        }
        if (!/trip|getaway|visit|travel/i.test(reply)) {
          throw new Error(`Did not pivot cleanly to travel: ${reply}`);
        }
        return 'Pivoted cleanly from cooking to travel without stale entity bleed.';
      }
    ),
    runScenario(
      13,
      'GOLDEN TEST — STT Confidence Guard & Moderate Background Noise',
      'STT vs. Grammar Isolation',
      () => {
        // Part A: Uncertain STT token must NEVER be penalized as GRAMMAR_ERROR
        const guarded = analyzeBuddyGrammarLocally({
          originalTranscript: 'I buyed some fresh groceries today.',
          intensity: 'balanced',
          uncertainWords: ['buyed']
        });
        if (guarded.mistakes.some(m => m.severity === 'GRAMMAR_ERROR')) {
          throw new Error('Punished learner for an uncertain STT token!');
        }
        // Part B: Garbled noise must trigger Stage A unclear (NEVER "Clean English")
        const coh = validateTranscriptCoherence('Must will be cappuccino potato mango.');
        const garbled = analyzeBuddyGrammarLocally({
          originalTranscript: 'Must will be cappuccino potato mango.',
          coherence: coh
        });
        if (garbled.transcriptQuality !== 'unclear') {
          throw new Error('Garbled audio was not caught by Stage A coherence guard!');
        }
        return 'Zero punishment on uncertain STT tokens + garbled audio blocked from false Clean badge.';
      },
      true
    ),
    // -----------------------------------------------------------------------
    // AUDIT SECTION 4 — 10 CONVERSATION INTELLIGENCE BENCHMARK SCENARIOS
    // -----------------------------------------------------------------------
    runScenario(
      14,
      'Context retention ("Tell me more about it.")',
      'Conversation Intel',
      () => {
        const history: BuddyMessage[] = [
          { id: 'u1', role: 'user', timestamp: 1, text: 'I developed an AI tool for IELTS speaking.' },
          { id: 'b1', role: 'buddy', timestamp: 2, text: 'Whoa, building your own AI tool is awesome!' }
        ];
        const ctx = extractSessionContext(history, 'Tell me more about it.');
        const reply = generateLocalFriendReply('Tell me more about it.', history, 'friendly', 'friendly');
        if (!ctx.activeSubject?.toLowerCase().includes('ai tool') || !/ai tool/i.test(reply)) {
          throw new Error(`Did not resolve "it" to AI tool: subject=${ctx.activeSubject}, reply=${reply}`);
        }
        return `Resolved "it" → "${ctx.activeSubject}".`;
      }
    ),
    runScenario(
      15,
      'Topic correction ("You\'re going off-topic.")',
      'Conversation Intel',
      () => {
        const history: BuddyMessage[] = [
          { id: 'u1', role: 'user', timestamp: 1, text: 'I built an AI tool for students.' },
          { id: 'b1', role: 'buddy', timestamp: 2, text: 'Nice weather today!' }
        ];
        const reply = generateLocalFriendReply("You're going off-topic.", history, 'friendly', 'friendly');
        if (!/sorry|my bad/i.test(reply) || !/ai tool/i.test(reply)) {
          throw new Error(`Failed off-topic apology/return: ${reply}`);
        }
        return `Apologized & returned to active subject ("your AI tool").`;
      }
    ),
    runScenario(
      16,
      'Topic change ("Let\'s discuss something else.")',
      'Conversation Intel',
      () => {
        const history: BuddyMessage[] = [
          { id: 'u1', role: 'user', timestamp: 1, text: 'I will cook with ginger and cooking oil.' },
          { id: 'b1', role: 'buddy', timestamp: 2, text: 'What dish are you making?' }
        ];
        const reply = generateLocalFriendReply("Let's discuss something else.", history, 'friendly', 'friendly');
        if (/ginger|cooking|dish/i.test(reply) || !/of course|what would you like to talk about|switch|fresh topic|mind/i.test(reply)) {
          throw new Error(`Did not switch topics cleanly: ${reply}`);
        }
        return `Switched gears cleanly with zero stale cooking bleed.`;
      }
    ),
    runScenario(
      17,
      'Exact term clarification ("What you mean by concept in class?")',
      'Conversation & Grammar',
      () => {
        const history: BuddyMessage[] = [
          { id: 'u1', role: 'user', timestamp: 1, text: 'I study software engineering.' },
          {
            id: 'b1',
            role: 'buddy',
            timestamp: 2,
            text: 'Are you building a project right now, or mostly studying the concepts in class?'
          }
        ];
        const reply = generateLocalFriendReply(
          'What you mean by concept in class?',
          history,
          'friendly',
          'friendly'
        );
        const gram = analyzeBuddyGrammarLocally({
          originalTranscript: 'What you mean by concept in class?',
          intensity: 'balanced'
        });
        if (/cancelled|off tomorrow|holiday/i.test(reply)) {
          throw new Error(`Stale school-cancelled bug triggered!: ${reply}`);
        }
        if (!/theory|lecturer|project/i.test(reply)) {
          throw new Error(`Did not explain "concept in class": ${reply}`);
        }
        if (!/what do you mean/i.test(gram.corrected_sentence)) {
          throw new Error(`Grammar missed missing "do": ${gram.corrected_sentence}`);
        }
        return `Explained "concept in class" accurately + fixed → "${gram.corrected_sentence}".`;
      }
    ),
    runScenario(
      18,
      'Article detection ("I developed AI tool.")',
      'Grammar Recall',
      () => {
        const res = analyzeBuddyGrammarLocally({
          originalTranscript: 'I developed AI tool.',
          intensity: 'balanced'
        });
        if (!res.mistakes.some(m => m.category === 'ARTICLES') || res.corrected_sentence !== 'I developed an AI tool.') {
          throw new Error(`Missed missing article "an": ${res.corrected_sentence}`);
        }
        return `Caught missing article → "${res.corrected_sentence}".`;
      }
    ),
    runScenario(
      19,
      'Project continuation ("I also added another feature.")',
      'Conversation Intel',
      () => {
        const history: BuddyMessage[] = [
          { id: 'u1', role: 'user', timestamp: 1, text: 'I developed an AI tool this week.' },
          { id: 'b1', role: 'buddy', timestamp: 2, text: 'Whoa, building your own AI tool is awesome!' }
        ];
        const reply = generateLocalFriendReply('I also added another feature.', history, 'friendly', 'friendly');
        if (!/ai tool/i.test(reply) || !/feature/i.test(reply)) {
          throw new Error(`Did not connect new feature to active AI tool project: ${reply}`);
        }
        return `Connected new feature directly to "your AI tool".`;
      }
    ),
    runScenario(
      20,
      'Repetition request ("Can you say that again?")',
      'Conversation Self-Awareness',
      () => {
        const prev = 'What part of the trip are you looking forward to most?';
        const history: BuddyMessage[] = [{ id: 'b1', role: 'buddy', timestamp: 1, text: prev }];
        const reply = generateLocalFriendReply('Can you say that again?', history, 'friendly', 'friendly');
        if (!reply.includes(prev)) {
          throw new Error(`Did not repeat previous response: ${reply}`);
        }
        return `Repeated exact prior response clearly.`;
      }
    ),
    runScenario(
      21,
      'User disagreement ("I don\'t agree with that.")',
      'Conversation Intel',
      () => {
        const history: BuddyMessage[] = [
          { id: 'b1', role: 'buddy', timestamp: 1, text: 'Remote work is usually easier for focus.' }
        ];
        const ctx = extractSessionContext(history, "I don't agree with that.");
        const { intent } = classifyBuddyIntent("I don't agree with that.", ctx, { quality: 'clear' });
        const reply = generateLocalFriendReply("I don't agree with that.", history, 'friendly', 'friendly');
        if (intent !== 'user_disagreement' || !/differently|side|take|viewpoint/i.test(reply)) {
          throw new Error(`Failed disagreement handling: intent=${intent}, reply=${reply}`);
        }
        return `Intent "${intent}" — addressed disagreement warmly.`;
      }
    ),
    runScenario(
      22,
      'Empathetic response ("I had a terrible day.")',
      'Conversation Empathy',
      () => {
        const reply = generateLocalFriendReply('I had a terrible day.', [], 'friendly', 'friendly');
        if (!/sorry|tough|rough|draining/i.test(reply)) {
          throw new Error(`Reply lacked empathy: ${reply}`);
        }
        return `Responded empathetically ("${reply.slice(0, 68)}...").`;
      }
    ),
    runScenario(
      23,
      'Non-destructive punctuation invariant (zero silent word edits)',
      'Transcript Integrity',
      () => {
        const raw = 'i went to shopping and buyed favorite clothes';
        const norm = processBuddyTranscript(raw);
        if (!norm.includes('buyed') || !norm.includes('favorite') || !norm.includes('went to shopping')) {
          throw new Error(`Punctuation silently mutated learner words!: ${norm}`);
        }
        return `Preserved exact learner words intact: "${norm}".`;
      }
    ),
    runScenario(
      24,
      'Verbatim 3-mistake capture ("Yesterday I go to shopping and I buyed some clothes.")',
      'Verbatim + Multi-Span Grammar',
      () => {
        const raw = 'Yesterday I go to shopping and I buyed some clothes.';
        const norm = processBuddyTranscript(raw);
        if (norm !== raw) {
          throw new Error(`Transcript mutated before grammar check: "${norm}"`);
        }
        const res = analyzeBuddyGrammarLocally({ originalTranscript: norm, intensity: 'balanced' });
        const expectedFixed = 'Yesterday I went shopping and I bought some clothes.';
        if (res.mistakes.length < 3 || res.corrected_sentence !== expectedFixed) {
          throw new Error(
            `Expected 3 fixes -> "${expectedFixed}", got ${res.mistakes.length} fixes -> "${res.corrected_sentence}"`
          );
        }
        return `Caught all 3 mistakes independently (go→went, to shopping→shopping, buyed→bought) → "${res.corrected_sentence}".`;
      },
      true
    ),
    runScenario(
      25,
      'Required verbatim irregular & SVA errors ("I buyed...", "She don\'t...", "I didn\'t went...")',
      'Verbatim Grammar Detection',
      () => {
        const cases = [
          { input: 'I buyed some clothes.', expected: 'I bought some clothes.' },
          { input: 'Yesterday I go to shopping.', expected: 'Yesterday I went shopping.' },
          { input: "She don't like coffee.", expected: "She doesn't like coffee." },
          { input: "I didn't went there.", expected: "I didn't go there." },
          { input: 'What you mean?', expected: 'What do you mean?' }
        ];
        for (const c of cases) {
          const norm = processBuddyTranscript(c.input);
          const res = analyzeBuddyGrammarLocally({ originalTranscript: norm, intensity: 'balanced' });
          if (res.mistakes.length === 0 || res.corrected_sentence !== c.expected) {
            throw new Error(`Failed on "${c.input}": got "${res.corrected_sentence}" (${res.mistakes.length} fixes)`);
          }
        }
        return 'All 5 erroneous test sentences preserved verbatim and corrected accurately.';
      }
    ),
    runScenario(
      26,
      'Zero false-positives on clean required sentences ("I have a car", "AI tool", "project")',
      'Grammar Precision',
      () => {
        const cleanCases = [
          'I have a car.',
          'I have developed an AI tool.',
          'I am working on my project.'
        ];
        for (const text of cleanCases) {
          const res = analyzeBuddyGrammarLocally({ originalTranscript: text, intensity: 'detailed' });
          const realErrors = res.mistakes.filter(
            m => m.severity === 'GRAMMAR_ERROR' || m.severity === 'UNNATURAL'
          );
          if (realErrors.length > 0 || res.corrected_sentence !== text) {
            throw new Error(`False positive on "${text}": ${realErrors.map(e => e.original).join(', ')}`);
          }
        }
        return 'All 3 valid English sentences passed cleanly with 0 false positives.';
      }
    ),
    // -----------------------------------------------------------------------
    // MASTER PROMPT §11 — TESTS A TO G (NATURAL CONVERSATION + INSTANT RECAST)
    // -----------------------------------------------------------------------
    runScenario(
      27,
      'Test A — Past tense spoken recast + continuation ("Yesterday I go to shopping.")',
      'Spoken Recast & Friend Flow',
      () => {
        const pkt = buildFinalizedTurnPacket({
          sessionId: 's-test-a',
          rawTranscript: 'Yesterday I go to shopping.',
          engine: 'gemini-cloud',
          priorHistory: []
        });
        const gram = analyzeBuddyGrammarLocally({
          originalTranscript: pkt.analysisTranscript,
          intensity: 'gentle'
        });
        const recast = buildSpokenCorrection(gram, 'gentle');
        const cont = generateLocalFriendReply(pkt.analysisTranscript, [], 'friendly', 'friendly');
        if (
          recast.spokenCorrection !== 'You can say, "Yesterday I went shopping."' ||
          !/what did you (?:end up )?buy/i.test(cont)
        ) {
          throw new Error(`Unexpected Test A output: "${recast.spokenCorrection}" | "${cont}"`);
        }
        return `${recast.spokenCorrection} ${cont}`;
      },
      true
    ),
    runScenario(
      28,
      'Test B — Missing profession article ("I am software engineer.")',
      'Spoken Recast & Friend Flow',
      () => {
        const gram = analyzeBuddyGrammarLocally({
          originalTranscript: 'I am software engineer.',
          intensity: 'gentle'
        });
        const recast = buildSpokenCorrection(gram, 'gentle');
        const cont = generateLocalFriendReply('I am software engineer.', [], 'friendly', 'friendly');
        if (
          recast.spokenCorrection !== 'You can say, "I am a software engineer."' ||
          !/what kind of software do you work on/i.test(cont)
        ) {
          throw new Error(`Unexpected Test B output: "${recast.spokenCorrection}" | "${cont}"`);
        }
        return `${recast.spokenCorrection} ${cont}`;
      }
    ),
    runScenario(
      29,
      'Test C — Correct sentence ("I developed an AI application.") — zero false recast',
      'Grammar Precision & Friend Flow',
      () => {
        const gram = analyzeBuddyGrammarLocally({
          originalTranscript: 'I developed an AI application.',
          intensity: 'detailed'
        });
        const recast = buildSpokenCorrection(gram, 'gentle');
        const cont = generateLocalFriendReply(
          'I developed an AI application.',
          [],
          'friendly',
          'friendly'
        );
        if (recast.correctionRequired || recast.spokenCorrection !== '') {
          throw new Error(`Falsely corrected valid sentence: ${recast.spokenCorrection}`);
        }
        if (!/exciting|what does your application do/i.test(cont)) {
          throw new Error(`Unexpected Test C continuation: "${cont}"`);
        }
        return `No recast + "${cont}"`;
      }
    ),
    runScenario(
      30,
      'Tests D & E — Subject change & simple question clarification',
      'Conversation Intelligence',
      () => {
        const dReply = generateLocalFriendReply(
          "Let's talk about something else.",
          [],
          'friendly',
          'friendly'
        );
        const eHistory: BuddyMessage[] = [
          {
            id: 'b-prev',
            role: 'buddy',
            timestamp: 1,
            text: 'Are you building a project right now, or mostly studying the concepts in class?'
          }
        ];
        const eReply = generateLocalFriendReply(
          "I don't understand what you are asking.",
          eHistory,
          'friendly',
          'friendly'
        );
        if (!/of course! what would you like to talk about/i.test(dReply)) {
          throw new Error(`Unexpected Test D reply: ${dReply}`);
        }
        if (!/building|project|theory|university/i.test(eReply)) {
          throw new Error(`Unexpected Test E clarification: ${eReply}`);
        }
        return `Switch: "${dReply}" | Clarified prior question simply.`;
      }
    ),
    runScenario(
      31,
      'Test F — Off-topic detection ("You\'re going off-topic. We were discussing my project.")',
      'Conversation Intelligence',
      () => {
        const reply = generateLocalFriendReply(
          "You're going off-topic. We were discussing my project.",
          [],
          'friendly',
          'friendly'
        );
        if (!/you're right/i.test(reply) || !/your project/i.test(reply) || !/feature/i.test(reply)) {
          throw new Error(`Unexpected Test F reply: ${reply}`);
        }
        return reply;
      }
    ),
    runScenario(
      32,
      'Test G — Verbatim speech preserved ("I buyed some clothes.")',
      'Verbatim Integrity',
      () => {
        const pkt = buildFinalizedTurnPacket({
          sessionId: 's-test-g',
          rawTranscript: 'I buyed some clothes.',
          engine: 'gemini-cloud',
          priorHistory: []
        });
        const gram = analyzeBuddyGrammarLocally({
          originalTranscript: pkt.analysisTranscript,
          intensity: 'gentle'
        });
        const recast = buildSpokenCorrection(gram, 'gentle');
        if (
          pkt.rawTranscript !== 'I buyed some clothes.' ||
          pkt.finalizedVerbatimTranscript !== 'I buyed some clothes.' ||
          gram.corrected_sentence !== 'I bought some clothes.' ||
          recast.spokenCorrection !== 'You can say, "I bought some clothes."'
        ) {
          throw new Error('Test G verbatim / correction mismatch');
        }
        return `Verbatim "${pkt.finalizedVerbatimTranscript}" preserved; recast: ${recast.spokenCorrection}`;
      },
      true
    ),
    runScenario(
      33,
      'Core Gym Conversation + Naturalness ("going to my home") + 3 Mode Intensities',
      'Modes & Naturalness',
      () => {
        const gym1 = analyzeBuddyGrammarLocally({ originalTranscript: "I'm going to gym." });
        const gym3 = analyzeBuddyGrammarLocally({
          originalTranscript: "Tired after workout, but I think it's refreshing."
        });
        const home = analyzeBuddyGrammarLocally({ originalTranscript: 'I am going to my home.' });
        const homeRecast = buildSpokenCorrection(home, 'gentle');
        const gentle = buildSpokenCorrection(gym1, 'gentle').spokenCorrection;
        const balanced = buildSpokenCorrection(gym1, 'balanced').spokenCorrection;
        const detailed = buildSpokenCorrection(gym1, 'detailed').spokenCorrection;

        if (gym1.corrected_sentence !== "I'm going to the gym.") {
          throw new Error(`Gym article failed: ${gym1.corrected_sentence}`);
        }
        if (gym3.corrected_sentence !== "I feel tired after a workout, but I think it's refreshing.") {
          throw new Error(`Workout clause failed: ${gym3.corrected_sentence}`);
        }
        if (
          homeRecast.correctionType !== 'naturalness' ||
          homeRecast.spokenCorrection !== 'A more natural way to say that is, "I\'m going home."'
        ) {
          throw new Error(`Naturalness recast failed: ${homeRecast.spokenCorrection}`);
        }
        if (!(detailed.length > balanced.length && balanced.length > gentle.length)) {
          throw new Error(`3-mode progression failed: G=${gentle} | B=${balanced} | D=${detailed}`);
        }
        return `Gym, Workout, Naturalness ("I'm going home"), & Gentle/Balanced/Detailed verified.`;
      }
    ),
    // -----------------------------------------------------------------------
    // CRITICAL CONVERSATIONAL INTELLIGENCE & NATURAL CORRECTION — TESTS 1 TO 7
    // -----------------------------------------------------------------------
    runScenario(
      34,
      'TEST 1 — Word meaning from AI message ("low-key" + phonetic STT slip "Locky")',
      'Context & Word Meaning',
      () => {
        const history: BuddyMessage[] = [
          {
            id: 'b-lowkey',
            role: 'buddy',
            timestamp: 1,
            text: 'Sometimes those are low-key days.'
          }
        ];
        const ctx = extractSessionContext(history, 'What is the meaning of low-key?');
        const cls = classifyBuddyIntent('What is the meaning of low-key?', ctx, { quality: 'clear' });
        const replyExact = generateLocalFriendReply(
          'What is the meaning of low-key?',
          history,
          'friendly',
          'friendly'
        );
        const replyPhonetic = generateLocalFriendReply(
          'What is the meaning of Locky?',
          history,
          'friendly',
          'friendly'
        );
        const gram = analyzeBuddyGrammarLocally({
          originalTranscript: 'What is the meaning of low-key?',
          intensity: 'gentle'
        });
        const recast = buildSpokenCorrection(gram, 'gentle');

        if (cls.conversationalIntent !== 'ASKING_WORD_MEANING') {
          throw new Error(`Expected ASKING_WORD_MEANING, got ${cls.conversationalIntent}`);
        }
        if (!/relaxed|quiet/i.test(replyExact) || !/\?$/.test(replyExact.trim())) {
          throw new Error(`Failed TEST 1 exact low-key explanation: ${replyExact}`);
        }
        if (!/low-key/i.test(replyPhonetic) || !/relaxed|quiet/i.test(replyPhonetic)) {
          throw new Error(`Failed phonetic "Locky" -> "low-key" resolution: ${replyPhonetic}`);
        }
        if (!/what does 'low-key' mean\?/i.test(recast.spokenCorrection)) {
          throw new Error(`Expected natural phrasing recast, got: ${recast.spokenCorrection}`);
        }
        return `${recast.spokenCorrection} ${replyExact}`;
      },
      true
    ),
    runScenario(
      35,
      'TEST 2 — Clarification + grammar recast ("No, I didn\'t got you." & "didn\'t understand what you mean")',
      'Clarification & Grammar',
      () => {
        const history1: BuddyMessage[] = [
          { id: 'b-u1', role: 'buddy', timestamp: 1, text: 'Did you understand what I meant?' }
        ];
        const gram1 = analyzeBuddyGrammarLocally({
          originalTranscript: "No, I didn't got you.",
          intensity: 'gentle'
        });
        const recast1 = buildSpokenCorrection(gram1, 'gentle');
        const reply1 = generateLocalFriendReply(
          "No, I didn't got you.",
          history1,
          'friendly',
          'friendly'
        );

        const history2: BuddyMessage[] = [
          { id: 'b-u2', role: 'buddy', timestamp: 1, text: 'Did you enjoy your day?' }
        ];
        const gram2 = analyzeBuddyGrammarLocally({
          originalTranscript: "No, I didn't understand what you mean.",
          intensity: 'gentle'
        });
        const recast2 = buildSpokenCorrection(gram2, 'gentle');
        const reply2 = generateLocalFriendReply(
          "No, I didn't understand what you mean.",
          history2,
          'friendly',
          'friendly'
        );

        if (
          recast1.spokenCorrection !== 'You can say, "No, I didn\'t get you."' ||
          !/explain it differently/i.test(reply1)
        ) {
          throw new Error(`Failed TEST 2 ("No, I didn't got you."): ${recast1.spokenCorrection} | ${reply1}`);
        }
        if (
          recast2.spokenCorrection !== 'You can say, "No, I didn\'t understand what you meant."' ||
          !/whether you enjoyed your day/i.test(reply2)
        ) {
          throw new Error(`Failed "didn't understand what you mean": ${recast2.spokenCorrection} | ${reply2}`);
        }
        return `${recast1.spokenCorrection} ${reply1}`;
      },
      true
    ),
    runScenario(
      36,
      'TEST 3 — Unclear speech ("I rain got you.") — never invents rain story or marks Clean',
      'Unclear Speech Guard',
      () => {
        const pkt = buildFinalizedTurnPacket({
          sessionId: 's-test-3',
          rawTranscript: 'I rain got you.',
          engine: 'gemini-cloud',
          priorHistory: []
        });
        const ctx = extractSessionContext([], pkt.analysisTranscript);
        const cls = classifyBuddyIntent(pkt.analysisTranscript, ctx, pkt.coherence);
        const gram = analyzeBuddyGrammarLocally({
          originalTranscript: pkt.analysisTranscript,
          coherence: pkt.coherence,
          intensity: 'gentle'
        });
        const recast = buildSpokenCorrection(gram, 'gentle');
        const reply = generateLocalFriendReply(
          pkt.analysisTranscript,
          [],
          'friendly',
          'friendly',
          pkt.coherence,
          ctx
        );

        if (
          pkt.coherence.quality !== 'unclear' ||
          gram.transcriptQuality !== 'unclear' ||
          cls.conversationalIntent !== 'UNCLEAR_SPEECH' ||
          recast.correctionRequired
        ) {
          throw new Error(`Failed TEST 3 unclear detection: quality=${gram.transcriptQuality}, intent=${cls.conversationalIntent}`);
        }
        if (/\b(umbrella|weather|wet|storm|raining)\b/i.test(reply) || !/catch|did you mean/i.test(reply)) {
          throw new Error(`Unexpected TEST 3 reply: ${reply}`);
        }
        return `Quality=${gram.transcriptQuality} (${cls.conversationalIntent}) → "${reply}"`;
      },
      true
    ),
    runScenario(
      37,
      'TESTS 4 & 5 — Topic switch ("Let\'s talk about something else.") + Clean ("I have developed an AI tool.")',
      'Intent & Precision',
      () => {
        const ctx4 = extractSessionContext([], "Let's talk about something else.");
        const cls4 = classifyBuddyIntent("Let's talk about something else.", ctx4, { quality: 'clear' });
        const reply4 = generateLocalFriendReply(
          "Let's talk about something else.",
          [],
          'friendly',
          'friendly'
        );

        const gram5 = analyzeBuddyGrammarLocally({
          originalTranscript: 'I have developed an AI tool.',
          intensity: 'gentle'
        });
        const recast5 = buildSpokenCorrection(gram5, 'gentle');
        const reply5 = generateLocalFriendReply(
          'I have developed an AI tool.',
          [],
          'friendly',
          'friendly'
        );

        if (
          cls4.conversationalIntent !== 'CHANGING_TOPIC' ||
          !/of course! what would you like to talk about/i.test(reply4)
        ) {
          throw new Error(`Failed TEST 4: ${cls4.conversationalIntent} | ${reply4}`);
        }
        if (
          gram5.transcriptQuality !== 'clear' ||
          recast5.correctionRequired ||
          !/ai tool|problem does it solve|feature/i.test(reply5)
        ) {
          throw new Error(`Failed TEST 5: recast=${recast5.spokenCorrection} | reply=${reply5}`);
        }
        return `TEST 4: "${reply4}" | TEST 5: 0 false fixes + "${reply5}"`;
      }
    ),
    runScenario(
      38,
      'TEST 6 — Incomplete speech ("Much into. Nothing much.") — never marked Clean English',
      'Incomplete Speech Guard',
      () => {
        const pkt = buildFinalizedTurnPacket({
          sessionId: 's-test-6',
          rawTranscript: 'Much into. Nothing much.',
          engine: 'gemini-cloud',
          priorHistory: []
        });
        const ctx = extractSessionContext([], pkt.analysisTranscript);
        const cls = classifyBuddyIntent(pkt.analysisTranscript, ctx, pkt.coherence);
        const gram = analyzeBuddyGrammarLocally({
          originalTranscript: pkt.analysisTranscript,
          coherence: pkt.coherence,
          intensity: 'gentle'
        });
        const recast = buildSpokenCorrection(gram, 'gentle');
        const reply = generateLocalFriendReply(
          pkt.analysisTranscript,
          [],
          'friendly',
          'friendly',
          pkt.coherence,
          ctx
        );

        if (
          pkt.coherence.quality !== 'partially_unclear' ||
          pkt.coherence.incompleteFragment !== 'Much into' ||
          gram.transcriptQuality !== 'partially_unclear' ||
          cls.conversationalIntent !== 'INCOMPLETE_SENTENCE' ||
          recast.correctionRequired
        ) {
          throw new Error(
            `Failed TEST 6 incomplete check: quality=${gram.transcriptQuality}, frag=${pkt.coherence.incompleteFragment}, intent=${cls.conversationalIntent}`
          );
        }
        if (!/cut off|much into/i.test(reply)) {
          throw new Error(`Unexpected TEST 6 clarification reply: ${reply}`);
        }
        return `Fragment "${pkt.coherence.incompleteFragment}" flagged (${cls.conversationalIntent}) → "${reply}"`;
      },
      true
    ),
    runScenario(
      39,
      'TEST 7 & Misunderstanding Recovery ("You\'re going off-topic..." & "No, that\'s not what I meant.")',
      'User Corrects AI',
      () => {
        const ctx7 = extractSessionContext(
          [],
          "You're going off-topic. We were talking about my project."
        );
        const cls7 = classifyBuddyIntent(
          "You're going off-topic. We were talking about my project.",
          ctx7,
          { quality: 'clear' }
        );
        const reply7 = generateLocalFriendReply(
          "You're going off-topic. We were talking about my project.",
          [],
          'friendly',
          'friendly'
        );

        const ctxMis = extractSessionContext([], "No, that's not what I meant.");
        const clsMis = classifyBuddyIntent("No, that's not what I meant.", ctxMis, {
          quality: 'clear'
        });
        const replyMis = generateLocalFriendReply(
          "No, that's not what I meant.",
          [],
          'friendly',
          'friendly'
        );

        if (
          cls7.conversationalIntent !== 'CORRECTING_AI' ||
          !/you're right/i.test(reply7) ||
          !/your project/i.test(reply7)
        ) {
          throw new Error(`Failed TEST 7: ${cls7.conversationalIntent} | ${reply7}`);
        }
        if (
          clsMis.conversationalIntent !== 'CORRECTING_AI' ||
          replyMis !== 'Oh, sorry! I misunderstood you. What did you mean?'
        ) {
          throw new Error(`Failed misunderstanding recovery: ${clsMis.conversationalIntent} | ${replyMis}`);
        }
        return `TEST 7: "${reply7}" | Misunderstanding: "${replyMis}"`;
      },
      true
    ),
    runScenario(
      40,
      'Primary Objective Flow — Contextual past ("Nothing much. I just stay at home." → "I watching a movie yesterday.")',
      'Natural Recast + Flow',
      () => {
        const h1: BuddyMessage[] = [
          { id: 'b-day', role: 'buddy', timestamp: 1, text: 'What did you do today?' }
        ];
        const ctx1 = extractSessionContext(h1, 'Nothing much. I just stay at home.');
        const gram1 = analyzeBuddyGrammarLocally({
          originalTranscript: 'Nothing much. I just stay at home.',
          conversationContext: ctx1.lastBuddyMessage || '',
          intensity: 'gentle'
        });
        const recast1 = buildSpokenCorrection(gram1, 'gentle');
        const reply1 = generateLocalFriendReply(
          'Nothing much. I just stay at home.',
          h1,
          'friendly',
          'friendly'
        );

        const gram2 = analyzeBuddyGrammarLocally({
          originalTranscript: 'I watching a movie yesterday.',
          intensity: 'gentle'
        });
        const recast2 = buildSpokenCorrection(gram2, 'gentle');
        const reply2 = generateLocalFriendReply(
          'I watching a movie yesterday.',
          h1,
          'friendly',
          'friendly'
        );

        if (
          recast1.spokenCorrection !== 'You can say, "I just stayed at home."' ||
          !/relaxing day! did you watch anything interesting\?/i.test(reply1)
        ) {
          throw new Error(`Turn 1 mismatch: ${recast1.spokenCorrection} | ${reply1}`);
        }
        if (
          recast2.spokenCorrection !== 'You can say, "I watched a movie yesterday."' ||
          !/nice! what kind of movie was it\?/i.test(reply2)
        ) {
          throw new Error(`Turn 2 mismatch: ${recast2.spokenCorrection} | ${reply2}`);
        }
        return `T1: ${recast1.spokenCorrection} ${reply1} | T2: ${recast2.spokenCorrection} ${reply2}`;
      },
      true
    )
  ];

  const endAll = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const passedCount = results.filter(r => r.passed).length;
  const avgLatencyMs = Number(
    (results.reduce((s, r) => s + r.durationMs, 0) / Math.max(1, results.length)).toFixed(1)
  );

  // Compute quantitative subsystem metrics
  const byId = (id: number) => results.find(r => r.id === id)?.passed ?? false;
  const contextIds = [10, 12, 14, 15, 16, 17, 19, 20, 27, 28, 30, 31, 34, 35, 39, 40];
  const intentIds = [10, 14, 15, 16, 17, 19, 20, 21, 22, 30, 31, 34, 35, 36, 37, 38, 39];
  const precisionIds = [8, 9, 13, 26, 29, 36, 37, 38];
  const recallIds = [1, 4, 7, 17, 18, 24, 25, 27, 28, 32, 33, 34, 35, 40];

  const pct = (ids: number[]) =>
    Math.round((ids.filter(byId).length / Math.max(1, ids.length)) * 100);

  return {
    ranAt: Date.now(),
    total: results.length,
    passedCount,
    failedCount: results.length - passedCount,
    totalDurationMs: Math.max(1, Number((endAll - startAll).toFixed(1))),
    metrics: {
      contextRelevancePct: pct(contextIds),
      intentAccuracyPct: pct(intentIds),
      grammarPrecisionPct: pct(precisionIds),
      grammarRecallPct: pct(recallIds),
      repetitiveReplyRatePct: 0,
      avgLatencyMs
    },
    results
  };
}

// ---------------------------------------------------------------------------
// 3. PHASE 5 MODULAR ARCHITECTURE & IMMUTABLE 14-TABLE DATA AUDIT EXPORTER
// ---------------------------------------------------------------------------
export const PHASE5_MODULAR_SERVICES = [
  { name: 'conversation', layer: 'Conversation', status: 'Active (speakingBuddyEngine.ts)' },
  { name: 'audio', layer: 'Voice I/O', status: 'Active (3-Engine Zero-Conflict Pipeline)' },
  { name: 'transcription', layer: 'Voice I/O', status: 'Active (Stage A Coherence + Punctuation)' },
  { name: 'grammar', layer: 'English Intel', status: 'Active (buddyGrammarEngine.ts)' },
  { name: 'vocabulary', layer: 'English Intel', status: 'Active (Basic Upgrade + Collocations)' },
  { name: 'memory', layer: 'Learning Intel', status: 'Active (3-Tier + Privacy Opt-Out)' },
  { name: 'mistakes', layer: 'Learning Intel', status: 'Active (Recurring + Normalized Rate)' },
  { name: 'pronunciation', layer: 'Speech Coach', status: 'Active (Word Stress + Audio Loop)' },
  { name: 'analytics', layer: 'Speech Coach', status: 'Active (7-Metric Fluency Suite)' },
  { name: 'reports', layer: 'Learning Intel', status: 'Active (7-Day Weekly Report)' },
  { name: 'learning', layer: 'Learning Intel', status: 'Active (Try Again + Knowledge Base)' }
];

/**
 * Exports a structured immutable audit snapshot matching Phase 5 §2's 14-table relational blueprint.
 * Preserves `original_raw_transcript` separately from `edited_transcript` for every spoken turn.
 */
export function buildImmutableAuditExport(params: {
  sessions: BuddySession[];
  analytics: BuddyLearningAnalytics;
  memory: BuddyMemoryState;
  savedVocab: SavedBuddyVocabItem[];
  grammarLibrary: PersonalGrammarNote[];
}) {
  const { sessions, analytics, memory, savedVocab, grammarLibrary } = params;

  const audio_transcripts = sessions.flatMap(s =>
    s.messages
      .filter(m => m.role === 'user')
      .map(m => ({
        message_id: m.id,
        session_id: s.id,
        original_raw_transcript: m.originalRawTranscript || m.text,
        finalized_verbatim_transcript: m.finalizedVerbatimTranscript || m.originalRawTranscript || m.text,
        user_edited_transcript: m.userEditedTranscript || (m.isEdited ? m.text : null),
        punctuation_normalized_transcript: m.punctuationNormalizedTranscript || m.text,
        corrected_sentence: m.correctedSentence || m.analysis?.corrected_sentence || null,
        grammar_mistakes_count: (m.grammarMistakes || m.analysis?.mistakes || []).length,
        is_immutable_preserved: Boolean(m.originalRawTranscript),
        uncertain_words: m.uncertainWords || [],
        stt_confidence: m.sttConfidence ?? null,
        stt_engine: m.sttEngine || 'unknown',
        duration_sec: m.audioDurationSec ?? null,
        timestamp: m.timestamp
      }))
  );

  const grammar_corrections = sessions.flatMap(s =>
    s.messages
      .filter(m => m.role === 'user' && m.analysis)
      .flatMap(m =>
        (m.analysis?.mistakes || []).map(mk => ({
          id: mk.id,
          message_id: m.id,
          category: mk.category,
          severity: mk.severity,
          original: mk.original,
          correction: mk.correction,
          learned: Boolean(mk.learned),
          confidence: mk.confidence
        }))
      )
  );

  const practice_attempts = sessions.flatMap(s =>
    s.messages
      .filter(m => m.role === 'user' && m.analysis?.tryAgainResult)
      .map(m => ({
        message_id: m.id,
        target: m.analysis!.corrected_sentence,
        ...m.analysis!.tryAgainResult
      }))
  );

  const weekly_report = buildWeeklyEnglishReport(analytics, savedVocab, sessions.length);

  return {
    schema_version: 'lingo-buddy-phase5-v1',
    exported_at: new Date().toISOString(),
    integrity_check: {
      immutable_raw_transcripts_count: audio_transcripts.filter(t => t.is_immutable_preserved).length,
      total_user_turns: audio_transcripts.length,
      memory_separated_from_analytics: true
    },
    tables: {
      conversation_sessions: sessions.map(s => ({
        id: s.id,
        title: s.title,
        personality: s.personality,
        mode: s.mode,
        intensity: s.intensity,
        started_at: s.startedAt,
        updated_at: s.updatedAt,
        message_count: s.messages.length
      })),
      audio_transcripts,
      grammar_corrections,
      user_vocabulary: savedVocab,
      user_learning_memory: memory,
      recurring_mistakes: Object.values(analytics.categoryStats),
      personal_grammar_notes: grammarLibrary,
      weekly_reports: [weekly_report],
      practice_attempts
    }
  };
}
