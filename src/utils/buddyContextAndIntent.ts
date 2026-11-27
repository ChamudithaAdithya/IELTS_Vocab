/**
 * Lingo Buddy Session Entity Memory, Idiom Glossary & 12-Category Conversational Intent Classifier.
 * Extracted from speakingBuddyEngine.ts for modular clarity.
 */

import type {
  BuddyConversationalIntent,
  BuddyMessage,
  BuddyTurnIntent,
  TranscriptCoherenceResult
} from '../types/speakingBuddy';

export type BuddySessionTopic =
  | 'cooking_process'
  | 'school_cancellation'
  | 'quiet_day'
  | 'fitness_gym'
  | 'career_work'
  | 'shopping'
  | 'university'
  | 'work_stress'
  | 'travel'
  | 'entertainment'
  | 'social'
  | 'food_dining'
  | 'general';

export interface BuddySessionContext {
  activeTopic: BuddySessionTopic;
  /** Human-readable active entity/subject from the current thread (for "it", off-topic recovery, project continuation) */
  activeSubject: string | null;
  /** Active place/location mentioned recently (for resolving "there") */
  activePlace: string | null;
  lastBuddyMessage: string | null;
  lastBuddyQuestion: string | null;
  recentUserTexts: string[];
  recentBuddyTexts: string[];
  currentIngredients: string[];
  sessionIngredients: string[];
  mentionedDishes: string[];
  userIsCooking: boolean;
}

const INGREDIENT_TERMS = [
  'cooking oil', 'olive oil', 'coconut oil', 'vegetable oil', 'sesame oil',
  'ginger', 'garlic', 'onion', 'onions', 'chilli', 'chili', 'chillies', 'pepper',
  'salt', 'turmeric', 'cinnamon', 'curry leaves', 'curry powder', 'spices',
  'chicken', 'fish', 'beef', 'pork', 'prawns', 'shrimp', 'egg', 'eggs', 'meat',
  'rice', 'noodles', 'pasta', 'potato', 'potatoes', 'tomato', 'tomatoes',
  'carrot', 'carrots', 'cabbage', 'spinach', 'beans', 'lentils', 'dhal',
  'coconut milk', 'milk', 'butter', 'cheese', 'cream', 'soy sauce', 'sauce',
  'sugar', 'flour', 'oil', 'herbs', 'lemon', 'lime', 'vegetables', 'veggies'
];

const DISH_TERMS = [
  'curry', 'fried rice', 'biryani', 'kottu', 'roti', 'pasta', 'noodles',
  'soup', 'salad', 'sandwich', 'pizza', 'burger', 'cake', 'omelette',
  'stir fry', 'stew', 'noodle soup', 'rice and curry', 'big meal'
];

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'has', 'had',
  'was', 'were', 'are', 'been', 'being', 'will', 'would', 'could', 'should',
  'can', 'may', 'might', 'must', 'about', 'into', 'over', 'after', 'before',
  'just', 'really', 'very', 'actually', 'basically', 'like', 'some', 'more',
  'then', 'than', 'when', 'what', 'where', 'which', 'while', 'they', 'them',
  'their', 'there', 'here', 'your', 'you', 'mine', 'ours', 'doing', 'done',
  'make', 'made', 'going', 'went', 'think', 'thought', 'know', 'said', 'say',
  'today', 'yesterday', 'tomorrow', 'thing', 'things', 'something', 'anything',
  'nothing', 'well', 'also', 'even', 'still', 'much', 'many', 'kind', 'sort'
]);

function extractMatchingTerms(text: string, dictionary: string[]): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const term of dictionary) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'i');
    if (re.test(lower)) {
      // Avoid duplicating "oil" if "cooking oil" already matched
      if (term === 'oil' && found.some(f => f.endsWith('oil'))) continue;
      if (term === 'rice' && found.some(f => f.includes('rice'))) continue;
      if (term === 'milk' && found.some(f => f.includes('milk'))) continue;
      if (term === 'sauce' && found.some(f => f.includes('sauce'))) continue;
      if (!found.includes(term)) found.push(term);
    }
  }
  return found;
}

export function formatNaturalList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function extractKeyContentWords(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !STOP_WORDS.has(w));
  return Array.from(new Set(tokens)).slice(0, 3);
}

