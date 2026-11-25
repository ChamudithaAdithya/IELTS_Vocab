/**
 * AI Speaking Buddy (Lingo Buddy) — Phase 1 Conversation & Transcription Engine
 * Layer 1: Conversation Intelligence (listening, understanding, responding like a friend)
 * Phase 1 P0.1 & P0.2 implementation with dual Gemini Cloud + Rich Local Friend fallback.
 */

import type {
  BuddyMemoryItem,
  BuddyMessage,
  BuddyMode,
  BuddyModeConfig,
  BuddyPersonality,
  BuddyPersonalityConfig,
  BuddySession,
  BuddyTurnIntent,
  GrammarCategoryCode,
  TranscriptCoherenceResult
} from '../types/speakingBuddy';
import { validateTranscriptCoherence } from './buddyGrammarEngine';

export const BUDDY_PERSONALITIES: BuddyPersonalityConfig[] = [
  {
    id: 'friendly',
    label: 'Friendly',
    emoji: '😊',
    tagline: 'Casual, warm, and supportive',
    speechRate: 0.96,
    systemTone: 'casual, warm, supportive, like a close everyday friend over coffee',
    greeting: "Hey! What would you like to talk about today? Did anything interesting happen?"
  },
  {
    id: 'curious',
    label: 'Curious',
    emoji: '🧐',
    tagline: 'Asks thoughtful follow-up questions',
    speechRate: 0.97,
    systemTone: 'genuinely curious and engaged, asking interesting follow-up questions about details and reasons',
    greeting: "Hey there! Tell me something interesting on your mind today — I'd love to hear your story!"
  },
  {
    id: 'funny',
    label: 'Funny',
    emoji: '😄',
    tagline: 'Light, playful humour',
    speechRate: 1.0,
    systemTone: 'lighthearted and playfully witty without overdoing jokes or being sarcastic',
    greeting: "Hey friend! Surviving the day so far, or did something wildly entertaining happen?"
  },
  {
    id: 'intellectual',
    label: 'Intellectual',
    emoji: '💡',
    tagline: 'Tech, science, and deeper ideas',
    speechRate: 0.94,
    systemTone: 'thoughtful and articulate, enjoying discussions about technology, society, books, and big ideas',
    greeting: "Hey! Been thinking about any fascinating ideas, tech trends, or topics lately?"
  },
  {
    id: 'calm',
    label: 'Calm',
    emoji: '🌿',
    tagline: 'Speaks slowly and patiently',
    speechRate: 0.86,
    systemTone: 'calm, gentle, unhurried, and reassuring — giving the speaker plenty of space to express themselves',
    greeting: "Hi there. Take your time — there's no rush at all. How has your day been going?"
  },
  {
    id: 'motivational',
    label: 'Motivational',
    emoji: '🚀',
    tagline: 'Encourages you to keep speaking',
    speechRate: 0.98,
    systemTone: 'upbeat, genuinely encouraging without hollow fake praise, inspiring the user to elaborate on their ideas',
    greeting: "Hey! Great to hear from you today. What's something you're excited about or working on right now?"
  }
];

export const BUDDY_MODES: BuddyModeConfig[] = [
  {
    id: 'friendly',
    label: 'Friendly Conversation',
    badge: 'Default',
    description: 'Just chat naturally about daily life, hobbies, movies, university, tech, or travel.'
  },
  {
    id: 'speak_and_correct',
    label: 'Speak & Correct',
    description: 'Natural chat paired with active grammar, structure, and phrasing feedback.'
  },
  {
    id: 'fluency',
    label: 'Improve Fluency',
    description: 'Focus on smooth flow, fewer pauses, and expanding ideas clearly.'
  },
  {
    id: 'ielts_partner',
    label: 'IELTS Partner',
    description: 'Organic Part 1, 2 & 3 style conversation with natural examiner-style follow-ups.'
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary Builder',
    description: 'Spot repetitive basic words and weave natural expressions into chat.'
  }
];

export interface BuddyTopicStarter {
  id: string;
  label: string;
  description: string;
  prompts: string[];
  prompt: string;
}

/** Phase 3 Section 5.3 — Conversation Topic Generator (4 low-pressure categories + varied prompts) */
export const BUDDY_TOPIC_STARTERS: BuddyTopicStarter[] = [
  {
    id: 'travel',
    label: 'Travel & Adventure',
    description: 'Experiences and dream destinations',
    prompt: "If you could take a spontaneous trip anywhere this weekend, where would you head?",
    prompts: [
      "If you could take a spontaneous trip anywhere this weekend, where would you head?",
      "What's the most memorable place you've ever visited, and what stood out about it?",
      "Are you more of a mountain-chill person or a beach-and-city explorer when you travel?"
    ]
  },
  {
    id: 'ideas',
    label: 'Interesting Ideas',
    description: 'Science, technology, and creativity',
    prompt: "What's a piece of technology or a new idea lately that genuinely surprised you?",
    prompts: [
      "What's a piece of technology or a new idea lately that genuinely surprised you?",
      "Do you think AI is making everyday learning easier, or making people rely on shortcuts too much?",
      "If you could invent one simple app or gadget to fix an annoying daily problem, what would it do?"
    ]
  },
  {
    id: 'uni-career',
    label: 'University & Career',
    description: 'Studies, projects, and daily challenges',
    prompt: "What are you studying or working on right now that's keeping you the busiest?",
    prompts: [
      "What are you studying or working on right now that's keeping you the busiest?",
      "What's one skill you're trying to level up this year, and how is it going so far?",
      "Tell me about a project or assignment you tackled recently — what was the trickiest part?"
    ]
  },
  {
    id: 'everyday',
    label: 'Random Everyday Chat',
    description: 'Talk about absolutely anything',
    prompt: "So, tell me how your day has really been going — busy, relaxing, or somewhere in between?",
    prompts: [
      "So, tell me how your day has really been going — busy, relaxing, or somewhere in between?",
      "What's the best meal or snack you've had this week — did you cook it or buy it?",
      "Watched any good movies, series, or videos lately that you'd actually recommend?"
    ]
  }
];

export function pickTopicStarterPrompt(topicId?: string): string {
  const topic = topicId
    ? BUDDY_TOPIC_STARTERS.find(t => t.id === topicId)
    : BUDDY_TOPIC_STARTERS[Math.floor(Math.random() * BUDDY_TOPIC_STARTERS.length)];
  const chosen = topic || BUDDY_TOPIC_STARTERS[0];
  return chosen.prompts[Math.floor(Math.random() * chosen.prompts.length)];
}

