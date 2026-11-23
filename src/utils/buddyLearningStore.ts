/**
 * AI Speaking Buddy (Lingo Buddy) — Phase 3 Layer 3: Learning Intelligence Store
 * Decoupled persistence & analytics for:
 *  - P1.2 Personal Vocabulary Collection + Organic Expression Drops ("Teach Me Something New")
 *  - P1.3 Three-Tier Long-Term Memory (strictly separated from learning analytics, with full Privacy Controls)
 *  - P1.4 Recurring Mistake Tracking & Normalized Error Rate (Confirmed Errors / Analyzed Words * 100)
 *  - 5.1 "Try Again" Active Spoken Verification Evaluator
 *  - 5.4 Personal English Knowledge Base
 */

import type {
  BuddyGrammarAnalysis,
  BuddyLearningAnalytics,
  BuddyMemoryItem,
  BuddyMemoryState,
  BuddyMistake,
  BuddyPersonality,
  DailyBuddyActivity,
  ExplanationLangMode,
  GrammarCategoryCode,
  MistakeRecurrenceRecord,
  PersonalGrammarNote,
  SavedBuddyVocabItem,
  TryAgainAttemptResult,
  WeeklyEnglishReport
} from '../types/speakingBuddy';

// Strictly separate storage namespaces (Privacy Invariant from Phase 3 P1.3)
const MEMORY_STORAGE_KEY = 'ielts_buddy_long_term_memory_v1';
const ANALYTICS_STORAGE_KEY = 'ielts_buddy_learning_analytics_v1';
const VOCAB_STORAGE_KEY = 'ielts_buddy_vocab_collection_v1';
const GRAMMAR_KB_STORAGE_KEY = 'ielts_buddy_grammar_library_v1';
const EXPLANATION_LANG_KEY = 'ielts_buddy_explanation_lang_v1';

export function loadExplanationLangMode(fallbackSinhala: boolean): ExplanationLangMode {
  if (typeof window === 'undefined') return fallbackSinhala ? 'bilingual_si' : 'english';
  try {
    const saved = localStorage.getItem(EXPLANATION_LANG_KEY) as ExplanationLangMode | null;
    if (
      saved === 'english' ||
      saved === 'simple_english' ||
      saved === 'bilingual_si' ||
      saved === 'sinhala_focused'
    ) {
      return saved;
    }
    return fallbackSinhala ? 'bilingual_si' : 'english';
  } catch {
    return fallbackSinhala ? 'bilingual_si' : 'english';
  }
}

export function saveExplanationLangMode(mode: ExplanationLangMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXPLANATION_LANG_KEY, mode);
  } catch { }
}

// ---------------------------------------------------------------------------
// 5.2 "TEACH ME SOMETHING NEW" — CURATED ORGANIC NATURAL EXPRESSION DROPS
// ---------------------------------------------------------------------------
export interface OrganicExpressionDrop {
  id: string;
  basicPhrase: string;
  naturalPhrase: string;
  explanation: string;
  explanationSi: string;
  example: string;
  synonyms: string[];
  category: 'expression' | 'collocation' | 'vocabulary';
}