function extractActiveSubjectFromHistory(
  priorUserTexts: string[],
  lastBuddyMessage: string | null,
  currentUserText: string = ''
): string | null {
  // Check if user explicitly named the intended topic in an off-topic reminder ("We were discussing my project")
  const explicitRecall = currentUserText.match(
    /\b(?:we\s+were\s+(?:discussing|talking\s+about|chatting\s+about)|back\s+to\s+(?:discussing|talking\s+about)?)\s+(?:my\s+|our\s+|the\s+)?([a-z0-9\s-]{2,30}?)(?:[.!?,]|$)/i
  );
  if (explicitRecall && explicitRecall[1].trim()) {
    const cleanRecalled = explicitRecall[1].trim().replace(/^(?:my|our|the)\s+/i, '');
    return `your ${cleanRecalled}`;
  }

  for (let i = priorUserTexts.length - 1; i >= 0; i--) {
    const t = priorUserTexts[i];
    const lower = t.toLowerCase();
    if (/\b(discuss\s+something\s+else|change\s+the\s+topic|talk\s+about\s+something\s+else|new\s+topic)\b/.test(lower)) {
      return null;
    }
    if (
      /\b(off[\s-]?topic|what\s+(?:do\s+)?you\s+mean|say\s+that\s+again|tell\s+me\s+more\s+about\s+it|don't\s+agree)\b/.test(
        lower
      )
    ) {
      continue;
    }

    const uniExpMatch = t.match(/\b(?:my\s+)?(university\s+(?:experience|life|studies|days)|college\s+(?:experience|life))\b/i);
    if (uniExpMatch) return `your ${uniExpMatch[1].toLowerCase()}`;

    const aiToolMatch = t.match(/\b(?:an?\s+|my\s+)?(AI\s+(?:application|tool|app|model|assistant|chatbot|project|system|platform))\b/i);
    if (aiToolMatch) return `your ${aiToolMatch[1]}`;

    const projectMatch = t.match(
      /\b(?:an?\s+|my\s+)?((?:react|typescript|software|web|mobile|coding|university|ielts)\s+(?:project|app|application|website|tool|platform|assignment)|project)\b/i
    );
    if (projectMatch) return `your ${projectMatch[1]}`;

    const genericBuildMatch = t.match(
      /\b(?:developed|built|building|created|working\s+on|making)\s+(?:an?\s+|my\s+)?([a-z0-9\s]{3,28}?)(?:[.!?,]|$|\s+(?:for|to|with|in|that))/i
    );
    if (genericBuildMatch && genericBuildMatch[1].trim().length >= 3) {
      return `your ${genericBuildMatch[1].trim()}`;
    }

    const tripMatch = t.match(/\b(?:trip|vacation|holiday|travel)\s+to\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/);
    if (tripMatch) return `your trip to ${tripMatch[1]}`;

    if (/\b(gym|workout|leg\s+press|exercise|fitness)\b/i.test(lower)) return 'your workout routine';

    const ings = extractMatchingTerms(t, INGREDIENT_TERMS);
    if (ings.length > 0) return `cooking with ${formatNaturalList(ings.slice(0, 2))}`;

    if (/\b(cook|cooking|recipe)\b/i.test(lower)) return 'what you are cooking';
    if (/\b(movies?|films?|series|netflix)\b/i.test(lower)) return 'the movie or show you watched';
    if (/\b(university|lecture|exam|class|assignment)\b/i.test(lower)) return 'your university classes';
    if (/\b(shop|shopping|clothes|shoes)\b/i.test(lower)) return 'your shopping trip';
    if (/\b(my\s+career|my\s+carrier|career\s+path|carrier\s+path|my\s+job|software\s+engineer|developer)\b/i.test(lower)) {
      return 'your career';
    }
    if (/\b(my\s+family|my\s+parents|my\s+brother|my\s+sister)\b/i.test(lower)) return 'your family';
    if (/\b(my\s+hobbies|my\s+hobby)\b/i.test(lower)) return 'your hobbies';
  }

  if (lastBuddyMessage) {
    const lb = lastBuddyMessage.toLowerCase();
    if (/\b(ai|artificial intelligence|software|project|coding|react|application)\b/.test(lb)) {
      return 'your project';
    }
    if (/\b(career|job|role|work)\b/.test(lb)) {
      return 'your career';
    }
    if (/\b(gym|workout|exercise)\b/.test(lb)) {
      return 'your workout';
    }
    if (/\b(travel|trip|destination)\b/.test(lb)) {
      return 'travel plans';
    }
  }

  return null;
}

function extractActivePlaceFromHistory(texts: string[]): string | null {
  for (let i = texts.length - 1; i >= 0; i--) {
    const m = texts[i].match(
      /\b(?:to|at|in|visited|visit)\s+(?:the\s+)?(gym|mall|park|beach|cinema|library|airport|hospital|office|market|cafe|restaurant|Colombo|Kandy|Galle)\b/i
    );
    if (m && m[1]) {
      const p = m[1];
      return /^[A-Z]/.test(p) ? p : `the ${p.toLowerCase()}`;
    }
  }
  return null;
}

/**
 * Extracts structured conversational memory from strictly PRIOR turns + current user text.
 * Audit Invariant B: Deduplicates currentUserText if it was already appended to history.
 */