/** Targeted conversation starter for Phase 3 P1.4 — Practice a Recurring Weak Category organically */
export function getTargetedPracticePrompt(category: GrammarCategoryCode): string {
  switch (category) {
    case 'VERB_TENSE':
    case 'VERB_FORMS':
      return "Let's chat about past stories! Tell me about something fun or unexpected you did yesterday or last weekend.";
    case 'ARTICLES':
      return "Let's talk about things around you! Tell me about a favourite book, gadget, or cafe you discovered recently.";
    case 'PREPOSITIONS':
      return "Tell me about a hobby or subject you're really interested in, and what your weekends usually depend on!";
    case 'SVA':
      return "Tell me about a close friend or family member — what does a typical day look like for them?";
    case 'PLURALS':
      return "Tell me about a busy week you had recently — what kind of work, advice, or tasks kept you occupied?";
    case 'CONDITIONALS':
      return "Here's a fun one: if you get an unexpected free weekend next month, what will you do?";
    case 'WORD_ORDER':
    case 'SENTENCE_STRUCTURE':
      return "Tell me about your plans for tomorrow — is there anything you think might change or get cancelled?";
    default:
      return "Let's have a relaxed chat! Tell me something that's been on your mind this week and why it matters to you.";
  }
}

const BUDDY_SESSIONS_KEY = 'ielts_lingo_buddy_sessions_v1';
const MAX_STORED_SESSIONS = 15;

export function getPersonalityConfig(id: BuddyPersonality): BuddyPersonalityConfig {
  return BUDDY_PERSONALITIES.find(p => p.id === id) || BUDDY_PERSONALITIES[0];
}

export function loadBuddySessions(): BuddySession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BUDDY_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBuddySessions(sessions: BuddySession[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Strip transient in-memory Blob URLs before persisting to localStorage
    const serializable = sessions.slice(0, MAX_STORED_SESSIONS).map(s => ({
      ...s,
      messages: s.messages.map(({ recordedAudioUrl: _omit, ...rest }) => rest)
    }));
    localStorage.setItem(BUDDY_SESSIONS_KEY, JSON.stringify(serializable));
  } catch {}
}

export function createFreshBuddySession(
  personality: BuddyPersonality = 'friendly',
  mode: BuddyMode = 'friendly',
  customGreeting?: string
): BuddySession {
  const cfg = getPersonalityConfig(personality);
  const now = Date.now();
  return {
    id: `buddy-sess-${now}`,
    title: "Today's conversation",
    startedAt: now,
    updatedAt: now,
    personality,
    mode,
    intensity: 'gentle',
    messages: [
      {
        id: `msg-buddy-${now}`,
        role: 'buddy',
        timestamp: now,
        text: customGreeting || cfg.greeting,
        responseSource: 'local'
      }
    ]
  };
}

/**
 * Strictly NON-DESTRUCTIVE punctuation & capitalization restoration for Lingo Buddy.
 * Audit Invariant D: NEVER silently rewrites words, alters spelling, or fixes learner grammar!
 * Preserves every single spoken word intact so the Grammar Engine sees the speaker's exact English.
 */
export function processBuddyTranscript(rawSpeech: string): string {
  if (!rawSpeech || !rawSpeech.trim()) return '';
  let text = rawSpeech.trim().replace(/\s+/g, ' ');

  // Standalone pronoun "i" -> "I" and common contraction capitalization without changing words
  text = text.replace(/\bi\b/g, 'I');
  text = text.replace(/\bi'(m|ve|ll|d)\b/gi, (_, suf) => `I'${suf.toLowerCase()}`);

  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // Capitalize after existing sentence endings
  text = text.replace(/([.!?]\s+)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);

  // Add terminal punctuation ONLY if missing — never alters any words!
  if (!/[.!?]$/.test(text)) {
    // Protect declarative cleft sentences ("What I mean is...", "What happened was...", "How it works is...")
    const isDeclarativeCleft =
      /^(?:what|where|when|why|how|who)\s+(?:i|we|they|he|she|it|this|that|happened|matters)\s+(?:mean|meant|want|wanted|like|liked|need|needed|think|thought|feel|felt|said|say|did|do|was|is|happened|matters|love|hate|know|noticed)\b/i.test(
        text
      ) && !/^(?:what|where|when|why|how)\s+(?:you|we|they)\s+(?:mean|think|want|asking|doing|saying)\b/i.test(text);

    const looksLikeQuestion =
      !isDeclarativeCleft &&
      (/^(?:what|where|when|why|how|who|which|whose)\s+(?:is|are|was|were|do|does|did|can|could|will|would|should|have|has|had|about|if|else|kind|sort|type|time|you|we|they|he|she)\b/i.test(
        text
      ) ||
        /^(?:can|could|would|will|should|do|does|did|are|is|am|was|were|have|has)\s+(?:i|you|we|they|he|she|it|there|this|that)\b/i.test(
          text
        )) &&
      !/^(what a |how nice|how cool|how great)/i.test(text);
    text += looksLikeQuestion ? '?' : '.';
  }

  return text;
}

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

function formatNaturalList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function extractKeyContentWords(text: string): string[] {
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
    if (/\b(movie|film|series|netflix)\b/i.test(lower)) return 'the movie or show you watched';
    if (/\b(university|lecture|exam|class|assignment)\b/i.test(lower)) return 'your university classes';
    if (/\b(shop|shopping|clothes|shoes)\b/i.test(lower)) return 'your shopping trip';
  }

  if (lastBuddyMessage) {
    const lb = lastBuddyMessage.toLowerCase();
    if (/\b(ai|artificial intelligence|software|project|coding|react|application)\b/.test(lb)) {
      return 'your project';
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
    /\b(software\s+engineer|engineer|developer|programmer|designer|doctor|nurse|teacher|lawyer|accountant|architect|consultant|my\s+job|my\s+career|promotion|interview|colleagues|client)\b/i.test(
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
  } else if (/\b(movie|film|series|netflix|music|song|book|game|gaming|cricket|football)\b/i.test(activeClauseLower)) {
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
function reExplainLastBuddyQuestion(
  lastBuddyMessage: string | null,
  askedTerm?: string | null
): string {
  if (askedTerm && askedTerm.trim().length >= 2) {
    const cleanTerm = askedTerm.trim().replace(/[?!.]+$/, '');
    const termLower = cleanTerm.toLowerCase();

    if (/\bconcept/.test(termLower) && /\bclass\b/.test(termLower)) {
      return `Oh, good question! By "${cleanTerm}", I meant learning the theory or ideas your lecturer teaches in university — compared to building a real hands-on project yourself. Which one are you focusing on more right now?`;
    }
    if (/\bconcept/.test(termLower)) {
      return `Good question! By "${cleanTerm}", I just meant the main theory or core ideas behind a topic before putting them into practice. Does that make more sense?`;
    }
    if (/\bhighlight\b/.test(termLower)) {
      return `By "${cleanTerm}", I just meant the best or most enjoyable moment you've had recently!`;
    }
    if (/\bunwind\b/.test(termLower)) {
      return `By "${cleanTerm}", I just meant relaxing and letting go of stress after a busy day!`;
    }
    if (lastBuddyMessage) {
      return `Oh, good question! When I mentioned "${cleanTerm}", I was just asking in a simple way about ${
        /\bproject|building|studying\b/i.test(lastBuddyMessage)
          ? 'whether you are learning theory in class or building something practical yourself'
          : 'what we were just chatting about'
      }. Does that clear it up?`;
    }
    return `Good question! By "${cleanTerm}", I just meant that idea in everyday simple terms — want me to give a quick example?`;
  }

  if (!lastBuddyMessage) {
    return "Oh, sorry about that! I just meant — feel free to tell me anything about your day, like what you've been up to or what's on your mind.";
  }

  const lower = lastBuddyMessage.toLowerCase();

  // Only match school cancellation if Buddy ACTUALLY talked about cancellation / day off!
  if (/\b(cancel|cancelled|off\s+tomorrow|no\s+school|day\s+off|holiday)\b/.test(lower)) {
    return "My bad, let me say that simpler! I was just asking why you think school or classes might be cancelled tomorrow — is it a holiday or something else?";
  }
  if (/\b(concepts\s+in\s+class|building\s+a\s+project|hands-on\s+project)\b/.test(lower)) {
    return "Oh, sorry about that! I was just asking if you're currently building a real coding or tech project on your own, or mostly learning the theory in university classes.";
  }
  if (/\b(highlight|week|interesting happen|talk about today|on your mind)\b/.test(lower)) {
    return "Oh, sorry about that! I just meant — has anything fun or memorable happened to you today or this week, or has it just been an ordinary day?";
  }
  if (/\b(quiet day|relax at home|lazy day|planning to do)\b/.test(lower)) {
    return "Sorry, let me put that more simply! I was just asking if you enjoyed relaxing at home today, or if you had plans that got cancelled.";
  }
  if (/\b(cook|dish|ingredient|recipe|meal|ginger|oil)\b/.test(lower)) {
    return "Oh, sorry for being unclear! I was just asking what dish you're planning to cook and what ingredients you usually put in it.";
  }
  if (/\b(shop|shopping|clothes|mall)\b/.test(lower)) {
    return "Sorry about that! I was just asking what you ended up buying when you went shopping.";
  }
  if (/\b(travel|trip|weekend|visit)\b/.test(lower)) {
    return "Oh, sorry! I was just asking if there's a place you'd love to visit for a short getaway.";
  }

  const sentences = lastBuddyMessage
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  const questionSentence = [...sentences].reverse().find(s => s.endsWith('?')) || sentences[sentences.length - 1];

  return `Oh, sorry about that! Earlier I asked: "${questionSentence}" — basically, I was just curious to hear your thoughts on that, or we can switch to any topic you feel like talking about!`;
}