export const ORGANIC_EXPRESSION_DROPS: OrganicExpressionDrop[] = [
  {
    id: 'exp-overwhelmed',
    basicPhrase: 'I had too much work',
    naturalPhrase: 'I was overwhelmed with work',
    explanation: '"Overwhelmed with work" naturally conveys feeling buried under tasks or deadlines.',
    explanationSi: 'වැඩ අධික වී පීඩනයක් දැනෙන විට "I had too much work" වෙනුවට "I was overwhelmed with work" යෙදීම ඉතා ස්වාභාවිකයි.',
    example: 'I wanted to call you yesterday, but I was completely overwhelmed with work.',
    synonyms: ['swamped with work', 'snowed under', 'up to my neck in work'],
    category: 'expression'
  },
  {
    id: 'exp-unwind',
    basicPhrase: 'I want to relax after a tired day',
    naturalPhrase: 'I like to unwind after a hectic day',
    explanation: '"Unwind" means releasing stress and relaxing smoothly; "hectic day" sounds far more fluent than "tired day".',
    explanationSi: 'කාර්යබහුල දවසකින් පසු සැහැල්ලු වීමට "unwind after a hectic day" ලෙස කීම වඩාත් උසස් ඉංග්‍රීසි යෙදුමකි.',
    example: 'After a hectic day at university, I usually unwind by listening to calm music.',
    synonyms: ['decompress', 'recharge my batteries', 'take it easy'],
    category: 'expression'
  },
  {
    id: 'exp-catch-up',
    basicPhrase: 'Meet my friends and talk about news',
    naturalPhrase: 'Catch up with my friends',
    explanation: '"Catch up with" is the everyday native phrasal verb for meeting friends you haven\'t seen recently to share updates.',
    explanationSi: 'කාලෙකට පසු මිතුරන් හමුවී තොරතුරු කතා කිරීමට "catch up with my friends" භාවිත කරයි.',
    example: 'I went to a cafe on Sunday to catch up with a few college friends.',
    synonyms: ['reconnect with', 'hang out with', 'get together with'],
    category: 'expression'
  },
  {
    id: 'exp-heavy-traffic',
    basicPhrase: 'There was big traffic and strong rain',
    naturalPhrase: 'I got stuck in heavy traffic during the heavy rain',
    explanation: 'English pairs both "traffic" and "rain" with the adjective "heavy", and uses "got stuck in" for traffic jams.',
    explanationSi: 'වර්ෂාව සහ වාහන තදබදය සඳහා "heavy rain" සහ "heavy traffic" යෙදීම නිවැරදි collocation වේ.',
    example: 'I arrived twenty minutes late because I got stuck in heavy traffic.',
    synonyms: ['bumper-to-bumper traffic', 'pouring rain', 'torrential rain'],
    category: 'collocation'
  },
  {
    id: 'exp-captivating',
    basicPhrase: 'The movie was very good and very interesting',
    naturalPhrase: 'The movie was genuinely captivating',
    explanation: '"Captivating" describes a story, movie, or talk that holds your complete attention from start to finish.',
    explanationSi: 'සම්පූර්ණ අවධානය ඇදගන්නා සුළු චිත්‍රපටයක් හෝ කතාවක් සඳහා "captivating" යොදන්න.',
    example: 'I watched a documentary last night that was genuinely captivating.',
    synonyms: ['fascinating', 'gripping', 'compelling'],
    category: 'vocabulary'
  },
  {
    id: 'exp-make-up-mind',
    basicPhrase: 'I still did not decide what to do',
    naturalPhrase: "I haven't made up my mind yet",
    explanation: '"Make up your mind" is a natural everyday idiom meaning to finally reach a decision.',
    explanationSi: 'තීරණයක් ගැනීමට නොහැකිව සිටින විට "I haven\'t made up my mind yet" යයි කීම ස්වාභාවිකයි.',
    example: "I'm thinking about two laptop models, but I haven't made up my mind yet.",
    synonyms: ['come to a decision', 'settle on', 'decide once and for all'],
    category: 'expression'
  },
  {
    id: 'exp-hang-of-it',
    basicPhrase: 'I am slowly learning how to do it well',
    naturalPhrase: "I'm finally getting the hang of it",
    explanation: '"Get the hang of something" means gradually mastering a new skill like coding, cooking, or speaking English.',
    explanationSi: 'අලුත් කුසලතාවක් ක්‍රමයෙන් හුරු වී හොඳින් කිරීමට පටන් ගන්නා විට "getting the hang of it" භාවිත කරයි.',
    example: "TypeScript felt confusing at first, but I'm finally getting the hang of it.",
    synonyms: ['picking it up', 'getting comfortable with it', 'mastering the basics'],
    category: 'expression'
  },
  {
    id: 'exp-worth-effort',
    basicPhrase: 'It was hard work, but the result was good',
    naturalPhrase: 'It was challenging, but totally worth the effort',
    explanation: '"Worth the effort" smoothly sums up any demanding project, exam, or dish that pays off in the end.',
    explanationSi: 'අමාරු වුණත් ප්‍රතිඵලය වටිනා බව කියන්න "totally worth the effort" යොදන්න.',
    example: 'Cooking everything from scratch took two hours, but it was totally worth the effort.',
    synonyms: ['well worth it', 'paid off in the end', 'rewarding'],
    category: 'expression'
  }
];

// ---------------------------------------------------------------------------
// P1.3 LONG-TERM PERSONAL MEMORY (WITH MANDATORY PRIVACY CONTROLS)
// ---------------------------------------------------------------------------
const DEFAULT_MEMORY_STATE: BuddyMemoryState = {
  enabled: true,
  items: [],
  lastUpdatedAt: 0
};

export function loadBuddyMemory(): BuddyMemoryState {
  if (typeof window === 'undefined') return { ...DEFAULT_MEMORY_STATE };
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MEMORY_STATE };
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      lastUpdatedAt: typeof parsed.lastUpdatedAt === 'number' ? parsed.lastUpdatedAt : 0
    };
  } catch {
    return { ...DEFAULT_MEMORY_STATE };
  }
}

export function saveBuddyMemory(state: BuddyMemoryState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(state));
  } catch { }
}

export function setMemoryPersonalizationEnabled(enabled: boolean): BuddyMemoryState {
  const curr = loadBuddyMemory();
  const next: BuddyMemoryState = { ...curr, enabled, lastUpdatedAt: Date.now() };
  saveBuddyMemory(next);
  return next;
}

export function deleteBuddyMemoryItem(id: string): BuddyMemoryState {
  const curr = loadBuddyMemory();
  const next: BuddyMemoryState = {
    ...curr,
    items: curr.items.filter(m => m.id !== id),
    lastUpdatedAt: Date.now()
  };
  saveBuddyMemory(next);
  return next;
}

export function clearAllBuddyMemories(): BuddyMemoryState {
  const curr = loadBuddyMemory();
  const next: BuddyMemoryState = {
    enabled: curr.enabled,
    items: [],
    lastUpdatedAt: Date.now()
  };
  saveBuddyMemory(next);
  return next;
}