export function extractSessionContext(
  history: BuddyMessage[],
  currentUserText: string = ''
): BuddySessionContext {
  let priorHistory = history;
  if (
    currentUserText.trim() &&
    history.length > 0 &&
    history[history.length - 1].role === 'user' &&
    history[history.length - 1].text.trim().toLowerCase() === currentUserText.trim().toLowerCase()
  ) {
    priorHistory = history.slice(0, -1);
  }

  const buddyMsgs = priorHistory.filter(m => m.role === 'buddy');
  const userMsgs = priorHistory.filter(m => m.role === 'user');
  const lastBuddyMessage = buddyMsgs.length > 0 ? buddyMsgs[buddyMsgs.length - 1].text : null;
  const lastBuddyQuestion = lastBuddyMessage
    ? (lastBuddyMessage
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .reverse()
        .find(s => s.endsWith('?')) || null)
    : null;
  const recentUserTexts = userMsgs.slice(-6).map(m => m.text);
  const recentBuddyTexts = buddyMsgs.slice(-6).map(m => m.text.toLowerCase());
  const activeSubject = extractActiveSubjectFromHistory(
    recentUserTexts,
    lastBuddyMessage,
    currentUserText
  );
  const activePlace = extractActivePlaceFromHistory([...recentUserTexts, currentUserText]);

  const combinedRecentUser = [...recentUserTexts, currentUserText].join(' ');
  const currentLower = currentUserText.toLowerCase();
  const combinedLower = combinedRecentUser.toLowerCase();

  const currentIngredients = extractMatchingTerms(currentUserText, INGREDIENT_TERMS);
  const sessionIngredients = extractMatchingTerms(combinedRecentUser, INGREDIENT_TERMS);
  const mentionedDishes = extractMatchingTerms(combinedRecentUser, DISH_TERMS);

  const activeClauseLower = currentLower.replace(
    /\b(?:forget|never\s+mind|skip|enough\s+(?:about|of)|instead\s+of|not\s+talking\s+about|leave)\s+[a-z]+\b/gi,
    ' '
  );
  const hasCookingVerbNow = /\b(cook|cooking|cooked|fry|frying|boil|boiling|bake|baking|chop|chopping|heat|heating|simmer|stir|recipe|ingredients|kitchen|pan|pot)\b/i.test(
    activeClauseLower
  );
  const hasExplicitNewTopicNow = /\b(travel|trip|flight|airport|hotel|beach|kandy|galle|colombo|movie|film|netflix|university|lecture|exam|software|coding|react|ai\s+tool|feature|shop|shopping|clothes|shoes|mall|terrible\s+day|bad\s+day)\b/i.test(
    activeClauseLower
  );
  const hasCookingVerbSession = /\b(cook|cooking|cooked|fry|frying|boil|boiling|bake|baking|recipe|ingredients|kitchen|pan|pot)\b/i.test(
    combinedLower
  );
  const userIsCooking =
    hasCookingVerbNow ||
    currentIngredients.length > 0 ||
    (!hasExplicitNewTopicNow &&
      hasCookingVerbSession &&
      (sessionIngredients.length > 0 || /\b(put|add|heat|mix|eat|food|meal|dish)\b/i.test(activeClauseLower)));

  let activeTopic: BuddySessionTopic = 'general';
  if (userIsCooking) {
    activeTopic = 'cooking_process';
  } else if (
    /\b(school|class|classes|university|lecture|college|work|office)\b.*\b(not\s+tomorrow|no\s+tomorrow|cancel|cancelled|closed|holiday|off)\b|\b(maybe\s+will|might\s+not\s+be|no)\s+(school|class|classes|university|lecture)\b/i.test(
      activeClauseLower
    )
  ) {
    activeTopic = 'school_cancellation';
  } else if (
    /\b(done\s+nothing|did\s+nothing|nothing\s+(?:much|really|special|happened|new|interesting)|boring\s+day|quiet\s+day|just\s+(?:stayed\s+home|chilled|relaxed|slept))\b/i.test(
      activeClauseLower
    )
  ) {
    activeTopic = 'quiet_day';
  } else if (
    /\b(gym|workout|working\s+out|leg\s+press|bench\s+press|squats|cardio|treadmill|weights|lifting|exercise|fitness)\b/i.test(
      activeClauseLower
    )
  ) {
    activeTopic = 'fitness_gym';
  } else if (
    /\b(software\s+engineer|engineer|developer|programmer|designer|doctor|nurse|teacher|lawyer|accountant|architect|consultant|my\s+job|my\s+career|my\s+carrier|talk\s+about\s+career|promotion|interview|colleagues|client)\b/i.test(
      activeClauseLower
    )
  ) {
    activeTopic = 'career_work';
  } else if (/\b(shop|shopping|bought|buyed|clothes|dress|shoes|mall|shirt)\b/i.test(activeClauseLower)) {
    activeTopic = 'shopping';
  } else if (/\b(university|lecture|college|exam|class|study|studying|assignment|subject|professor|coding|programming|software|react|typescript|ai\s+tool|ai\s+application|artificial\s+intelligence|ai|app|application|website|developed|feature)\b/i.test(activeClauseLower)) {
    activeTopic = 'university';
  } else if (/\b(tired|exhausted|busy|stress|stressed|overwhelmed|lots of work|lot of work|deadline|hectic)\b/i.test(activeClauseLower)) {
    activeTopic = 'work_stress';
  } else if (/\b(travel|trip|colombo|kandy|galle|beach|country|abroad|vacation|holiday|flight)\b/i.test(activeClauseLower)) {
    activeTopic = 'travel';
  } else if (/\b(movies?|films?|series|netflix|music|songs?|books?|games?|gaming|cricket|football)\b/i.test(activeClauseLower)) {
    activeTopic = 'entertainment';
  } else if (/\b(friend|friends|family|parents|brother|sister|party|hang out)\b/i.test(activeClauseLower)) {
    activeTopic = 'social';
  } else if (/\b(restaurant|cafe|takeaway|ordered|delivery|ate out|dinner|lunch|breakfast|food|coffee|tea)\b/i.test(activeClauseLower)) {
    activeTopic = hasCookingVerbSession ? 'cooking_process' : 'food_dining';
  }

  return {
    activeTopic,
    activeSubject,
    activePlace,
    lastBuddyMessage,
    lastBuddyQuestion,
    recentUserTexts,
    recentBuddyTexts,
    currentIngredients,
    sessionIngredients,
    mentionedDishes,
    userIsCooking
  };
}