/**
 * Audit Architecture — Explicit Intent Classifier (used by both Orchestrator & Local Friend Engine)
 */
export function classifyBuddyIntent(
  userText: string,
  ctx: BuddySessionContext,
  coherence: TranscriptCoherenceResult
): { intent: BuddyTurnIntent; extractedTerm?: string } {
  const lower = userText.trim().toLowerCase();

  if (coherence.quality === 'unclear') {
    return { intent: 'unclear_speech' };
  }

  if (
    /\b(can\s+you\s+say\s+that\s+again|say\s+that\s+again|repeat\s+(?:that|what\s+you\s+said|your\s+last\s+message)|didn't\s+hear\s+(?:that|you))\b/i.test(
      lower
    )
  ) {
    return { intent: 'repeat_last_buddy' };
  }

  if (
    /\b(explain|why\s+was|what\s+was|tell\s+me\s+about)\b.*\b(mistake|error|correction|wrong|corrected|grammar)\b|\bwhy\s+did\s+you\s+correct\b/i.test(
      lower
    )
  ) {
    return { intent: 'explain_earlier_mistake' };
  }

  if (
    /\b(off[\s-]?topic|going\s+off[\s-]?topic|stay\s+on\s+topic|not\s+what\s+i\s+(?:was\s+talking|meant)|back\s+to\s+(?:the\s+|our\s+)?topic)\b/i.test(
      lower
    )
  ) {
    return { intent: 'topic_correction' };
  }

  if (
    /\b(let'?s\s+(?:discuss|talk\s+about)\s+something\s+else|change\s+(?:the\s+)?topic|talk\s+about\s+something\s+else|switch\s+(?:the\s+)?topic|different\s+topic)\b/i.test(
      lower
    )
  ) {
    return { intent: 'topic_change' };
  }

  const meanByMatch = userText.match(/\bmean\s+by\s+([^?.!]+)/i);
  if (meanByMatch && meanByMatch[1].trim().length >= 2) {
    return { intent: 'clarify_specific_term', extractedTerm: meanByMatch[1].trim() };
  }

  if (
    /\b(didn'?t\s+(?:get|understand|catch)|don'?t\s+(?:get|understand)|not\s+sure\s+what\s+you|what\s+(?:are|were|do)?\s*you\s+(?:asking|saying|mean)|what\s+do\s+you\s+mean|i'?m\s+confused|pardon\??|sorry\s+what)\b/i.test(
      lower
    )
  ) {
    return { intent: 'clarify_last_question' };
  }

  if (
    /\b(i\s+don'?t\s+agree|i\s+disagree|not\s+really\s+agree|i\s+don'?t\s+think\s+so|i\s+see\s+it\s+differently|that'?s\s+not\s+(?:true|right))\b/i.test(
      lower
    )
  ) {
    return { intent: 'user_disagreement' };
  }

  // 8. Empathy / negative emotional day or self-doubt ("I had a terrible day", "don't think anything possible in my life")
  if (
    /\b(terrible\s+day|awful\s+day|horrible\s+day|bad\s+day|worst\s+day|rough\s+day|feeling\s+(?:down|sad|upset|depressed|anxious|stressed|hopeless|lost)|everything\s+went\s+wrong|really\s+upset|really\s+frustrated|don'?t\s+think\s+anything\s+(?:is\s+)?possible|nothing\s+(?:is\s+)?possible\s+in\s+my\s+life|can'?t\s+do\s+anything)\b/i.test(
      lower
    )
  ) {
    return { intent: 'empathy_negative_day' };
  }

  if (
    /\b(tell\s+me\s+more\s+about\s+it|more\s+about\s+it|how\s+does\s+it\s+work|what\s+do\s+you\s+think\s+about\s+it|why\s+is\s+it\s+important)\b/i.test(
      lower
    )
  ) {
    return { intent: 'context_retention' };
  }

  if (
    /\b(added\s+(?:a\s+|another\s+|new\s+)?feature|another\s+feature|new\s+feature|fixed\s+a\s+bug|added\s+another\s+module|improved\s+the\s+ui|deployed\s+it|tested\s+it)\b/i.test(
      lower
    )
  ) {
    return { intent: 'project_continuation' };
  }

  if (ctx.activeTopic === 'quiet_day') return { intent: 'quiet_day' };
  if (ctx.activeTopic === 'school_cancellation') return { intent: 'school_cancellation' };
  if (ctx.activeTopic === 'cooking_process') return { intent: 'cooking_process' };
  if (ctx.activeTopic !== 'general') return { intent: 'topic_chat' };

  if (
    /^(hi|hello|hey|good morning|good evening|good afternoon|yo|sup|yes|yeah|yep|yup|no|nope|nah|okay|ok|sure|maybe|nothing)[!.,\s]*$/i.test(
      lower
    )
  ) {
    return { intent: 'greeting_or_ack' };
  }

  return { intent: 'grounded_general' };
}