export function addManualBuddyMemory(
  label: string,
  detail: string,
  category: BuddyMemoryItem['category'] = 'interest'
): BuddyMemoryState {
  const curr = loadBuddyMemory();
  const cleanLabel = label.trim();
  const cleanDetail = detail.trim();
  if (!cleanLabel) return curr;
  const exists = curr.items.some(m => m.label.toLowerCase() === cleanLabel.toLowerCase());
  if (exists) return curr;
  const nextItem: BuddyMemoryItem = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label: cleanLabel,
    detail: cleanDetail || cleanLabel,
    category,
    createdAt: Date.now()
  };
  const next: BuddyMemoryState = {
    ...curr,
    items: [nextItem, ...curr.items].slice(0, 20),
    lastUpdatedAt: Date.now()
  };
  saveBuddyMemory(next);
  return next;
}

/**
 * Safely extracts ONLY stable high-level interests, goals, and topics from clear spoken turns.
 * Never stores raw unedited sentences indiscriminately as personal facts.
 */
export function extractAndStoreLongTermMemories(
  userText: string,
  isUnclear: boolean
): { state: BuddyMemoryState; newlyAdded: BuddyMemoryItem[] } {
  const curr = loadBuddyMemory();
  if (!curr.enabled || isUnclear) {
    return { state: curr, newlyAdded: [] };
  }

  const lower = userText.toLowerCase();
  const candidates: Omit<BuddyMemoryItem, 'id' | 'createdAt'>[] = [];

  // 1. Tech / Skills currently learning
  const techLearnMatch = userText.match(
    /\b(?:learning|studying|building\s+with|working\s+(?:with|on)|practising|practicing)\s+(react(?:\s+and\s+typescript)?|typescript|javascript|python|java|ai|artificial\s+intelligence|machine\s+learning|web\s+development|software\s+engineering|data\s+science|ui\/?ux|flutter|node\.?js)\b/i
  );
  if (techLearnMatch) {
    const skill = techLearnMatch[1].trim();
    const formatted = skill.replace(/\b\w/g, c => c.toUpperCase());
    candidates.push({
      label: formatted,
      detail: `Currently learning or working with ${formatted}`,
      category: 'interest'
    });
  }

  // 2. Academic / Career fields
  const fieldMatch = userText.match(
    /\b(?:my\s+(?:major|degree|course|job|work)\s+is|i\s+study|i\s+am\s+a|i'm\s+a)\s+(software\s+engineer(?:ing)?|computer\s+science|engineering|medicine|business|marketing|accounting|design|university\s+student|developer|teacher)\b/i
  );
  if (fieldMatch) {
    const field = fieldMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
    candidates.push({
      label: field,
      detail: `Academic / career focus: ${field}`,
      category: 'topic'
    });
  }

  // 3. IELTS / English Goals
  const ieltsGoalMatch = userText.match(
    /\b(?:ielts|band\s+[6789](?:\.5)?|improve\s+my\s+(?:english|speaking|fluency)|study\s+abroad|move\s+to\s+(?:uk|australia|canada|germany|new\s+zealand))\b/i
  );
  if (ieltsGoalMatch) {
    const rawGoal = ieltsGoalMatch[0].trim();
    candidates.push({
      label: rawGoal.toLowerCase().includes('band')
        ? `Target: ${rawGoal.toUpperCase()}`
        : rawGoal.toLowerCase().includes('ielts')
        ? 'IELTS Speaking Prep'
        : rawGoal.replace(/\b\w/g, c => c.toUpperCase()),
      detail: `English learning goal: ${rawGoal}`,
      category: 'goal'
    });
  }

  // 4. Hobbies & Everyday Interests
  const hobbyPatterns: { regex: RegExp; label: string; detail: string }[] = [
    {
      regex: /\b(?:love|like|enjoy|into|planning\s+to)\s+(?:cooking|cook)\b|\b(?:ginger\s+and\s+cooking\s+oil|cook\s+a\s+big\s+meal)\b/i,
      label: 'Cooking',
      detail: 'Enjoys cooking homemade meals and recipes'
    },
    {
      regex: /\b(?:love|like|enjoy|into)\s+(?:travelling|traveling|travel|exploring\s+different\s+cultures)\b/i,
      label: 'Travelling',
      detail: 'Enjoys travelling and exploring cultures'
    },
    {
      regex: /\b(?:love|like|enjoy|play|playing|watch|watching)\s+(cricket|football|badminton|chess|swimming|basketball)\b/i,
      label: 'Sports',
      detail: 'Enjoys following or playing sports'
    },
    {
      regex: /\b(?:love|like|enjoy|into)\s+(movies|cinema|anime|music|reading|books|photography|gaming)\b/i,
      label: 'Entertainment & Hobbies',
      detail: 'Enjoys creative hobbies and entertainment'
    }
  ];

  for (const hp of hobbyPatterns) {
    const m = lower.match(hp.regex);
    if (m) {
      const specific = m[1] ? m[1].charAt(0).toUpperCase() + m[1].slice(1) : hp.label;
      candidates.push({
        label: specific,
        detail: m[1] ? `Enjoys ${m[1]}` : hp.detail,
        category: 'interest'
      });
    }
  }

  const newlyAdded: BuddyMemoryItem[] = [];
  const nextItems = [...curr.items];

  for (const c of candidates) {
    const dup = nextItems.some(item => item.label.toLowerCase() === c.label.toLowerCase());
    if (!dup) {
      const item: BuddyMemoryItem = {
        id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: c.label,
        detail: c.detail,
        category: c.category,
        createdAt: Date.now()
      };
      nextItems.unshift(item);
      newlyAdded.push(item);
    }
  }

  if (newlyAdded.length === 0) {
    return { state: curr, newlyAdded: [] };
  }

  const nextState: BuddyMemoryState = {
    ...curr,
    items: nextItems.slice(0, 20),
    lastUpdatedAt: Date.now()
  };
  saveBuddyMemory(nextState);
  return { state: nextState, newlyAdded };
}

/**
 * Generates a warm cross-session greeting referencing saved long-term memories
 * (e.g., Day 3: "Hey! How is your React learning going? Did you build anything fun lately?")
 */
export function generateMemoryAwareGreeting(
  memory: BuddyMemoryState,
  analytics: BuddyLearningAnalytics,
  personality: BuddyPersonality
): string | undefined {
  if (!memory.enabled || memory.items.length === 0) return undefined;

  const topInterest = memory.items.find(m => m.category === 'interest') || memory.items[0];
  const topRecurring = getTopRecurringMistakes(analytics)[0];

  if (topInterest.label.toLowerCase().includes('react') || topInterest.label.toLowerCase().includes('typescript')) {
    return `Hey! Good to see you again! How is your ${topInterest.label} learning going — did you manage to build anything cool recently?`;
  }
  if (topInterest.label.toLowerCase().includes('cooking')) {
    return `Hey friend! Welcome back! Have you cooked any delicious meals recently, or are you trying out a new recipe this week?`;
  }
  if (topInterest.label.toLowerCase().includes('travelling')) {
    return `Hey! Great to chat again! Have you been planning any new trips lately, or reminiscing about a favourite place you visited?`;
  }
  if (topRecurring && topRecurring.category === 'VERB_TENSE' && topRecurring.count >= 2) {
    return `Hey! Nice to catch up again! Tell me about something memorable you did yesterday or over the weekend — how did it go?`;
  }
  if (personality === 'calm') {
    return `Welcome back. Take your time — how have things been going with ${topInterest.label} lately?`;
  }
  return `Hey! Great to see you back! How have things been going with ${topInterest.label} lately?`;
}

// ---------------------------------------------------------------------------
// P1.4 RECURRING MISTAKE TRACKING & NORMALIZED ERROR RATE
// ---------------------------------------------------------------------------
const DEFAULT_ANALYTICS: BuddyLearningAnalytics = {
  totalAnalyzedWords: 0,
  totalConfirmedErrors: 0,
  totalMistakesCorrected: 0,
  totalTryAgainAttempts: 0,
  totalTryAgainSuccesses: 0,
  totalSecondsSpoken: 0,
  totalHesitations: 0,
  categoryStats: {},
  errorRateHistory: [],
  dailyActivity: {}
};

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function loadBuddyAnalytics(): BuddyLearningAnalytics {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_ANALYTICS, categoryStats: {}, errorRateHistory: [], dailyActivity: {} };
  }
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_ANALYTICS, categoryStats: {}, errorRateHistory: [], dailyActivity: {} };
    }
    const parsed = JSON.parse(raw);
    return {
      totalAnalyzedWords: Number(parsed.totalAnalyzedWords) || 0,
      totalConfirmedErrors: Number(parsed.totalConfirmedErrors) || 0,
      totalMistakesCorrected: Number(parsed.totalMistakesCorrected) || 0,
      totalTryAgainAttempts: Number(parsed.totalTryAgainAttempts) || 0,
      totalTryAgainSuccesses: Number(parsed.totalTryAgainSuccesses) || 0,
      totalSecondsSpoken: Number(parsed.totalSecondsSpoken) || 0,
      totalHesitations: Number(parsed.totalHesitations) || 0,
      categoryStats: parsed.categoryStats && typeof parsed.categoryStats === 'object' ? parsed.categoryStats : {},
      errorRateHistory: Array.isArray(parsed.errorRateHistory) ? parsed.errorRateHistory : [],
      dailyActivity: parsed.dailyActivity && typeof parsed.dailyActivity === 'object' ? parsed.dailyActivity : {}
    };
  } catch {
    return { ...DEFAULT_ANALYTICS, categoryStats: {}, errorRateHistory: [], dailyActivity: {} };
  }
}