/**
 * Audit Fix #1 — Accurate Self-Aware Re-Explanation of Buddy's Exact Previous Message.
 * NEVER triggers unrelated hardcoded guesses (like "school cancelled tomorrow" just because the word "class" appeared!).
 * Handles BOTH specific term queries ("What you mean by concept in class?") AND general ("What do you mean?").
 */
/**
 * Conversational Idiom & Expression Glossary + Phonetic Near-Miss Matcher
 * Enables Lingo Buddy to explain expressions it just used (e.g. "low-key", even if STT heard "Locky"!).
 */
const CONVERSATIONAL_WORD_GLOSSARY: Record<
  string,
  { canonical: string; definition: string; followUp: string }
> = {
  'low-key': {
    canonical: 'low-key',
    definition: '"Low-key" means relaxed, quiet, or without much fuss or excitement.',
    followUp: 'Have you had a low-key day yourself?'
  },
  lowkey: {
    canonical: 'low-key',
    definition: '"Low-key" means relaxed, quiet, or without much fuss or excitement.',
    followUp: 'Have you had a low-key day yourself?'
  },
  unwind: {
    canonical: 'unwind',
    definition: '"Unwind" means to relax and let go of stress after work or a busy day.',
    followUp: 'What do you usually do to unwind in the evening?'
  },
  'hands-on': {
    canonical: 'hands-on',
    definition: '"Hands-on" means learning by actually building or doing things practically rather than just reading theory.',
    followUp: 'Do you prefer hands-on projects or classroom theory?'
  },
  'catch up': {
    canonical: 'catch up',
    definition: '"Catch up" means talking with friends you haven\'t seen in a while to share life updates.',
    followUp: 'Did you catch up with any friends recently?'
  },
  overwhelmed: {
    canonical: 'overwhelmed',
    definition: '"Overwhelmed" means feeling like you have too many tasks or emotions to handle at once.',
    followUp: 'Have things felt calmer for you lately?'
  },
  spontaneous: {
    canonical: 'spontaneous',
    definition: '"Spontaneous" means doing something suddenly on impulse without planning it ahead of time.',
    followUp: 'Do you like spontaneous trips, or do you prefer planning ahead?'
  },
  getaway: {
    canonical: 'getaway',
    definition: 'A "getaway" is a short relaxing holiday or weekend trip away from your routine.',
    followUp: 'Where would you go for a quick weekend getaway?'
  },
  cliffhanger: {
    canonical: 'cliffhanger',
    definition: 'A "cliffhanger" is a dramatic, unfinished ending in a story or show that leaves you eager to know what happens next.',
    followUp: 'Have you watched any shows with crazy cliffhangers lately?'
  },
  cliffhangers: {
    canonical: 'cliffhangers',
    definition: '"Cliffhangers" are dramatic endings in shows or stories that leave you in suspense waiting for the next part.',
    followUp: 'Do you enjoy shows with cliffhangers, or do they drive you crazy?'
  },
  refreshing: {
    canonical: 'refreshing',
    definition: '"Refreshing" means something that makes you feel energized, fresh, and mentally reset.',
    followUp: 'What kind of activity feels most refreshing to you?'
  },
  hectic: {
    canonical: 'hectic',
    definition: '"Hectic" means very busy, fast-paced, and full of activity.',
    followUp: 'Has your week been hectic or fairly calm?'
  },
  highlight: {
    canonical: 'highlight',
    definition: 'A "highlight" is the best, happiest, or most memorable part of your day or week.',
    followUp: 'What was the highlight of your week so far?'
  }
};