/**
 * Generates a natural, grounded, context-aware friend reply offline (Local Conversation Intelligence)
 * when no Gemini API key is connected or if network call times out.
 * ZERO generic chatbot fillers — uses explicit intent classification, activeSubject memory,
 * accurate term/question clarification, off-topic recovery, empathy, and session entity continuity.
 */
export function generateLocalFriendReply(
  userText: string,
  history: BuddyMessage[],
  personality: BuddyPersonality,
  mode: BuddyMode,
  providedCoherence?: TranscriptCoherenceResult,
  providedContext?: BuddySessionContext
): string {
  const clean = userText.trim();
  const lower = clean.toLowerCase();
  const coherence = providedCoherence || validateTranscriptCoherence(clean);
  const ctx = providedContext || extractSessionContext(history, clean);
  const { intent, extractedTerm } = classifyBuddyIntent(clean, ctx, coherence);

  const pickNonRepeating = (options: string[]): string => {
    const fresh = options.filter(
      opt => !ctx.recentBuddyTexts.some(p => p.includes(opt.slice(0, 28).toLowerCase()))
    );
    const pool = fresh.length > 0 ? fresh : options;
    return pool[0];
  };

  let coreReply = '';

  if (intent === 'unclear_speech') {
    const sortedSpans = [...(coherence.suspiciousSpans || [])].sort((a, b) => b.length - a.length);
    const suspicious = sortedSpans[0] || clean;
    if (/\b(cappuccino|potato|mango|coffee|tea|pizza|burger|banana|apple)\b/i.test(lower)) {
      return `Haha, I'm not quite sure I understood that — it came through as "${suspicious}"! Are you talking about a food or drink recipe, or did the mic mishear what you said?`;
    }
    if (/\b(nothing|resting|happen)\b/i.test(lower)) {
      return `Sorry, I didn't quite catch that clearly! Did you mean that nothing interesting happened today, or were you trying to tell me about something else?`;
    }
    if (/\b(promote|promoted)\b/i.test(lower)) {
      return `Hmm, I think the microphone may have misheard part of that — it sounded like "${suspicious}". Could you say that again in a simpler way?`;
    }
    return `Haha, I think I missed what you meant there — it came through as "${suspicious}". Could you say that again, or rephrase it for me?`;
  }

  if (intent === 'repeat_last_buddy') {
    if (ctx.lastBuddyMessage) {
      return `Of course! Earlier I said: "${ctx.lastBuddyMessage}"`;
    }
    return "Sure thing! I was just asking how your day is going and what you'd like to chat about.";
  }

  if (intent === 'explain_earlier_mistake') {
    const lastMistakeMsg = [...history]
      .reverse()
      .find(m => m.role === 'user' && m.analysis && m.analysis.mistakes.length > 0);
    const firstMistake = lastMistakeMsg?.analysis?.mistakes[0];
    if (firstMistake) {
      return `Sure! Earlier you said "${firstMistake.original}", and the smoother version is "${firstMistake.correction}". ${firstMistake.explanation} Want to try using "${firstMistake.correction}" in a quick new sentence?`;
    }
    return "Happy to help! You haven't had a confirmed grammar mistake in this chat yet — tell me which word or sentence you're wondering about and I'll break it down simply.";
  }

  if (intent === 'topic_correction') {
    if (ctx.activeSubject) {
      if (/\b(project|app|application|tool|website|software)\b/i.test(ctx.activeSubject)) {
        return `You're right! Sorry for drifting off-topic — let's get right back to ${ctx.activeSubject}. What feature were you working on?`;
      }
      return `You're right! Sorry for drifting off-topic — let's get right back to ${ctx.activeSubject}. What were you going to share about it next?`;
    }
    return "You're right — sorry for drifting off-topic! Let's jump right back to what we were discussing. Go ahead!";
  }

  if (intent === 'topic_change') {
    return pickNonRepeating([
      'Of course! What would you like to talk about?',
      "Sure thing, let's switch gears! What would you like to talk about instead?"
    ]);
  }

  if (intent === 'clarify_specific_term' || intent === 'clarify_last_question') {
    return reExplainLastBuddyQuestion(ctx.lastBuddyMessage, extractedTerm);
  }

  if (intent === 'user_disagreement') {
    const subj = ctx.activeSubject ? ` about ${ctx.activeSubject}` : '';
    return pickNonRepeating([
      `Fair enough — I'm glad you pushed back${subj}! Why do you see it differently? I'd love to hear your side.`,
      `Totally fair! Good conversations need different viewpoints${subj}. What's your take on it?`
    ]);
  }

  if (intent === 'empathy_negative_day') {
    if (/\b(nothing|anything)\s+(?:is\s+)?possible|in\s+my\s+life\b/i.test(lower)) {
      const topicTie = ctx.activeSubject
        ? ` — is it connected to ${ctx.activeSubject}, or something else going on?`
        : '. What has been weighing on you the most lately?';
      return `Hey, it sounds like you're feeling pretty discouraged right now, and I'm really sorry you're carrying that${topicTie}`;
    }
    return pickNonRepeating([
      "Oh no, I'm really sorry to hear that — rough days can feel completely draining. Do you feel like venting about what happened, or would you rather talk about something light to take your mind off it?",
      "Ah, that really sucks — I'm sorry today was so tough. What happened, if you feel up to sharing?"
    ]);
  }

  // Gratitude ("Thank you", "I want to say thank you", "Thanks so much")
  if (/\b(thank\s+you|thanks\s+a\s+lot|thanks\s+so\s+much|say\s+thank\s+you|appreciate\s+it)\b/i.test(lower)) {
    const tie = ctx.activeSubject
      ? ` Still want to tell me more about ${ctx.activeSubject}, or switch to something else?`
      : ' What would you like to chat about next?';
    return `Aww, you're so welcome! Always happy to hang out and practise with you.${tie}`;
  }

  // User asking how to use / what to do ("Define what to do", "What should I do?", "How does this work?")
  if (
    /\b(define\s+what\s+to\s+do|what\s+to\s+do|what\s+should\s+i\s+(?:do|say|talk\s+about)|how\s+does\s+this\s+work|help\s+me\s+start)\b/i.test(
      lower
    )
  ) {
    const tie = ctx.activeSubject
      ? ` For instance, we can keep talking about ${ctx.activeSubject} — what's been the best or hardest part of it?`
      : " For example, tell me about your university life, a movie you watched, or something that happened this week!";
    return `Super easy — just talk to me like a real friend about anything on your mind, and I'll reply naturally while showing English tips on the side.${tie}`;
  }

  // User referencing the feedback card itself ("no grammar mistakes detected", "why didn't you correct")
  if (/\b(no\s+grammar\s+mistakes?\s+detected|clean,?\s+natural\s+english|didn'?t\s+detect|why\s+no\s+mistakes?)\b/i.test(lower)) {
    return "Haha, good catch! If I missed a subtle mistake in Offline Mode, try connecting a free Gemini API key in Audio Settings for full AI conversation & deep grammar analysis — or click Edit on any misheard mic capture. Want to test me with a sentence right now?";
  }

  if (intent === 'context_retention') {
    if (ctx.activeSubject) {
      return `Sure! Talking about ${ctx.activeSubject} — what part are you most curious to dive into? We can explore how it works, the pros and cons, or your own experience with it.`;
    }
    if (ctx.lastBuddyMessage) {
      return `Sure! Earlier I mentioned: "${ctx.lastBuddyMessage}" — which part of that sounds most interesting to explore further?`;
    }
    return "Sure! Which part did you want to dig deeper into? Give me a quick hint and I'll dive right in.";
  }

  if (intent === 'project_continuation') {
    const projectRef = ctx.activeSubject || 'your project';
    return pickNonRepeating([
      `Nice! What does this new feature do in ${projectRef}, and was it tricky to build?`,
      `Awesome progress on ${projectRef}! How does the new feature improve things for the people using it?`
    ]);
  }

  if (intent === 'quiet_day') {
    coreReply = pickNonRepeating([
      "Haha, sounds like a pretty quiet day! Did you just relax at home, or were you planning to do something that ended up not happening?",
      "Honestly, slow days where nothing much happens can be a nice reset! Did you get some good rest, or did it start feeling a bit boring?"
    ]);
  } else if (intent === 'school_cancellation') {
    const placeMatch = lower.match(/\b(school|classes|class|university|college|lectures|lecture|work|office)\b/i);
    const placeWord = placeMatch ? placeMatch[1].toLowerCase() : 'school';
    coreReply = pickNonRepeating([
      `Oh, do you think ${placeWord} might be cancelled tomorrow? Is there a holiday, bad weather, or something else going on?`,
      `Wait, no ${placeWord} tomorrow?! If you do get the day off, how are you planning to spend your free time?`
    ]);
  } else if (intent === 'cooking_process') {
    if (ctx.currentIngredients.length > 0) {
      const ingText = formatNaturalList(ctx.currentIngredients.slice(0, 3));
      const dishHint = ctx.mentionedDishes[0];
      if (dishHint) {
        coreReply = pickNonRepeating([
          `Ooh, starting ${dishHint} with ${ingText} always smells amazing! What ingredients do you add next?`,
          `Nice, so you begin with ${ingText} for your ${dishHint}. How long do you usually let that cook before adding the rest?`
        ]);
      } else {
        coreReply = pickNonRepeating([
          `So you start by heating the ${ingText} — that already smells great! What ingredients do you add after that, and what dish are you making?`,
          `Nice combo — ${ingText} is such a classic base! What's the main dish you're cooking with it?`
        ]);
      }
    } else if (/\b(cook|make|prepare)\s+(a\s+)?big\b|\b(will|going to|gonna|want to|plan to)\s+cook\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        "Oh, sounds like you're planning to cook a big meal! What dish are you thinking of making, and are you cooking just for yourself or for others too?",
        "Nice! Cooking a proper meal from scratch is always satisfying. What's on the menu — something spicy, or a comfort dish?"
      ]);
    } else if (ctx.sessionIngredients.length > 0) {
      const prevIng = formatNaturalList(ctx.sessionIngredients.slice(0, 2));
      coreReply = pickNonRepeating([
        `Got it! After the ${prevIng}, do you add any spices or sauces to bring the flavours together?`,
        `Sounds like a proper homemade recipe! Did you learn how to make this from family, or are you experimenting on your own?`
      ]);
    } else {
      coreReply = pickNonRepeating([
        "Oh nice, you enjoy cooking! What's the dish you're making, and what's the very first step?",
        "Homemade cooking is the best! What kind of ingredients do you usually start with?"
      ]);
    }
  } else if (ctx.activeTopic === 'fitness_gym') {
    if (/\b(leg\s+press|bench\s+press|squat|deadlift|cardio|weights|chest|back|arms)\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        "That's a great exercise for building strength! How do you usually feel after a challenging workout?",
        "Solid choice! Do you usually pair that with cardio, or focus mainly on strength training?"
      ]);
    } else if (/\b(tired|exhausted|sore|refreshing|energized|good)\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        "Do you prefer working out in the morning or in the evening?",
        "That post-workout feeling really is unbeatable! How many days a week do you usually train?"
      ]);
    } else {
      coreReply = pickNonRepeating([
        "What do you usually work on when you're there?",
        "Nice! Are you focusing on strength training today or doing some cardio?"
      ]);
    }
  } else if (ctx.activeTopic === 'career_work') {
    if (/\bsoftware\s+engineer|developer|programmer\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        'What kind of software do you work on?',
        'Nice! Are you working mostly on web apps, mobile, or backend systems right now?'
      ]);
    } else {
      coreReply = pickNonRepeating([
        'What kind of work do you enjoy most in your role?',
        'How long have you been in that field, and what drew you to it?'
      ]);
    }
  } else if (ctx.activeTopic === 'shopping') {
    if (/\b(clothes|shirt|dress|jacket|shoes|jeans)\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        'What kind of clothes did you end up picking out? Were you shopping for a specific occasion?',
        'Nice! Did you find something you really liked right away?'
      ]);
    } else {
      coreReply = pickNonRepeating([
        'What did you buy?',
        'Oh nice! What did you end up buying while you were out?'
      ]);
    }
  } else if (ctx.activeTopic === 'university') {
    if (/\b(developed|built|building|created|made)\b.*\b(ai\s+application|application|app)\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        "That's exciting! What does your application do?",
        "Whoa, building your own application is awesome! What does it do, and who did you build it for?"
      ]);
    } else if (/\b(developed|built|building|created|made)\b.*\b(ai|tool|website|project|system|platform)\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        'Whoa, building your own AI tool is awesome! What problem does it solve, and what stack are you using for it?',
        "That's super cool! What's the favourite feature you've built into it so far?"
      ]);
    } else if (/\b(university\s+experience|college\s+experience)\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        "I'd love to hear about your university experience! What's been the most memorable part so far — the people you've met, the classes, or the independence?",
        "University life always has great stories! What are you studying, and how has the experience felt compared to what you expected?"
      ]);
    } else if (/\b(ai|artificial intelligence|software|coding|programming|react|typescript|computer|tech)\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        "Oh, tech and AI topics can get super absorbing! Are you building a hands-on project right now, or mostly studying theory in university?",
        "Nice! Which part of what you're working on in tech has been the trickiest — or the most fun — so far?"
      ]);
    } else {
      coreReply = pickNonRepeating([
        "University schedules can get pretty full! Which class or topic took up most of your energy today?",
        "Sounds like you've been busy with studies. Are you preparing for an upcoming exam or working on an assignment?"
      ]);
    }
  } else if (ctx.activeTopic === 'work_stress') {
    coreReply = pickNonRepeating([
      "Whew, sounds like a draining day! What kept you so tied up — deadlines, classes, or just everything piling up at once?",
      "You definitely earned some downtime after that. Are you going to take it easy tonight, or do you still have things to wrap up?"
    ]);
  } else if (ctx.activeTopic === 'travel') {
    coreReply = pickNonRepeating([
      "That sounds like a refreshing getaway! What part of the trip are you looking forward to most — the scenery, the food, or just unwinding?",
      "Getting out for a trip always clears the head. Are you going with friends or family, and how long are you staying?"
    ]);
  } else if (ctx.activeTopic === 'entertainment') {
    coreReply = pickNonRepeating([
      "Ooh, nice pick! What pulled you in the most — the storyline, the action, or just the overall vibe?",
      "Sounds like a solid way to unwind! Would you actually recommend it to a friend, or did it have any weak parts?"
    ]);
  } else if (ctx.activeTopic === 'social') {
    coreReply = pickNonRepeating([
      "Catching up with people you care about always changes the mood of a day! What did you all end up doing together?",
      "That sounds like good company! Do you all get to hang out often, or was it a rare catch-up?"
    ]);
  } else if (ctx.activeTopic === 'food_dining') {
    coreReply = pickNonRepeating([
      "Now you're making me hungry! What did you have, and was it as good as you hoped?",
      "Good food instantly lifts the day! Is that a dish you eat often, or was it a special craving today?"
    ]);
  } else if (/\b(how are you|what about you|and you\?|who are you|your name)\b/i.test(lower)) {
    coreReply = pickNonRepeating([
      "I'm doing great, thanks for asking! Always happy to hang out and chat with you. How has your day been treating you so far?",
      "Doing really well! I'm all ears today — anything fun planned for later, or just taking it easy?"
    ]);
  } else if (intent === 'greeting_or_ack') {
    if (/^(hi|hello|hey|good morning|good evening|good afternoon|yo|sup)[!.,\s]*$/i.test(lower)) {
      coreReply = pickNonRepeating([
        "Hey! Good to hear from you. How's your day going so far — busy or pretty relaxed?",
        "Hey there! What's been going on with you today?"
      ]);
    } else {
      coreReply = pickNonRepeating([
        "Haha, fair enough! Want to tell me a bit about what you're planning to do later today, or pick a fun topic to chat about?",
        "Gotcha! So what's on your mind right now — work, studies, food, or something totally random?"
      ]);
    }
  } else if (/\b(going|head|heading|went|walk|walking)\s+(?:to\s+(?:my\s+)?)?home\b/i.test(lower)) {
    coreReply = pickNonRepeating([
      'Are you heading home now to relax, or do you have plans for later tonight?',
      'Nothing beats getting home after a long day! How are you planning to unwind this evening?'
    ]);
  } else if (/\b(didn'?t|did\s+not)\s+(go|went)\s+there\b/i.test(lower)) {
    const placeHint = ctx.activePlace ? ` to ${ctx.activePlace}` : '';
    coreReply = `What stopped you from going${placeHint}?`;
  } else if (/\bwent\s+there\b/i.test(lower)) {
    const placeHint = ctx.activePlace ? ` at ${ctx.activePlace}` : ' there';
    coreReply = `Oh, nice! What did you do${placeHint}?`;
  } else if (mode === 'ielts_partner') {
    const keywords = extractKeyContentWords(clean);
    const topicRef = keywords.length > 0 ? `about ${keywords[0]}` : 'on that';
    coreReply = pickNonRepeating([
      `I see your point ${topicRef}! What's the main reason you look at it that way — is it from personal experience?`,
      `Fair point ${topicRef}. Do you think most people your age feel the same way, or do opinions differ a lot?`
    ]);
  } else {
    // ZERO robotic mad-libs ("Oh, you brought up X and Y")! Stay anchored to activeSubject or keep natural flow.
    if (ctx.activeSubject) {
      coreReply = pickNonRepeating([
        `Gotcha! Coming back to ${ctx.activeSubject} — what's been on your mind most about it lately?`,
        `I hear you! How does that fit in with ${ctx.activeSubject} right now?`
      ]);
    } else {
      coreReply = pickNonRepeating([
        "I hear you — could you expand on that a little bit? I want to make sure I'm following your exact thought!",
        "Got it! What made that come to mind today, or would you like to chat about something specific like university, tech, or travel?",
        "Fair enough! Tell me a bit more in a full sentence or two so we can really get into it."
      ]);
    }
  }

  if (personality === 'calm') {
    return `Take your time — ${coreReply.charAt(0).toLowerCase()}${coreReply.slice(1)}`;
  }
  if (personality === 'motivational' && !coreReply.includes('great')) {
    return `${coreReply} You're doing well keeping the conversation moving!`;
  }
  if (personality === 'intellectual' && !/\b(reason|perspective|experience)\b/i.test(coreReply)) {
    return `${coreReply} I'm curious what shaped your view on it.`;
  }

  return coreReply;
}