export function saveBuddyAnalytics(analytics: BuddyLearningAnalytics): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics));
  } catch { }
}

export function computeNormalizedErrorRate(confirmedErrors: number, analyzedWords: number): number {
  if (analyzedWords <= 0) return 0;
  return Number(((confirmedErrors / analyzedWords) * 100).toFixed(1));
}

export function getCorrectionSuccessRate(analytics: BuddyLearningAnalytics): number {
  if (analytics.totalTryAgainAttempts === 0) return 0;
  return Math.round((analytics.totalTryAgainSuccesses / analytics.totalTryAgainAttempts) * 100);
}

export function getTopRecurringMistakes(analytics: BuddyLearningAnalytics): MistakeRecurrenceRecord[] {
  return Object.values(analytics.categoryStats)
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count || b.lastSeenAt - a.lastSeenAt);
}

export function getErrorRateTrend(analytics: BuddyLearningAnalytics): {
  direction: 'improving' | 'steady' | 'focus';
  label: string;
} {
  const hist = analytics.errorRateHistory;
  if (hist.length < 4) {
    return { direction: 'steady', label: 'Keep speaking to unlock accuracy trends' };
  }
  const half = Math.floor(hist.length / 2);
  const earlierAvg =
    hist.slice(0, half).reduce((s, h) => s + h.errorRate, 0) / Math.max(1, half);
  const recentAvg =
    hist.slice(half).reduce((s, h) => s + h.errorRate, 0) / Math.max(1, hist.length - half);

  if (recentAvg < earlierAvg - 1.5) {
    return {
      direction: 'improving',
      label: `Error rate dropped from ${earlierAvg.toFixed(1)}% → ${recentAvg.toFixed(1)}% in recent turns!`
    };
  }
  if (recentAvg > earlierAvg + 2.5) {
    return {
      direction: 'focus',
      label: 'A few recurring patterns popped up — try the "Try Again" practice button!'
    };
  }
  return {
    direction: 'steady',
    label: `Steady accuracy around ${recentAvg.toFixed(1)} errors per 100 words.`
  };
}