function editDistanceAlpha(a: string, b: string): number {
  const s1 = a.toLowerCase().replace(/[^a-z]/g, '');
  const s2 = b.toLowerCase().replace(/[^a-z]/g, '');
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const dp: number[][] = Array.from({ length: s1.length + 1 }, () =>
    Array(s2.length + 1).fill(0)
  );
  for (let i = 0; i <= s1.length; i++) dp[i][0] = i;
  for (let j = 0; j <= s2.length; j++) dp[0][j] = j;

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[s1.length][s2.length];
}

export function resolveAskedWordAgainstContext(
  askedRaw: string,
  lastBuddyMessage: string | null,
  recentBuddyTexts: string[] = []
): {
  askedClean: string;
  matchedTerm: string;
  isPhoneticNearMiss: boolean;
  explanationReply: string;
} {
  const askedClean = askedRaw
    .trim()
    .replace(/^["'“”]+|["'“”?.!,]+$/g, '')
    .trim();
  const askedLower = askedClean.toLowerCase();
  const askedAlpha = askedLower.replace(/[^a-z]/g, '');

  // 1. Direct glossary lookup
  if (CONVERSATIONAL_WORD_GLOSSARY[askedLower] || CONVERSATIONAL_WORD_GLOSSARY[askedAlpha]) {
    const entry =
      CONVERSATIONAL_WORD_GLOSSARY[askedLower] || CONVERSATIONAL_WORD_GLOSSARY[askedAlpha];
    return {
      askedClean,
      matchedTerm: entry.canonical,
      isPhoneticNearMiss: false,
      explanationReply: `${entry.definition} ${entry.followUp}`
    };
  }

  // 2. Check words/hyphenated expressions inside Lingo Buddy's immediately preceding message(s) for phonetic near-misses (e.g. "Locky" -> "low-key")
  const buddyCorpus = [lastBuddyMessage || '', ...recentBuddyTexts.slice(-2)].join(' ');
  const candidateTokens = Array.from(
    new Set(
      (buddyCorpus.match(/[a-zA-Z]+(?:-[a-zA-Z]+)?/g) || []).filter(t => t.length >= 4)
    )
  );

  let bestCandidate: string | null = null;
  let bestDist = 99;
  for (const cand of candidateTokens) {
    const candAlpha = cand.toLowerCase().replace(/[^a-z]/g, '');
    if (candAlpha.length < 4 || askedAlpha.length < 4) continue;
    if (candAlpha[0] !== askedAlpha[0]) continue;
    const dist = editDistanceAlpha(askedAlpha, candAlpha);
    if (dist > 0 && dist <= 2 && dist < bestDist) {
      bestDist = dist;
      bestCandidate = cand;
    }
  }

  if (bestCandidate) {
    const candKey = bestCandidate.toLowerCase();
    const candAlpha = candKey.replace(/[^a-z]/g, '');
    const gloss = CONVERSATIONAL_WORD_GLOSSARY[candKey] || CONVERSATIONAL_WORD_GLOSSARY[candAlpha];
    if (gloss) {
      return {
        askedClean,
        matchedTerm: gloss.canonical,
        isPhoneticNearMiss: true,
        explanationReply: `Did you mean "${gloss.canonical}" from what I just said? ${gloss.definition} ${gloss.followUp}`
      };
    }
    return {
      askedClean,
      matchedTerm: bestCandidate,
      isPhoneticNearMiss: true,
      explanationReply: `Did you mean "${bestCandidate}" from my previous message? In simple words, I used "${bestCandidate}" to talk about what we were just discussing — want me to give another example?`
    };
  }

  if (/\bconcept/.test(askedLower) && /\bclass\b/.test(askedLower)) {
    return {
      askedClean,
      matchedTerm: askedClean,
      isPhoneticNearMiss: false,
      explanationReply: `By "${askedClean}", I meant learning the theory your lecturer teaches in university — compared to building a practical project yourself. Which one are you focusing on more right now?`
    };
  }
  if (/\bconcept/.test(askedLower)) {
    return {
      askedClean,
      matchedTerm: askedClean,
      isPhoneticNearMiss: false,
      explanationReply: `By "${askedClean}", I just meant the main theory or core ideas behind a topic before putting them into practice. Does that make sense?`
    };
  }

  return {
    askedClean,
    matchedTerm: askedClean,
    isPhoneticNearMiss: false,
    explanationReply: `Good question! "${askedClean}" basically refers to that idea in everyday English — want me to put it in a simple example sentence?`
  };
}

export function reExplainLastBuddyQuestion(
  lastBuddyMessage: string | null,
  askedTerm?: string | null,
  recentBuddyTexts: string[] = []
): string {
  if (askedTerm && askedTerm.trim().length >= 2) {
    return resolveAskedWordAgainstContext(askedTerm, lastBuddyMessage, recentBuddyTexts)
      .explanationReply;
  }

  if (!lastBuddyMessage) {
    return "Oh, let me explain! I was just asking how your day has been going and what you'd like to talk about.";
  }

  const lower = lastBuddyMessage.toLowerCase();

  if (/\bdid you understand what i meant\b/.test(lower)) {
    const earlier = recentBuddyTexts.length >= 2 ? recentBuddyTexts[recentBuddyTexts.length - 2] : null;
    if (earlier) {
      return `Oh, let me explain it differently! Earlier I was asking: "${earlier}" — basically, I just wanted to hear your thoughts in simple words.`;
    }
    return 'Oh, let me explain it differently! I just wanted to check if my question made sense — feel free to tell me about your day in your own words.';
  }
  if (/\bdid you enjoy your day\b/.test(lower)) {
    return 'Sorry! I was asking whether you enjoyed your day — did you have a nice time today?';
  }
  if (/\b(cancel|cancelled|off\s+tomorrow|no\s+school|day\s+off|holiday)\b/.test(lower)) {
    return 'Sorry! I was just asking why you think school or classes might be cancelled tomorrow — is it a holiday or something else?';
  }
  if (/\b(concepts\s+in\s+class|building\s+a\s+project|hands-on\s+project)\b/.test(lower)) {
    return "Sorry about that! I was asking whether you're building a practical coding project right now, or mostly studying theory in your university classes.";
  }
  if (/\b(highlight|week|interesting happen|talk about today|on your mind)\b/.test(lower)) {
    return 'Sorry! I was just asking if anything fun happened today, or if it has been a normal, relaxed day.';
  }
  if (/\b(quiet day|relax at home|lazy day|planning to do|low-key)\b/.test(lower)) {
    return 'Sorry! I was just asking whether you enjoyed relaxing at home today.';
  }
  if (/\b(cook|dish|ingredient|recipe|meal|ginger|oil)\b/.test(lower)) {
    return 'Sorry! I was just asking what dish you are cooking and what ingredients you put in it.';
  }
  if (/\b(shop|shopping|clothes|mall)\b/.test(lower)) {
    return 'Sorry! I was just asking what you bought when you went shopping.';
  }
  if (/\b(travel|trip|weekend|visit)\b/.test(lower)) {
    return "Sorry! I was just asking if there's a place you'd like to visit for a short trip.";
  }

  const sentences = lastBuddyMessage
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  const questionSentence =
    [...sentences].reverse().find(s => s.endsWith('?')) || sentences[sentences.length - 1];

  // Paraphrase simple "Did you..." / "What did you..." / "Do you..." questions directly in simpler English + short example (NEVER repeat exact sentence!)
  const didYouMatch = questionSentence.match(/^did\s+you\s+(.+?)\?$/i);
  if (didYouMatch) {
    return `Sorry! I was asking whether you ${didYouMatch[1].trim()}.`;
  }
  const doYouMatch = questionSentence.match(/^do\s+you\s+(.+?)\?$/i);
  if (doYouMatch) {
    return `Let me say that more simply — I wanted to know if you ${doYouMatch[1].trim()}.`;
  }
  const whatKindMatch = questionSentence.match(/^what\s+(?:kind|type|sort)\s+of\s+([a-z\s]+?)\s+do\s+you\s+(.+?)\?$/i);
  if (whatKindMatch) {
    return `Sorry! In simple words, I was asking which ${whatKindMatch[1].trim()} you like most — for example, your favourite style or type.`;
  }

  // General simple-English paraphrase (never parrot the exact same sentence word-for-word!)
  const keyWords = extractKeyContentWords(questionSentence);
  if (keyWords.length > 0) {
    return `Let me put that in simpler words! I was asking about ${keyWords[0]} and what your experience with it is — for example, what you like or do with it.`;
  }
  return 'Let me explain that more simply! I just wanted to hear your thoughts about what we were talking about — for example, what you enjoy or think about it.';
}

/**
 * Context-Aware 12-Category Intent Classifier (Section 4).
 * Evaluates user transcript IN CONTEXT of `ctx.lastBuddyMessage`, `ctx.lastBuddyQuestion`, and `coherence`.
 */
export function classifyBuddyIntent(
  userText: string,
  ctx: BuddySessionContext,
  coherence: TranscriptCoherenceResult
): {
  intent: BuddyTurnIntent;
  conversationalIntent: BuddyConversationalIntent;
  extractedTerm?: string;
} {
  const clean = userText.trim();
  const lower = clean.toLowerCase();

  // 1. UNCLEAR_SPEECH (e.g. "I rain got you", "Must will be cappuccino potato mango")
  if (coherence.quality === 'unclear') {
    return { intent: 'unclear_speech', conversationalIntent: 'UNCLEAR_SPEECH' };
  }

  // 2. INCOMPLETE_SENTENCE (e.g. "Much into. Nothing much.", dangling cutoff)
  if (coherence.incompleteFragment) {
    return {
      intent: 'incomplete_sentence',
      conversationalIntent: 'INCOMPLETE_SENTENCE',
      extractedTerm: coherence.incompleteFragment
    };
  }

  // 3. Repeat request
  if (
    /\b(can\s+you\s+say\s+that\s+again|say\s+that\s+again|repeat\s+(?:that|what\s+you\s+said|your\s+last\s+message)|didn't\s+hear\s+(?:that|you))\b/i.test(
      lower
    )
  ) {
    return { intent: 'repeat_last_buddy', conversationalIntent: 'ASKING_FOR_CLARIFICATION' };
  }

  // 4. Explain earlier grammar correction
  if (
    /\b(explain|why\s+was|what\s+was|tell\s+me\s+about)\b.*\b(mistake|error|correction|wrong|corrected|grammar)\b|\bwhy\s+did\s+you\s+correct\b/i.test(
      lower
    )
  ) {
    return { intent: 'explain_earlier_mistake', conversationalIntent: 'ASKING_QUESTION' };
  }

  // 5. CORRECTING_AI — Off-topic reminder ("You're going off-topic. We were talking about my project.")
  if (
    /\b(off[\s-]?topic|going\s+off[\s-]?topic|stay\s+on\s+topic|back\s+to\s+(?:the\s+|our\s+)?topic)\b/i.test(
      lower
    )
  ) {
    return { intent: 'topic_correction', conversationalIntent: 'CORRECTING_AI' };
  }

  // 6. CORRECTING_AI — Fixing AI's misunderstanding ("No, that's not what I meant", "You misunderstood me")
  if (
    /\b(that'?s\s+not\s+what\s+i\s+(?:meant|said|was\s+talking\s+about)|not\s+what\s+i\s+meant|you\s+misunderstood(?:\s+me)?|you\s+got\s+(?:it|me)\s+wrong|no,?\s+i\s+meant\b)/i.test(
      lower
    )
  ) {
    return { intent: 'correcting_ai', conversationalIntent: 'CORRECTING_AI' };
  }

  // 7A. CHANGING_TOPIC — Generic switch ("Let's talk about something else.")
  if (
    /\b(let'?s\s+(?:discuss|talk\s+about)\s+something\s+else|change\s+(?:the\s+)?topic|talk\s+about\s+something\s+else|switch\s+(?:the\s+)?topic|different\s+topic)\b/i.test(
      lower
    )
  ) {
    return { intent: 'topic_change', conversationalIntent: 'CHANGING_TOPIC' };
  }

  // 7B. Context-Aware STT Homophone Guard ("recording shops" / "move to the recording part" -> "coding")
  if (
    /\b(recording\s+shops?|move\s+to\s+(?:the\s+)?recording(?:\s+part|\s+section)?|talk\s+about\s+recording\s+shops?)\b/i.test(
      lower
    )
  ) {
    return {
      intent: 'topic_change',
      conversationalIntent: 'CHANGING_TOPIC',
      extractedTerm: '__stt_coding_disambig__'
    };
  }

  // 7C. CHANGING_TOPIC — Directed topic switch ("Let's move to the coding part.", "Let's talk about travel.")
  const directedTopicMatch = clean.match(
    /\b(?:let'?s\s+(?:move\s+(?:on\s+)?to|talk\s+about|discuss|switch\s+to)|can\s+we\s+(?:talk\s+about|move\s+to|discuss))\s+(?:the\s+)?([a-zA-Z0-9\s-]{2,34}?)(?:\s+(?:part|topic|section|side))?[.!?,]*$/i
  );
  if (directedTopicMatch && directedTopicMatch[1].trim()) {
    const requestedTopic = directedTopicMatch[1].trim();
    if (!/^(?:something\s+else|another\s+topic|it|that|this)$/i.test(requestedTopic)) {
      return {
        intent: 'topic_change',
        conversationalIntent: 'CHANGING_TOPIC',
        extractedTerm: requestedTopic
      };
    }
  }

  // 8. ASKING_WORD_MEANING ("What is the meaning of low-key?", "What does X mean?", "What you mean by X?")
  const meaningOfMatch =
    clean.match(/\b(?:what\s+(?:is|was)?\s*the\s+meaning\s+of|what'?s\s+the\s+meaning\s+of|meaning\s+of|define)\s+["']?([^?.!,"']+)["']?/i) ||
    clean.match(/\bwhat\s+(?:does|do|is)\s+["']?([a-zA-Z0-9-]+(?:\s+[a-zA-Z0-9-]+)?)["']?\s+mean\b/i) ||
    clean.match(/\bmean\s+by\s+["']?([^?.!,"']+)["']?/i);
  if (meaningOfMatch && meaningOfMatch[1].trim().length >= 2) {
    const term = meaningOfMatch[1].trim();
    return {
      intent: 'ask_word_meaning',
      conversationalIntent: 'ASKING_WORD_MEANING',
      extractedTerm: term
    };
  }

  // 9. ASKING_FOR_CLARIFICATION ("I didn't understand", "What do you mean?", "Can you explain?", "No, I didn't got you")
  if (
    /\b(didn'?t\s+(?:get|got|understand|understood|catch|caught)\s+you|didn'?t\s+(?:get|understand|catch)|don'?t\s+(?:get|understand)|not\s+sure\s+what\s+you|what\s+(?:are|were|do|did)?\s*you\s+(?:asking|saying|mean|meant)|(?:can|could)\s+you\s+explain(?:\s+(?:that|it|again|more\s+simply))?|please\s+explain|i'?m\s+confused|pardon\??|sorry\s+what)\b/i.test(
      lower
    )
  ) {
    return {
      intent: 'clarify_last_question',
      conversationalIntent: 'ASKING_FOR_CLARIFICATION'
    };
  }

  // 10. DISAGREEING
  if (
    /\b(i\s+don'?t\s+agree|i\s+disagree|not\s+really\s+agree|i\s+don'?t\s+think\s+so|i\s+see\s+it\s+differently|that'?s\s+not\s+(?:true|right))\b/i.test(
      lower
    )
  ) {
    return { intent: 'user_disagreement', conversationalIntent: 'DISAGREEING' };
  }

  // 11. EXPRESSING_EMOTION
  if (
    /\b(terrible\s+day|awful\s+day|horrible\s+day|bad\s+day|worst\s+day|rough\s+day|feeling\s+(?:down|sad|upset|depressed|anxious|stressed|hopeless|lost)|everything\s+went\s+wrong|really\s+upset|really\s+frustrated|don'?t\s+think\s+anything\s+(?:is\s+)?possible|nothing\s+(?:is\s+)?possible\s+in\s+my\s+life|can'?t\s+do\s+anything)\b/i.test(
      lower
    )
  ) {
    return { intent: 'empathy_negative_day', conversationalIntent: 'EXPRESSING_EMOTION' };
  }

  if (
    /\b(tell\s+me\s+more\s+about\s+it|more\s+about\s+it|how\s+does\s+it\s+work|what\s+do\s+you\s+think\s+about\s+it|why\s+is\s+it\s+important)\b/i.test(
      lower
    )
  ) {
    return { intent: 'context_retention', conversationalIntent: 'ASKING_QUESTION' };
  }

  if (
    /\b(added\s+(?:a\s+|another\s+|new\s+)?feature|another\s+feature|new\s+feature|fixed\s+a\s+bug|added\s+another\s+module|improved\s+the\s+ui|deployed\s+it|tested\s+it)\b/i.test(
      lower
    )
  ) {
    return { intent: 'project_continuation', conversationalIntent: 'SHARING_INFORMATION' };
  }

  const isDirectQuestion = /\?$/.test(clean);
  const answeredPrevQ = Boolean(ctx.lastBuddyQuestion) && !isDirectQuestion;

  if (ctx.activeTopic === 'quiet_day') {
    return {
      intent: 'quiet_day',
      conversationalIntent: answeredPrevQ ? 'ANSWER_TO_PREVIOUS_QUESTION' : 'SHARING_INFORMATION'
    };
  }
  if (ctx.activeTopic === 'school_cancellation') {
    return {
      intent: 'school_cancellation',
      conversationalIntent: answeredPrevQ ? 'ANSWER_TO_PREVIOUS_QUESTION' : 'SHARING_INFORMATION'
    };
  }
  if (ctx.activeTopic === 'cooking_process') {
    return {
      intent: 'cooking_process',
      conversationalIntent: answeredPrevQ ? 'ANSWER_TO_PREVIOUS_QUESTION' : 'SHARING_INFORMATION'
    };
  }
  if (ctx.activeTopic !== 'general') {
    return {
      intent: 'topic_chat',
      conversationalIntent: isDirectQuestion
        ? 'ASKING_QUESTION'
        : answeredPrevQ
        ? 'ANSWER_TO_PREVIOUS_QUESTION'
        : 'SHARING_INFORMATION'
    };
  }

  if (
    /^(hi|hello|hey|good morning|good evening|good afternoon|yo|sup|yes|yeah|yep|yup|no|nope|nah|okay|ok|sure|maybe|nothing)[!.,\s]*$/i.test(
      lower
    )
  ) {
    return { intent: 'greeting_or_ack', conversationalIntent: 'GENERAL_CONVERSATION' };
  }

  return {
    intent: 'grounded_general',
    conversationalIntent: isDirectQuestion
      ? 'ASKING_QUESTION'
      : answeredPrevQ
      ? 'ANSWER_TO_PREVIOUS_QUESTION'
      : 'GENERAL_CONVERSATION'
  };
}