export interface BuddyFriendReplyResult {
  reply: string;
  source: 'gemini' | 'local';
  providerRequested: 'gemini' | 'local';
  fallbackReason?: string;
  intent: BuddyTurnIntent;
  activeTopic: BuddySessionTopic;
  activeSubject: string | null;
  latencyMs: number;
}

/**
 * Generates the AI Friend's natural spoken response (Phase 05A — independent from Grammar Analysis).
 * Uses Gemini API when available with a fast 7s timeout, falling back transparently to Local Friend Engine
 * with full diagnostic metadata (providerRequested, source, fallbackReason, intent, latencyMs).
 * Audit Fix #2: Strictly uses priorHistory without duplicating the latest user turn!
 */
export async function generateBuddyFriendReply(params: {
  userText: string;
  history: BuddyMessage[];
  personality: BuddyPersonality;
  mode: BuddyMode;
  coherence?: TranscriptCoherenceResult;
  context?: BuddySessionContext;
  longTermMemories?: BuddyMemoryItem[];
  topWeakCategory?: GrammarCategoryCode | null;
  apiKey?: string;
  model?: string;
  /** Real-time token streaming callback — fires as soon as each chunk arrives */
  onPartialReply?: (fullTextSoFar: string) => void;
  /** Real-time sentence boundary callback — enables TTS to start speaking Sentence 1 immediately! */
  onSentenceReady?: (sentence: string) => void;
}): Promise<BuddyFriendReplyResult> {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const {
    userText,
    history,
    personality,
    mode,
    coherence,
    context,
    longTermMemories = [],
    topWeakCategory = null,
    apiKey,
    model,
    onPartialReply,
    onSentenceReady
  } = params;

  const personalityCfg = getPersonalityConfig(personality);
  const resolvedCoherence = coherence || validateTranscriptCoherence(userText);
  const ctx = context || extractSessionContext(history, userText);
  const { intent } = classifyBuddyIntent(userText, ctx, resolvedCoherence);

  let priorHistory = history;
  if (
    history.length > 0 &&
    history[history.length - 1].role === 'user' &&
    history[history.length - 1].text.trim().toLowerCase() === userText.trim().toLowerCase()
  ) {
    priorHistory = history.slice(0, -1);
  }

  const finishLocal = (
    providerRequested: 'gemini' | 'local',
    fallbackReason?: string
  ): BuddyFriendReplyResult => {
    const reply = generateLocalFriendReply(
      userText,
      priorHistory,
      personality,
      mode,
      resolvedCoherence,
      ctx
    );
    onPartialReply?.(reply);
    if (onSentenceReady) {
      const localSentences = reply.match(/[^.!?]+[.!?]?/g) || [reply];
      for (const s of localSentences) {
        const cleanS = s.trim();
        if (cleanS) onSentenceReady(cleanS);
      }
    }
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      reply,
      source: 'local',
      providerRequested,
      fallbackReason,
      intent,
      activeTopic: ctx.activeTopic,
      activeSubject: ctx.activeSubject,
      latencyMs: Math.max(1, Math.round(t1 - t0))
    };
  };

  if (!apiKey || !apiKey.trim()) {
    return finishLocal('local', 'No Gemini API key configured — using Local Friend Engine');
  }

  const recentTurns = priorHistory
    .slice(-10)
    .map(m => `${m.role === 'user' ? 'Friend (User)' : 'Lingo Buddy'}: ${m.text}`)
    .join('\n');

  const modeHint =
    mode === 'ielts_partner'
      ? 'Keep the vibe friendly and natural, while gently steering follow-up questions like an organic IELTS Speaking Part 1/2/3 conversation.'
      : mode === 'vocabulary'
      ? 'Respond naturally like a friend and organically weave 1 vivid, natural English expression into your own reply without lecturing.'
      : mode === 'fluency'
      ? 'Keep the conversation flowing warmly and ask open-ended follow-up questions that invite the user to speak in fuller sentences.'
      : 'Chat purely like an authentic, supportive English-speaking friend about whatever the user brings up.';

  const coherenceNotice =
    resolvedCoherence.quality === 'unclear'
      ? `CRITICAL CLARIFICATION ALERT: The user's latest speech transcript looks garbled/unclear (${resolvedCoherence.reason || 'incoherent STT'}). DO NOT pretend to understand! Warmly tell them you didn't quite catch it, mention the confusing words briefly, and ask them to clarify or repeat.`
      : resolvedCoherence.quality === 'partially_unclear'
      ? `NOTE: One phrase in the user's message sounded like a mic slip (${resolvedCoherence.reason}), though the rest makes sense. Respond naturally to the clear part without acting confused if the meaning is obvious.`
      : 'The transcript is understandable.';

  const memoryBlock =
    longTermMemories.length > 0
      ? `Long-Term User Interests & Goals (reference organically only when relevant): ${longTermMemories
          .slice(0, 5)
          .map(m => `${m.label} (${m.detail})`)
          .join('; ')}`
      : null;

  const coachingHint =
    topWeakCategory === 'VERB_TENSE' || topWeakCategory === 'VERB_FORMS'
      ? 'Subtle Coaching Goal: The user often practices past tense — when natural, ask a casual question about what happened yesterday/recently.'
      : topWeakCategory === 'CONDITIONALS'
      ? 'Subtle Coaching Goal: When natural, ask a playful "what if / future plans" question.'
      : null;

  const entityMemory = [
    `Detected User Intent: ${intent}`,
    ctx.activeTopic !== 'general' ? `Active Topic: ${ctx.activeTopic}` : null,
    ctx.activeSubject ? `Active Subject / Project (for "it" / "that"): ${ctx.activeSubject}` : null,
    ctx.activePlace ? `Active Place / Location (for "there"): ${ctx.activePlace}` : null,
    ctx.userIsCooking ? 'IMPORTANT: The user is describing COOKING at home — do NOT ask if it is from a restaurant!' : null,
    ctx.sessionIngredients.length > 0 ? `Mentioned Ingredients: ${ctx.sessionIngredients.join(', ')}` : null,
    ctx.lastBuddyMessage ? `Your exact previous message: "${ctx.lastBuddyMessage}"` : null,
    ctx.lastBuddyQuestion ? `Your exact previous question: "${ctx.lastBuddyQuestion}"` : null,
    memoryBlock,
    coachingHint
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `You are "Lingo Buddy", a friendly, curious, supportive, intelligent English-speaking companion (NOT an interviewer, examiner, or generic chatbot).
Personality: ${personalityCfg.label} (${personalityCfg.systemTone}).
Active Mode: ${modeHint}

CONVERSATION MEMORY & COHERENCE:
${coherenceNotice}
${entityMemory}

CRITICAL CONVERSATIONAL CONTINUATION RULES:
1. NOTE ON GRAMMAR RECASTS: Any short spoken correction ("You can say, '...'") is automatically prepended right BEFORE your reply by the unified coaching layer when needed. Therefore, DO NOT write "You can say..." yourself — write ONLY the natural conversational reaction and continuation so the two parts flow together seamlessly as ONE single human voice!
   - Example: If the user says "I'm going to gym", your part is simply: "What do you usually work on when you're there?"
   - Example: If the user says "Yesterday I go to shopping", your part is simply: "What did you end up buying?"
   - Example: If the user says "I developed an AI application", your part is: "That's exciting! What does your application do?"
2. TOPIC & CONTEXT CONTINUITY:
   - Stay anchored to what the user is actually talking about right now. Never generate random unrelated questions.
   - Understand references like "it", "that", "there", and "the same thing" using Active Subject / Active Place & Recent Conversation below.
   - Never repeat generic praise ("That's really interesting!", "I'd love to hear more!") or repeat questions you already asked.
   - You don't have to end EVERY single turn with a question if a warm, natural observation fits better — avoid sounding like an interrogator!
3. SELF-AWARENESS & META-INTENTS:
   - If the user says "I don't understand what you are asking" or "What do you mean?", explain "Your exact previous message" in simpler everyday English — NEVER invent a different topic!
   - If the user says "You're going off-topic", acknowledge it ("You're right!") and immediately return to the Active Subject / Project they mentioned.
   - If the user asks to talk about something else ("Let's talk about something else"), agree warmly ("Of course! What would you like to talk about?") and drop the old topic.
   - If the user challenges or disagrees with you, engage thoughtfully with their viewpoint.
4. Length: Keep your spoken continuation crisp and natural — 1 to 2 short conversational sentences max (ideal for real-time voice conversation).
5. Output ONLY your spoken continuation text (no quotes, no speaker labels, no markdown).

Recent conversation:
${recentTurns}
Friend (User): ${userText}
Lingo Buddy:`;

  let primaryModel = (model || '').trim().replace(/^models\//, '');
  if (!primaryModel || primaryModel.includes('3.8')) {
    primaryModel = 'gemini-2.5-flash';
  }
  const candidateModels = Array.from(
    new Set([primaryModel, 'gemini-2.5-flash', 'gemini-2.0-flash'])
  );

  let lastFailReason = 'Gemini unavailable';

  for (const candidateModel of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      // Real-time Server-Sent Events (SSE) streaming so first words appear & start speaking fast!
      const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidateModel)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.68, maxOutputTokens: 130 }
        })
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        lastFailReason = `Gemini API HTTP ${response.status} on ${candidateModel}`;
        if ([400, 404, 429, 500, 503].includes(response.status)) continue;
        return finishLocal('gemini', `${lastFailReason} — fell back to Local Engine`);
      }

      let accumulated = '';
      let emittedCursor = 0;

      const flushReadySentences = (forceAll: boolean = false) => {
        if (!onSentenceReady) return;
        const cleaned = accumulated.replace(/^["']|["']$/g, '').replace(/\*\*/g, '');
        const remaining = cleaned.slice(emittedCursor);
        if (!remaining.trim()) return;

        if (forceAll) {
          const tail = remaining.trim();
          if (tail) {
            onSentenceReady(tail);
            emittedCursor = cleaned.length;
          }
          return;
        }

        const match = remaining.match(/^([\s\S]*?[.!?])(?:\s+|$)/);
        if (match && match[1].trim().length >= 8) {
          onSentenceReady(match[1].trim());
          emittedCursor += match[0].length;
        }
      };

      if (response.body && typeof response.body.getReader === 'function') {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let sseBuffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });

          const lines = sseBuffer.split('\n');
          sseBuffer = lines.pop() || '';

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (delta) {
                accumulated += delta;
                const cleanDisplay = accumulated
                  .replace(/^["']|["']$/g, '')
                  .replace(/\*\*/g, '')
                  .trim();
                if (cleanDisplay) {
                  onPartialReply?.(cleanDisplay);
                  flushReadySentences(false);
                }
              }
            } catch {
              // Partial JSON chunk — wait for next SSE line
            }
          }
        }
        clearTimeout(timeoutId);
        flushReadySentences(true);
      } else {
        const data = await response.json();
        clearTimeout(timeoutId);
        accumulated = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanDisplay = accumulated.replace(/^["']|["']$/g, '').replace(/\*\*/g, '').trim();
        if (cleanDisplay) {
          onPartialReply?.(cleanDisplay);
          flushReadySentences(true);
        }
      }

      // Safety strip if model ever echoed a duplicate "You can say..." recast
      const rawReply = accumulated
        .replace(/^["']|["']$/g, '')
        .replace(/\*\*/g, '')
        .replace(/^(?:you\s+can\s+say|a\s+more\s+natural\s+way\s+to\s+say\s+that\s+is),?\s*["'][^"']+["'][.!?]?\s*/i, '')
        .trim();

      if (!rawReply) {
        lastFailReason = 'Gemini returned empty text';
        continue;
      }

      const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        reply: rawReply,
        source: 'gemini',
        providerRequested: 'gemini',
        intent,
        activeTopic: ctx.activeTopic,
        activeSubject: ctx.activeSubject,
        latencyMs: Math.max(1, Math.round(t1 - t0))
      };
    } catch (err: any) {
      lastFailReason =
        err?.name === 'AbortError'
          ? 'Gemini timed out (>9s)'
          : `Gemini network error (${err?.message || 'unknown'})`;
    }
  }

  return finishLocal('gemini', `${lastFailReason} — fell back to Local Engine`);
}