export function recordTurnAnalytics(
  analysis: BuddyGrammarAnalysis,
  durationSec?: number
): BuddyLearningAnalytics {
  // Never pollute learning analytics with unclear / garbled STT noise!
  if (analysis.transcriptQuality === 'unclear') {
    return loadBuddyAnalytics();
  }

  const curr = loadBuddyAnalytics();
  const words = analysis.original_sentence
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (words === 0) return curr;

  const confirmedErrors = analysis.mistakes.filter(
    m => m.severity === 'GRAMMAR_ERROR' || m.severity === 'UNNATURAL'
  );
  const now = Date.now();
  const nextStats: Record<string, MistakeRecurrenceRecord> = { ...curr.categoryStats };

  for (const m of confirmedErrors) {
    const existing = nextStats[m.category];
    const exampleEntry = { original: m.original, correction: m.correction, timestamp: now };
    if (existing) {
      nextStats[m.category] = {
        ...existing,
        count: existing.count + 1,
        recentExamples: [exampleEntry, ...existing.recentExamples].slice(0, 6),
        lastSeenAt: now
      };
    } else {
      nextStats[m.category] = {
        category: m.category,
        categoryLabel: m.categoryLabel,
        count: 1,
        masteredCount: 0,
        recentExamples: [exampleEntry],
        lastSeenAt: now
      };
    }
  }

  // Phase 4 P2.2 — Update 7-day Daily Activity Bucket
  const todayDate = new Date(now);
  const dateKey = toDateKey(todayDate);
  const dayLabel = SHORT_DAYS[todayDate.getDay()];
  const estSec =
    typeof durationSec === 'number' && durationSec > 0
      ? durationSec
      : Math.max(3, Math.round((words / 130) * 60));
  const turnHesitations = analysis.fluency?.hesitationCount || 0;
  const turnWpm = analysis.fluency?.wpm || 0;

  const prevDaily = curr.dailyActivity || {};
  const existingDay: DailyBuddyActivity = prevDaily[dateKey] || {
    dateKey,
    dayLabel,
    secondsSpoken: 0,
    wordsSpoken: 0,
    confirmedErrors: 0,
    turnsCount: 0,
    hesitationCount: 0,
    wpmSum: 0,
    wpmSamples: 0
  };
  const updatedDaily: Record<string, DailyBuddyActivity> = {
    ...prevDaily,
    [dateKey]: {
      ...existingDay,
      secondsSpoken: existingDay.secondsSpoken + estSec,
      wordsSpoken: existingDay.wordsSpoken + words,
      confirmedErrors: existingDay.confirmedErrors + confirmedErrors.length,
      turnsCount: existingDay.turnsCount + 1,
      hesitationCount: existingDay.hesitationCount + turnHesitations,
      wpmSum: existingDay.wpmSum + (turnWpm > 0 ? turnWpm : 0),
      wpmSamples: existingDay.wpmSamples + (turnWpm > 0 ? 1 : 0)
    }
  };

  // Prune daily buckets older than 28 days
  const dailyKeys = Object.keys(updatedDaily).sort();
  if (dailyKeys.length > 28) {
    for (const oldKey of dailyKeys.slice(0, dailyKeys.length - 28)) {
      delete updatedDaily[oldKey];
    }
  }

  const turnErrorRate = computeNormalizedErrorRate(confirmedErrors.length, words);
  const nextAnalytics: BuddyLearningAnalytics = {
    totalAnalyzedWords: curr.totalAnalyzedWords + words,
    totalConfirmedErrors: curr.totalConfirmedErrors + confirmedErrors.length,
    totalMistakesCorrected: curr.totalMistakesCorrected + confirmedErrors.length,
    totalTryAgainAttempts: curr.totalTryAgainAttempts,
    totalTryAgainSuccesses: curr.totalTryAgainSuccesses,
    totalSecondsSpoken: (curr.totalSecondsSpoken || 0) + estSec,
    totalHesitations: (curr.totalHesitations || 0) + turnHesitations,
    categoryStats: nextStats,
    errorRateHistory: [
      ...curr.errorRateHistory,
      { timestamp: now, errorRate: turnErrorRate, words, errors: confirmedErrors.length }
    ].slice(-40),
    dailyActivity: updatedDaily
  };

  saveBuddyAnalytics(nextAnalytics);
  return nextAnalytics;
}

/**
 * Phase 4 P2.2 — Builds an evidence-based 7-Day Weekly English Improvement Report
 * Integrity Guardrail: Pure learning analytics — NEVER fabricates official IELTS Band jumps!
 */
export function buildWeeklyEnglishReport(
  analytics: BuddyLearningAnalytics,
  savedVocab: SavedBuddyVocabItem[],
  sessionsCount: number,
  nowDate: Date = new Date()
): WeeklyEnglishReport {
  const dailyMap = analytics.dailyActivity || {};
  const dailySeries: (DailyBuddyActivity & { normalizedErrorRate: number; avgWpm: number })[] = [];

  let weekSeconds = 0;
  let weekWords = 0;
  let weekErrors = 0;
  let weekHesitations = 0;
  let weekWpmSum = 0;
  let weekWpmSamples = 0;

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(nowDate);
    d.setDate(nowDate.getDate() - offset);
    const key = toDateKey(d);
    const bucket = dailyMap[key];
    const base: DailyBuddyActivity = bucket || {
      dateKey: key,
      dayLabel: SHORT_DAYS[d.getDay()],
      secondsSpoken: 0,
      wordsSpoken: 0,
      confirmedErrors: 0,
      turnsCount: 0,
      hesitationCount: 0,
      wpmSum: 0,
      wpmSamples: 0
    };
    const rate = computeNormalizedErrorRate(base.confirmedErrors, base.wordsSpoken);
    const avgWpm = base.wpmSamples > 0 ? Math.round(base.wpmSum / base.wpmSamples) : 0;

    weekSeconds += base.secondsSpoken;
    weekWords += base.wordsSpoken;
    weekErrors += base.confirmedErrors;
    weekHesitations += base.hesitationCount;
    weekWpmSum += base.wpmSum;
    weekWpmSamples += base.wpmSamples;

    dailySeries.push({ ...base, normalizedErrorRate: rate, avgWpm });
  }

  // Previous 7-day window for week-over-week comparison
  let prevWords = 0;
  let prevErrors = 0;
  for (let offset = 13; offset >= 7; offset--) {
    const d = new Date(nowDate);
    d.setDate(nowDate.getDate() - offset);
    const b = dailyMap[toDateKey(d)];
    if (b) {
      prevWords += b.wordsSpoken;
      prevErrors += b.confirmedErrors;
    }
  }

  const weekAgoMs = nowDate.getTime() - 7 * 24 * 60 * 60 * 1000;
  const expressionsThisWeek = savedVocab.filter(v => v.savedAt >= weekAgoMs).length;

  const effectiveWords = weekWords > 0 ? weekWords : analytics.totalAnalyzedWords;
  const effectiveErrors = weekWords > 0 ? weekErrors : analytics.totalConfirmedErrors;
  const effectiveMinutes = Math.max(
    effectiveWords > 0 ? 1 : 0,
    Math.round((weekSeconds || analytics.totalSecondsSpoken || 0) / 60)
  );
  const currentErrorRate = computeNormalizedErrorRate(effectiveErrors, effectiveWords);
  const previousErrorRate =
    prevWords > 0 ? computeNormalizedErrorRate(prevErrors, prevWords) : null;

  let weekOverWeek: WeeklyEnglishReport['weekOverWeek'];
  if (previousErrorRate === null) {
    weekOverWeek = {
      direction: 'first_week',
      summary:
        effectiveWords > 0
          ? `Baseline week established at ${currentErrorRate.toFixed(1)} errors per 100 words across ${effectiveWords} spoken words.`
          : 'Speak a few turns to generate your 7-day baseline accuracy trend.',
      currentErrorRate,
      previousErrorRate: null
    };
  } else if (currentErrorRate < previousErrorRate - 1.2) {
    weekOverWeek = {
      direction: 'improving',
      summary: `Error rate improved from ${previousErrorRate.toFixed(1)}% last week down to ${currentErrorRate.toFixed(1)}% this week!`,
      currentErrorRate,
      previousErrorRate
    };
  } else if (currentErrorRate > previousErrorRate + 2.0) {
    weekOverWeek = {
      direction: 'needs_focus',
      summary: `Error rate rose slightly (${previousErrorRate.toFixed(1)}% → ${currentErrorRate.toFixed(1)}%) — likely because you're trying longer or trickier sentences!`,
      currentErrorRate,
      previousErrorRate
    };
  } else {
    weekOverWeek = {
      direction: 'steady',
      summary: `Steady consistency (${currentErrorRate.toFixed(1)}% vs. ${previousErrorRate.toFixed(1)}% last week).`,
      currentErrorRate,
      previousErrorRate
    };
  }

  const topRecurring = getTopRecurringMistakes(analytics);
  const resolvedCategories = topRecurring
    .filter(r => r.masteredCount >= 1 && r.masteredCount >= Math.ceil(r.count / 2))
    .map(r => r.categoryLabel);

  const avgWeekWpm = weekWpmSamples > 0 ? Math.round(weekWpmSum / weekWpmSamples) : 0;
  const fluencyHighlight =
    avgWeekWpm > 0
      ? avgWeekWpm > 180
        ? `Average pace was ${avgWeekWpm} WPM (brisk) with ${weekHesitations} fillers — try adding brief calm pauses between clauses for extra clarity.`
        : `Comfortable average pace around ${avgWeekWpm} WPM (${weekHesitations} detected hesitation fillers). Clear rhythm beats rushing!`
      : 'Speak with your microphone to capture live WPM pace, pause rhythm, and hesitation trends.';

  const weeklyAchievement =
    resolvedCategories.length > 0
      ? `Great progress in ${resolvedCategories.slice(0, 2).join(' & ')} — you've actively mastered corrected structures via Try Again!`
      : expressionsThisWeek >= 2
      ? `You expanded your active bank with ${expressionsThisWeek} new natural expressions this week.`
      : effectiveWords >= 40
      ? `Solid consistency — you practised ${effectiveWords} spoken words across ${Math.max(1, sessionsCount)} conversations!`
      : 'Start a quick 3-minute voice chat today to unlock your first weekly achievement badge.';

  const topWeak = topRecurring[0]?.categoryLabel;
  const secondWeak = topRecurring[1]?.categoryLabel;
  const nextWeekActionPlan: string[] = [
    topWeak
      ? `Practise ${topWeak} in 2 short everyday conversations`
      : 'Practise describing a recent story using consistent past tense',
    secondWeak
      ? `Review your recurring ${secondWeak} notes in the Library tab`
      : 'Expand sentence complexity with connectors like "although" and "whereas"',
    savedVocab.length > 0
      ? `Use ${Math.min(5, savedVocab.length)} newly saved expressions in real chat turns`
      : 'Save 3 natural expressions from "Teach Me Something New"',
    'Complete 3 relaxed 3-minute casual speaking sessions'
  ];

  return {
    minutesSpoken: effectiveMinutes,
    wordsSpoken: effectiveWords,
    mistakesCorrected: weekWords > 0 ? weekErrors : analytics.totalMistakesCorrected,
    expressionsLearned: expressionsThisWeek > 0 ? expressionsThisWeek : savedVocab.length,
    sessionsCount: Math.max(1, sessionsCount),
    dailySeries,
    weekOverWeek,
    weeklyAchievement,
    fluencyHighlight,
    topRecurringCategories: topRecurring.slice(0, 4),
    resolvedCategories,
    nextWeekActionPlan
  };
}

export function recordTryAgainOutcome(
  matched: boolean,
  categories: GrammarCategoryCode[] = []
): BuddyLearningAnalytics {
  const curr = loadBuddyAnalytics();
  const nextStats = { ...curr.categoryStats };
  if (matched) {
    for (const cat of categories) {
      if (nextStats[cat]) {
        nextStats[cat] = {
          ...nextStats[cat],
          masteredCount: nextStats[cat].masteredCount + 1
        };
      }
    }
  }
  const next: BuddyLearningAnalytics = {
    ...curr,
    totalTryAgainAttempts: curr.totalTryAgainAttempts + 1,
    totalTryAgainSuccesses: curr.totalTryAgainSuccesses + (matched ? 1 : 0),
    categoryStats: nextStats
  };
  saveBuddyAnalytics(next);
  return next;
}

export function resetBuddyAnalytics(): BuddyLearningAnalytics {
  const empty: BuddyLearningAnalytics = {
    ...DEFAULT_ANALYTICS,
    categoryStats: {},
    errorRateHistory: []
  };
  saveBuddyAnalytics(empty);
  return empty;
}

// ---------------------------------------------------------------------------
// 5.1 "TRY AGAIN" — ACTIVE SPOKEN CORRECTION LOOP EVALUATOR
// ---------------------------------------------------------------------------
function normalizeTokensForTryAgain(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['’]ve\b/g, ' have')
    .replace(/['’]m\b/g, ' am')
    .replace(/['’]re\b/g, ' are')
    .replace(/n['’]t\b/g, ' not')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

const HARMLESS_OMITTABLE_WORDS = new Set(['so', 'actually', 'well', 'just', 'really']);

/**
 * Compares what the user spoke in "Try Again" against the target corrected sentence.
 * Tolerates contractions (I've vs I have) and punctuation while strictly verifying that
 * every corrected phrase was produced AND none of the original wrong phrases were repeated.
 */
export function evaluateTryAgainAttempt(
  spokenText: string,
  targetSentence: string,
  requiredCorrections: string[] = [],
  forbiddenOriginals: string[] = []
): TryAgainAttemptResult {
  const spokenTokens = normalizeTokensForTryAgain(spokenText);
  const targetTokens = normalizeTokensForTryAgain(targetSentence);
  const normalizedSpokenPhrase = ` ${spokenTokens.join(' ')} `;

  if (targetTokens.length === 0) {
    return {
      attemptedText: spokenText.trim(),
      matched: false,
      score: 0,
      missedWords: [],
      completedAt: Date.now()
    };
  }

  const spokenBag = [...spokenTokens];
  const missedWords: string[] = [];
  let matchedCount = 0;

  for (const t of targetTokens) {
    const idx = spokenBag.indexOf(t);
    if (idx !== -1) {
      matchedCount += 1;
      spokenBag.splice(idx, 1);
    } else {
      missedWords.push(t);
    }
  }

  // Strictly verify required corrected phrases & ensure original mistake wasn't repeated
  let repeatedOriginal = false;
  for (const orig of forbiddenOriginals) {
    const normOrig = normalizeTokensForTryAgain(orig).join(' ');
    if (normOrig && normalizedSpokenPhrase.includes(` ${normOrig} `)) {
      repeatedOriginal = true;
    }
  }

  let missedRequiredCorrection = false;
  for (const corr of requiredCorrections) {
    const corrTokens = normalizeTokensForTryAgain(corr);
    const normCorr = corrTokens.join(' ');
    if (normCorr && !normalizedSpokenPhrase.includes(` ${normCorr} `)) {
      missedRequiredCorrection = true;
      for (const ct of corrTokens) {
        if (!spokenTokens.includes(ct) && !missedWords.includes(ct)) {
          missedWords.push(ct);
        }
      }
    }
  }

  const score = Math.round((matchedCount / targetTokens.length) * 100);
  const criticalMissed = missedWords.filter(w => !HARMLESS_OMITTABLE_WORDS.has(w));

  // Matched ONLY if: no repeated error, every required correction spoken, and zero critical words missed!
  const matched =
    !repeatedOriginal &&
    !missedRequiredCorrection &&
    criticalMissed.length === 0 &&
    score >= 88;

  return {
    attemptedText: spokenText.trim(),
    matched,
    score: repeatedOriginal ? Math.min(score, 75) : score,
    missedWords,
    completedAt: Date.now()
  };
}

// ---------------------------------------------------------------------------
// P1.2 PERSONAL VOCABULARY COLLECTION
// ---------------------------------------------------------------------------
export function loadSavedVocab(): SavedBuddyVocabItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VOCAB_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveVocabItemToCollection(
  item: Omit<SavedBuddyVocabItem, 'id' | 'savedAt'>
): SavedBuddyVocabItem[] {
  const curr = loadSavedVocab();
  const exists = curr.some(v => v.phrase.toLowerCase() === item.phrase.toLowerCase());
  if (exists) return curr;
  const next: SavedBuddyVocabItem[] = [
    {
      ...item,
      id: `voc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      savedAt: Date.now()
    },
    ...curr
  ].slice(0, 120);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(next));
    } catch { }
  }
  return next;
}

export function removeVocabItemFromCollection(id: string): SavedBuddyVocabItem[] {
  const next = loadSavedVocab().filter(v => v.id !== id);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(next));
    } catch { }
  }
  return next;
}

// ---------------------------------------------------------------------------
// 5.4 PERSONAL ENGLISH KNOWLEDGE BASE (GRAMMAR NOTES LIBRARY)
// ---------------------------------------------------------------------------
export function loadGrammarLibrary(): PersonalGrammarNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GRAMMAR_KB_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMistakeToGrammarLibrary(
  mistake: BuddyMistake,
  mastered: boolean = false
): PersonalGrammarNote[] {
  const curr = loadGrammarLibrary();
  const existingIdx = curr.findIndex(
    n =>
      n.original.toLowerCase() === mistake.original.toLowerCase() &&
      n.correction.toLowerCase() === mistake.correction.toLowerCase()
  );

  let next: PersonalGrammarNote[];
  if (existingIdx !== -1) {
    next = curr.map((n, i) => (i === existingIdx ? { ...n, mastered } : n));
  } else {
    next = [
      {
        id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        original: mistake.original,
        correction: mistake.correction,
        category: mistake.category,
        categoryLabel: mistake.categoryLabel,
        rule: mistake.grammar_rule,
        explanation: mistake.explanation,
        example: mistake.example,
        savedAt: Date.now(),
        mastered
      },
      ...curr
    ].slice(0, 150);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GRAMMAR_KB_STORAGE_KEY, JSON.stringify(next));
    } catch { }
  }
  return next;
}

export function removeGrammarLibraryItem(id: string): PersonalGrammarNote[] {
  const next = loadGrammarLibrary().filter(n => n.id !== id);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GRAMMAR_KB_STORAGE_KEY, JSON.stringify(next));
    } catch { }
  }
  return next;
}
