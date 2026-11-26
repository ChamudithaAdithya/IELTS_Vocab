/**
 * AI Speaking Buddy (Lingo Buddy) — Phase 1 Conversation & Transcription Engine
 * Layer 1: Conversation Intelligence (listening, understanding, responding like a friend)
 * Phase 1 P0.1 & P0.2 implementation with dual Gemini Cloud + Rich Local Friend fallback.
 */

import type {
  BuddyConversationalIntent,
  BuddyMemoryItem,
  BuddyMessage,
  BuddyMode,
  BuddyModeConfig,
  BuddyPersonality,
  BuddyPersonalityConfig,
  BuddySession,
  BuddyTurnIntent,
  CorrectionIntensity,
  GrammarCategoryCode,
  TranscriptCoherenceResult
} from '../types/speakingBuddy';
import {
  detectContextualWordInterpretation,
  detectIncompleteSpeech,
  validateTranscriptCoherence
} from './buddyGrammarEngine';
import {
  discoverFastVoiceModelsForKey,
  getFastVoiceModelCandidates,
  markDeadGeminiModel,
  markVerifiedFastVoiceModel
} from './speakingEngine';

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
    greeting: "Hi there — glad we get to chat today. How has your day been going so far?"
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

function reExplainLastBuddyQuestion(
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

/**
 * Generates a natural, grounded, context-aware friend reply offline (Local Conversation Intelligence)
 * when no Gemini API key is connected or if network call times out.
 * ZERO generic chatbot fillers — uses explicit intent classification, activeSubject memory,
 * accurate term/question clarification, off-topic recovery, empathy, and session entity continuity.
 */
/**
 * Strips overused chatbot clichés ("Take your time", "I'm all ears") so Lingo Buddy always sounds varied and human.
 */
function stripRepetitiveCliches(text: string): string {
  if (!text) return text;
  let out = text
    .replace(/\btake\s+your\s+time[!.,—\-\s]*/gi, '')
    .replace(/\bi'?m\s+all\s+ears[!.,—\-\s]*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (out) {
    out = out.charAt(0).toUpperCase() + out.slice(1);
  }
  return out || 'Go ahead — what were you going to share?';
}

function flipFirstPersonTopicPronouns(topic: string): string {
  return topic
    .replace(/\bmy\b/gi, 'your')
    .replace(/\bour\b/gi, 'your')
    .replace(/\bme\b/gi, 'you')
    .trim();
}

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
  const ctx = providedContext || extractSessionContext(history, clean);
  const coherence =
    providedCoherence ||
    validateTranscriptCoherence(clean, [], undefined, ctx.lastBuddyMessage || '');
  const { intent, extractedTerm } = classifyBuddyIntent(clean, ctx, coherence);
  const contextualWord =
    coherence.contextualWord ||
    detectContextualWordInterpretation(clean, ctx.lastBuddyMessage || '');

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
    if (/\bgot\s+you\b/i.test(lower)) {
      return `Sorry, I didn't quite catch that clearly — it came through as "${clean}". Did you mean "I didn't get you", or were you trying to say something else?`;
    }
    return `Sorry, I didn't quite catch what you meant there — it came through as "${suspicious}". Could you say that again or clarify?`;
  }

  if (intent === 'incomplete_sentence') {
    const frag = extractedTerm || coherence.incompleteFragment || clean;
    // Preserve multi-clause early-cutoff check (e.g. "Much into. Nothing much.")
    if (/\bnothing\s+much\b/i.test(lower)) {
      return `It sounded like the first part cut off ("${frag}") — did you just mean "nothing much" happened today, or were you starting to say what you're into?`;
    }
    const incDetail = detectIncompleteSpeech(clean);
    if (!incDetail.isIncomplete && clean.split(/[.!?]+/).filter(s => s.trim()).length > 1) {
      return `It sounded like part of your sentence got cut off ("${frag}"). Could you finish that thought or repeat it so I follow you?`;
    }

    const subj = ctx.activeSubject;
    if (incDetail.starterKind === 'thinking') {
      return subj
        ? pickNonRepeating([
            `Ooh, go ahead — what were you thinking about ${subj}?`,
            `Tell me! What idea crossed your mind about ${subj}?`,
            `Keep going — what were you thinking of doing with ${subj}?`
          ])
        : pickNonRepeating([
            'Ooh, go ahead — what were you thinking about?',
            'Tell me! What idea just crossed your mind?',
            'Go on and finish that thought — what were you thinking of?'
          ]);
    }

    if (incDetail.starterKind === 'about') {
      return subj
        ? pickNonRepeating([
            `Go ahead! What were you going to share about ${subj}?`,
            `Ooh, go on — what part of ${subj} were you about to mention?`,
            `Yes, keep going! What did you want to say about ${subj}?`
          ])
        : pickNonRepeating([
            'Ooh, go ahead and finish your thought — about your work, your studies, or something else?',
            'Go on! What were you about to share?',
            'Yes, keep going — what were you going to say about it?'
          ]);
    }

    return subj
      ? pickNonRepeating([
          `Go ahead and finish that sentence — what were you going to say about ${subj}?`,
          `Ooh, don't stop there! What happened next with ${subj}?`,
          `Keep going — how does the rest of that thought about ${subj} go?`
        ])
      : pickNonRepeating([
          'Go ahead and finish your thought — what were you about to say?',
          "Ooh, keep going! How does the rest of that sentence go?",
          'Go on — what happened next?'
        ]);
  }

  if (intent === 'correcting_ai') {
    const afterMeant = clean.match(/\bi\s+meant\s+(.+)$/i);
    if (afterMeant && afterMeant[1].trim().length >= 3) {
      return `Oh, sorry! Thanks for clarifying — so you meant ${afterMeant[1].trim().replace(/[.!?]+$/, '')}. Tell me more about that!`;
    }
    return 'Oh, sorry! I misunderstood you. What did you mean?';
  }

  if (intent === 'ask_word_meaning') {
    return resolveAskedWordAgainstContext(
      extractedTerm || clean,
      ctx.lastBuddyMessage,
      ctx.recentBuddyTexts
    ).explanationReply;
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
    if (extractedTerm === '__stt_coding_disambig__') {
      if (ctx.activeSubject && /project|ai|app|software|code|coding/i.test(ctx.activeSubject)) {
        return "Sure! Let's talk about coding. What are you currently developing?";
      }
      return 'Did you mean "coding"? Sure, let\'s talk about coding! What are you currently developing?';
    }
    if (contextualWord && contextualWord.intendedWord === 'career') {
      return pickNonRepeating([
        "Sure! Do you mean your career? I'd love to hear about it.",
        'Of course! Do you mean your career? Tell me what kind of work you do!'
      ]);
    }
    if (contextualWord) {
      return `Sure! Do you mean "${contextualWord.intendedWord}"? I'd love to hear about it.`;
    }
    if (extractedTerm) {
      const tLow = extractedTerm.toLowerCase().trim();
      if (/\b(coding|programming|software|development|code|tech|ai)\b/.test(tLow)) {
        return "Sure! Let's talk about coding. What are you currently developing?";
      }
      if (/\b(career|job|work|profession)\b/.test(tLow)) {
        return "Sure! Let's talk about your career. What kind of work are you doing right now?";
      }
      if (/\b(travel|travelling|traveling|trips?|holidays?|vacations?)\b/.test(tLow)) {
        return "Sure! Let's talk about travel. Where would you like to visit next?";
      }
      if (/\b(daily\s+routines?|routines?)\b/.test(tLow)) {
        return "Sure! Let's talk about your daily routine. What do you usually do in the morning?";
      }
      if (/\b(hobbies|hobby|free\s+time)\b/.test(tLow)) {
        return "Sure! Let's talk about your hobbies. What do you enjoy doing in your free time?";
      }
      if (/\b(education|studies|university|school|college)\b/.test(tLow)) {
        return "Sure! Let's talk about your studies. What subject are you focusing on right now?";
      }
      if (/\b(family|parents|siblings)\b/.test(tLow)) {
        return "Sure! Let's talk about your family. Tell me — who are you closest to at home?";
      }
      const naturalTopic = flipFirstPersonTopicPronouns(extractedTerm);
      return `Sure! Let's talk about ${naturalTopic}. What interests you most about ${/^(?:your|the)\s+/i.test(naturalTopic) ? 'that' : 'it'}?`;
    }
    return pickNonRepeating([
      'Of course! What would you like to talk about?',
      'Sure! What topic would you like to talk about next?'
    ]);
  }

  // Contextual Word Interpretation in everyday statements (gently confirm intended word + continue on topic!)
  if (contextualWord) {
    const iw = contextualWord.intendedWord.toLowerCase();
    if (iw === 'career') {
      return pickNonRepeating([
        "Sure! Do you mean your career? I'd love to hear about it.",
        'Nice! Assuming you mean your career — what kind of work are you aiming for?'
      ]);
    }
    if (iw === 'live') {
      const placeMatch = clean.match(/\bleave\s+(?:in|at|near)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/);
      const placeStr = placeMatch ? ` in ${placeMatch[1]}` : ' there';
      return `Oh nice! Do you mean you live${placeStr}? I'd love to hear what life is like there.`;
    }
    if (iw === 'snack') {
      return 'Haha, do you mean a quick snack? Tell me what you ended up having!';
    }
    if (iw === 'coffee') {
      return 'Nice! Do you mean a cup of coffee? Tell me how you usually like to drink it!';
    }
    if (iw === 'work') {
      return 'Gotcha — do you mean work? Tell me what kind of projects keep you busy!';
    }
    if (iw === 'dessert') {
      return 'Ooh, do you mean dessert? Tell me what sweet treat you had!';
    }
    if (iw === 'course') {
      return 'Nice! Do you mean a course? Tell me what subject you are studying!';
    }
    if (iw === 'bored') {
      return 'Aw, do you mean you felt bored? Tell me how you usually pass the time on slow days!';
    }
    if (iw === 'thank' || iw === 'thanks') {
      const tie = ctx.activeSubject
        ? ` Want to share more about ${ctx.activeSubject}?`
        : ' What would you like to talk about next?';
      return `You're very welcome! (Just checking — you meant "${iw} you", right?)${tie.replace(/\?$/, '!')} What's on your mind next?`.replace(
        /!\s+What's on your mind next\?$/,
        '?'
      );
    }
    return `Got it — do you mean "${contextualWord.intendedWord}"? I'd love to hear more about that.`;
  }

  if (intent === 'clarify_specific_term' || intent === 'clarify_last_question') {
    return reExplainLastBuddyQuestion(ctx.lastBuddyMessage, extractedTerm, ctx.recentBuddyTexts);
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
    if (/\bstay(?:ed)?\s+at\s+home\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        'Sounds like a relaxing day! Did you watch anything interesting?',
        'Sometimes a quiet day at home is the best! Did you watch anything good or just rest?'
      ]);
    } else {
      coreReply = pickNonRepeating([
        'Haha, sounds like a pretty low-key day! Did you just relax at home, or watch anything good?',
        'Honestly, slow days where nothing much happens can be a nice reset! Did you get some good rest?'
      ]);
    }
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
        'Nice! Who did you build your application for?'
      ]);
    } else if (/\b(developed|built|building|created|made)\b.*\b(ai|tool|website|project|system|platform)\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        "That's great! What problem does your AI tool solve?",
        'Nice work! What is your favourite feature in it so far?'
      ]);
    } else if (/\b(university\s+experience|college\s+experience)\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        "I'd love to hear about your university experience! What has been the best part so far?",
        'University life has great stories! What subject are you studying?'
      ]);
    } else if (/\b(ai|artificial intelligence|software|coding|programming|react|typescript|computer|tech)\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        'Nice! Are you building a coding project right now, or mostly studying in class?',
        'Which part of tech do you enjoy learning the most?'
      ]);
    } else {
      coreReply = pickNonRepeating([
        'Sounds like a busy schedule! Which class took most of your time today?',
        'Are you preparing for an exam or working on an assignment right now?'
      ]);
    }
  } else if (ctx.activeTopic === 'work_stress') {
    coreReply = pickNonRepeating([
      'That sounds like a tiring day! What kept you so busy today?',
      'You earned some rest! Are you planning to relax tonight?'
    ]);
  } else if (ctx.activeTopic === 'travel') {
    coreReply = pickNonRepeating([
      'That sounds like a lovely trip! What part of the trip are you looking forward to most?',
      'Nice! Are you planning to travel with friends or family?'
    ]);
  } else if (ctx.activeTopic === 'entertainment') {
    const genreMatch = lower.match(
      /\b(action|comedy|horror|sci-fi|science\s+fiction|thriller|romance|romantic|animated|drama|adventure|mystery|documentary)\s+(?:movies?|films?)\b/i
    );
    if (genreMatch) {
      const genre = genreMatch[1].toLowerCase();
      coreReply = pickNonRepeating([
        `That's interesting! Do you have a favourite ${genre} movie?`,
        `Nice choice! What was the last ${genre} movie you watched?`
      ]);
    } else if (
      /\b(movies|films)\b/i.test(lower) &&
      !/\b(yesterday|last\s+night|last\s+week|ago)\b/i.test(lower)
    ) {
      coreReply = pickNonRepeating([
        'What kind of movies do you enjoy watching?',
        'Nice! Do you prefer watching movies at home or at the cinema?'
      ]);
    } else if (/\b(movie|film)\b/i.test(lower)) {
      coreReply = pickNonRepeating([
        'Nice! What kind of movie was it?',
        'Nice! What movie did you watch?'
      ]);
    } else {
      coreReply = pickNonRepeating([
        'That sounds fun! What do you enjoy most about it?',
        'Nice! How often do you do that in your free time?'
      ]);
    }
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
      'Doing really well, thanks! Anything fun planned for later today, or just relaxing?'
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
    return coreReply;
  }
  if (personality === 'motivational' && !coreReply.includes('great')) {
    return `${coreReply} You're doing well keeping the conversation moving!`;
  }
  if (personality === 'intellectual' && !/\b(reason|perspective|experience)\b/i.test(coreReply)) {
    return `${coreReply} I'm curious what shaped your view on it.`;
  }

  return coreReply;
}

function unwrapWholeOuterQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"') && t.slice(1, -1).indexOf('"') === -1) ||
      (t.startsWith("'") && t.endsWith("'") && t.slice(1, -1).indexOf("'") === -1)) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/**
 * Parses a leading spoken correction (`You can say, "..."` or `A more natural way to say that is, "..."`)
 * from Lingo Buddy's streamed or completed response, and automatically strips false self-echoes
 * where the quoted sentence is identical to what the learner already said!
 */
export function splitLeadingSpokenRecast(
  rawText: string,
  originalUserText?: string
): {
  cleanedFullText: string;
  spokenCorrection: string;
  conversationalResponse: string;
  correctionType: 'none' | 'grammar' | 'naturalness';
  correctedSentence?: string;
} {
  const clean = unwrapWholeOuterQuotes(rawText.replace(/\*\*/g, '').trim());
  if (!clean) {
    return {
      cleanedFullText: '',
      spokenCorrection: '',
      conversationalResponse: '',
      correctionType: 'none'
    };
  }

  const recastMatch = clean.match(
    /^((?:you\s+can\s+say|a\s+more\s+natural\s+way\s+to\s+say\s+that\s+is),?\s*["'“]([^"'”]+)["'”][.!?]*)\s*([\s\S]*)$/i
  );
  if (!recastMatch) {
    return {
      cleanedFullText: clean,
      spokenCorrection: '',
      conversationalResponse: clean,
      correctionType: 'none'
    };
  }

  const fullRecastSpan = recastMatch[1].trim();
  const quotedSentence = recastMatch[2].trim();
  const rest = recastMatch[3].trim();

  const normTokens = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // Guard: If the model echoed the exact words the user already said, strip the redundant recast!
  if (originalUserText && normTokens(quotedSentence) === normTokens(originalUserText)) {
    const fallbackRest = rest || clean;
    return {
      cleanedFullText: fallbackRest,
      spokenCorrection: '',
      conversationalResponse: fallbackRest,
      correctionType: 'none'
    };
  }

  const correctionType: 'grammar' | 'naturalness' = /^a\s+more\s+natural/i.test(fullRecastSpan)
    ? 'naturalness'
    : 'grammar';

  // Ensure canonical punctuation inside the recast badge
  const normalizedRecast = /["'”][.!?]*$/.test(fullRecastSpan) ? fullRecastSpan : `${fullRecastSpan}.`;
  const combined = [normalizedRecast, rest].filter(Boolean).join(' ').trim();

  return {
    cleanedFullText: combined,
    spokenCorrection: normalizedRecast,
    conversationalResponse: rest,
    correctionType,
    correctedSentence: quotedSentence
  };
}

export interface BuddyFriendReplyResult {
  reply: string;
  spokenCorrection?: string;
  conversationalResponse?: string;
  correctionType?: 'none' | 'grammar' | 'naturalness' | 'vocabulary';
  source: 'gemini' | 'local';
  providerRequested: 'gemini' | 'local';
  fallbackReason?: string;
  intent: BuddyTurnIntent;
  conversationalIntent: BuddyConversationalIntent;
  activeTopic: BuddySessionTopic;
  activeSubject: string | null;
  latencyMs: number;
  firstTokenMs: number;
}

/**
 * Generates the AI Friend's natural spoken response (Phase 05A — with inline spoken recast when Tier-1 didn't pre-emit one!).
 * Uses Gemini SSE streaming with `thinkingBudget: 0` for < 450ms TTFT, falling back transparently to Local Friend Engine.
 */
export async function generateBuddyFriendReply(params: {
  userText: string;
  history: BuddyMessage[];
  personality: BuddyPersonality;
  mode: BuddyMode;
  intensity?: CorrectionIntensity;
  /** Non-empty when Tier-1 already emitted an instant spoken correction before SSE started */
  precomputedSpokenCorrection?: string;
  /** True on incomplete speech, unclear speech, STT homophones, pronunciation minimal pairs, or meta-commands */
  suppressSpokenCorrection?: boolean;
  coherence?: TranscriptCoherenceResult;
  context?: BuddySessionContext;
  precomputedIntent?: {
    intent: BuddyTurnIntent;
    conversationalIntent: BuddyConversationalIntent;
    extractedTerm?: string;
  };
  longTermMemories?: BuddyMemoryItem[];
  topWeakCategory?: GrammarCategoryCode | null;
  apiKey?: string;
  model?: string;
  /** Fires once when the very first text token arrives */
  onFirstToken?: () => void;
  /** Real-time token streaming callback — fires as soon as each chunk arrives */
  onPartialReply?: (
    fullTextSoFar: string,
    recastMeta?: {
      spokenCorrection: string;
      conversationalResponse: string;
      correctionType: 'none' | 'grammar' | 'naturalness';
    }
  ) => void;
  /** Real-time sentence/safe-clause boundary callback — enables TTS to start speaking immediately! */
  onSentenceReady?: (sentence: string) => void;
}): Promise<BuddyFriendReplyResult> {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let firstTokenAt: number | null = null;
  const {
    userText,
    history,
    personality,
    mode,
    intensity = 'gentle',
    precomputedSpokenCorrection,
    suppressSpokenCorrection = false,
    coherence,
    context,
    precomputedIntent,
    longTermMemories = [],
    topWeakCategory = null,
    apiKey,
    model,
    onFirstToken,
    onPartialReply,
    onSentenceReady
  } = params;

  const personalityCfg = getPersonalityConfig(personality);
  const resolvedCoherence = coherence || validateTranscriptCoherence(userText);
  const ctx = context || extractSessionContext(history, userText);
  const { intent, conversationalIntent, extractedTerm } =
    precomputedIntent || classifyBuddyIntent(userText, ctx, resolvedCoherence);

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
    if (firstTokenAt === null) {
      firstTokenAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
      onFirstToken?.();
    }
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
      conversationalIntent,
      activeTopic: ctx.activeTopic,
      activeSubject: ctx.activeSubject,
      latencyMs: Math.max(1, Math.round(t1 - t0)),
      firstTokenMs: Math.max(1, Math.round((firstTokenAt ?? t1) - t0))
    };
  };

  if (!apiKey || !apiKey.trim()) {
    return finishLocal('local', 'No Gemini API key configured — using Local Friend Engine');
  }

  // Keep last 6 compact turns so context stays complete without unnecessary prompt latency
  const recentTurns = priorHistory
    .slice(-6)
    .map(m => `${m.role === 'user' ? 'User' : 'Buddy'}: ${m.text.slice(0, 220)}`)
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

  const wordMeaningHint =
    intent === 'ask_word_meaning' && extractedTerm
      ? (() => {
          const resolved = resolveAskedWordAgainstContext(
            extractedTerm,
            ctx.lastBuddyMessage,
            ctx.recentBuddyTexts
          );
          return resolved.isPhoneticNearMiss
            ? `CRITICAL WORD-MEANING CONTEXT: The user asked about "${extractedTerm}" right after you used "${resolved.matchedTerm}"! Ask gently if they meant "${resolved.matchedTerm}", explain "${resolved.matchedTerm}" simply, and continue the conversation!`
            : `WORD-MEANING REQUEST: The user is asking the meaning of "${resolved.matchedTerm}" from your conversation. Explain "${resolved.matchedTerm}" clearly in 1 simple sentence and connect back to the topic!`;
        })()
      : null;

  const contextualWord =
    resolvedCoherence.contextualWord ||
    detectContextualWordInterpretation(userText, ctx.lastBuddyMessage || '');
  const contextualWordHint = contextualWord
    ? `CONTEXTUAL WORD INTERPRETATION: Transcript says "${contextualWord.heardWord}", likely meaning "${contextualWord.intendedWord}" (${contextualWord.kind}). Respond naturally while gently confirming "${contextualWord.intendedWord}" (e.g., "Sure! Do you mean your ${contextualWord.intendedWord}? I'd love to hear about it.") and stay on that topic!`
    : null;
  const incompleteHint =
    resolvedCoherence.utteranceCategory === 'incomplete_speech'
      ? `INCOMPLETE SPEECH: The learner paused mid-thought ("${userText}"). Encourage them naturally to finish their sentence${ctx.activeSubject ? ` about ${ctx.activeSubject}` : ''} with ONE relevant question. NEVER say "Take your time" or "I'm all ears"!`
      : null;

  const entityMemory = [
    `Detected Conversational Intention: ${conversationalIntent} (${intent})`,
    wordMeaningHint,
    contextualWordHint,
    incompleteHint,
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

  const shouldGeminiSpeakCorrection =
    !precomputedSpokenCorrection &&
    !suppressSpokenCorrection &&
    resolvedCoherence.quality !== 'unclear' &&
    resolvedCoherence.utteranceCategory !== 'incomplete_speech' &&
    resolvedCoherence.utteranceCategory !== 'stt_error' &&
    resolvedCoherence.utteranceCategory !== 'pronunciation_difficulty' &&
    resolvedCoherence.utteranceCategory !== 'unusual_but_correct';

  const rule1CorrectionInstruction = shouldGeminiSpeakCorrection
    ? intensity === 'detailed'
      ? '1. SPOKEN GRAMMAR COACHING: If the User\'s latest message has ANY grammatical, verb-tense, article, preposition, plural, word-order, or unnatural-phrasing mistake, you MUST tell them first by starting your reply with: You can say, "<natural corrected sentence>." followed by 1 brief plain-English reason, and THEN continue the conversation naturally! If their English is already correct, do NOT output "You can say...".'
      : intensity === 'balanced'
      ? '1. SPOKEN GRAMMAR COACHING: If the User\'s latest message has ANY grammatical, verb-tense, article, preposition, plural, word-order, or unnatural-phrasing mistake, you MUST tell them first by starting your reply with: You can say, "<natural corrected sentence>." (plus at most a 6-word tip if helpful), and THEN immediately continue the conversation! If their English is already correct, do NOT output "You can say...".'
      : '1. SPOKEN GRAMMAR COACHING: If the User\'s latest message has ANY grammatical, verb-tense, article, preposition, plural, word-order, or unnatural-phrasing mistake, you MUST tell them first by starting your reply with: You can say, "<natural corrected sentence>." (no long grammar lecture), and THEN immediately react and ask 1 related follow-up question! If their English is already correct, do NOT output "You can say...".'
    : '1. Do NOT output "You can say..." (either no grammar correction is needed or it was already spoken right before your text). Write ONLY your natural reaction + 1 follow-up question.';

  // Ultra-compact, low-prefill-latency tutor prompt
  const prompt = `You are Lingo Buddy, a friendly, patient English conversation partner for beginner/intermediate learners (${personalityCfg.label}, ${mode}).
Context: ${coherenceNotice}
${entityMemory}
Rules:
${rule1CorrectionInstruction}
2. Use simple, everyday English (no complex idioms or lectures). Ask ONLY ONE simple, relevant follow-up question.
3. Interpret potentially misheard homophones using context (e.g. "my carrier" -> gently confirm "Do you mean your career? I'd love to hear about it."; "recording part/shops" -> coding). Do NOT treat STT homophones as grammar mistakes.
4. If the learner's sentence is incomplete ("About my...", "I was thinking..."), encourage them naturally to finish their thought without correcting grammar. NEVER say "Take your time" or "I'm all ears".
5. On "I didn't understand" / "What do you mean?" / "Can you explain?", rephrase your last question in simpler English + short example (never repeat verbatim).
6. Follow topic changes immediately and maintain the learner's chosen topic. Plain text only.

History:
${recentTurns}
User: ${userText}
Buddy:`;

  const candidateModels = getFastVoiceModelCandidates(model, apiKey);
  if (candidateModels.length === 0) {
    candidateModels.push(...(await discoverFastVoiceModelsForKey(apiKey)));
  }

  let lastFailReason = 'Gemini unavailable';
  let didLiveDiscovery = false;

  for (let idx = 0; idx < candidateModels.length; idx++) {
    const candidateModel = candidateModels[idx];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const generationConfig: Record<string, any> = {
        temperature: 0.55,
        maxOutputTokens: shouldGeminiSpeakCorrection ? 135 : 95
      };
      if (candidateModel.startsWith('gemini-2.5-flash')) {
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
      }

      const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidateModel)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig
        })
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        if (response.status === 404) {
          markDeadGeminiModel(candidateModel, apiKey);
        }
        lastFailReason = `Gemini API HTTP ${response.status} on ${candidateModel}`;
        if (idx === candidateModels.length - 1 && !didLiveDiscovery) {
          didLiveDiscovery = true;
          const discovered = await discoverFastVoiceModelsForKey(apiKey);
          for (const dm of discovered) {
            if (!candidateModels.includes(dm)) candidateModels.push(dm);
          }
        }
        if ([400, 404, 429, 500, 503].includes(response.status)) continue;
        return finishLocal('gemini', `${lastFailReason} — fell back to Local Engine`);
      }

      markVerifiedFastVoiceModel(candidateModel, apiKey);

      let accumulated = '';
      let emittedCursor = 0;

      const emitSentenceSafely = (rawSent: string) => {
        if (!onSentenceReady) return;
        const s = rawSent.trim();
        if (!s) return;
        // Never speak a duplicate recast if Tier-1 already spoke one, or if Gemini echoed the exact input unchanged!
        if (/^(?:you\s+can\s+say|a\s+more\s+natural\s+way\s+to\s+say\s+that\s+is)\b/i.test(s)) {
          if (!shouldGeminiSpeakCorrection) return;
          const check = splitLeadingSpokenRecast(s, userText);
          if (!check.spokenCorrection) return;
        }
        onSentenceReady(stripRepetitiveCliches(s));
      };

      const flushReadySentences = (forceAll: boolean = false) => {
        if (!onSentenceReady) return;
        const cleaned = unwrapWholeOuterQuotes(accumulated.replace(/\*\*/g, ''));
        let remaining = cleaned.slice(emittedCursor);
        if (!remaining.trim()) return;

        if (forceAll) {
          const tail = remaining.trim();
          if (tail) {
            emitSentenceSafely(tail);
            emittedCursor = cleaned.length;
          }
          return;
        }

        // Quote-aware sentence splitter so `You can say, "Yesterday I went shopping." Nice!` flushes Sentence 1 cleanly at `." `!
        while (true) {
          remaining = cleaned.slice(emittedCursor);
          const sentMatch = remaining.match(/^([\s\S]*?[.!?]+["'”’)]*)(?:\s+|$)/);
          if (sentMatch && sentMatch[1].trim().length >= 4) {
            // Wait if an opening quote after "You can say," has not closed yet!
            const candidate = sentMatch[1].trim();
            const doubleQuotes = (candidate.match(/["“”]/g) || []).length;
            if (doubleQuotes === 1 && /^you\s+can\s+say|^a\s+more\s+natural/i.test(candidate)) {
              break;
            }
            emitSentenceSafely(candidate);
            emittedCursor += sentMatch[0].length;
            continue;
          }
          if (emittedCursor === 0 && !/^(?:you\s+can\s+say|a\s+more\s+natural)/i.test(remaining.trim())) {
            const clauseMatch = remaining.match(/^((?:\S+\s+){7,}\S+[,;—])\s+/);
            if (clauseMatch && clauseMatch[1].trim().length >= 28) {
              emitSentenceSafely(clauseMatch[1].trim());
              emittedCursor += clauseMatch[0].length;
              continue;
            }
          }
          break;
        }
      };

      const notifyLivePartial = (rawSoFar: string) => {
        const cleanSoFar = unwrapWholeOuterQuotes(rawSoFar.replace(/\*\*/g, '')).trim();
        if (!cleanSoFar) return;
        if (!shouldGeminiSpeakCorrection) {
          const stripped = cleanSoFar
            .replace(
              /^(?:you\s+can\s+say|a\s+more\s+natural\s+way\s+to\s+say\s+that\s+is),?\s*["'“][^"'”]+["'”][.!?]*\s*/i,
              ''
            )
            .trim();
          if (stripped) onPartialReply?.(stripped);
          return;
        }
        const split = splitLeadingSpokenRecast(cleanSoFar, userText);
        onPartialReply?.(split.cleanedFullText, {
          spokenCorrection: split.spokenCorrection,
          conversationalResponse: split.conversationalResponse,
          correctionType: split.correctionType
        });
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
                if (firstTokenAt === null) {
                  firstTokenAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
                  onFirstToken?.();
                }
                accumulated += delta;
                notifyLivePartial(accumulated);
                flushReadySentences(false);
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
        if (accumulated.trim()) {
          if (firstTokenAt === null) {
            firstTokenAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
            onFirstToken?.();
          }
          notifyLivePartial(accumulated);
          flushReadySentences(true);
        }
      }

      const cleanedAccumulated = stripRepetitiveCliches(
        unwrapWholeOuterQuotes(accumulated.replace(/\*\*/g, ''))
      );

      let finalReply = cleanedAccumulated;
      let extractedSpokenCorrection = '';
      let extractedConversational = cleanedAccumulated;
      let extractedCorrType: 'none' | 'grammar' | 'naturalness' = 'none';

      if (!shouldGeminiSpeakCorrection) {
        finalReply = cleanedAccumulated
          .replace(
            /^(?:you\s+can\s+say|a\s+more\s+natural\s+way\s+to\s+say\s+that\s+is),?\s*["'“][^"'”]+["'”][.!?]*\s*/i,
            ''
          )
          .trim();
        extractedConversational = finalReply;
      } else {
        const split = splitLeadingSpokenRecast(cleanedAccumulated, userText);
        finalReply = split.cleanedFullText;
        extractedSpokenCorrection = split.spokenCorrection;
        extractedConversational = split.conversationalResponse;
        extractedCorrType = split.correctionType;
      }

      if (!finalReply) {
        lastFailReason = 'Gemini returned empty text';
        continue;
      }

      const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        reply: finalReply,
        spokenCorrection: extractedSpokenCorrection || undefined,
        conversationalResponse: extractedConversational || finalReply,
        correctionType: extractedCorrType,
        source: 'gemini',
        providerRequested: 'gemini',
        intent,
        conversationalIntent,
        activeTopic: ctx.activeTopic,
        activeSubject: ctx.activeSubject,
        latencyMs: Math.max(1, Math.round(t1 - t0)),
        firstTokenMs: Math.max(1, Math.round((firstTokenAt ?? t1) - t0))
      };
    } catch (err: any) {
      lastFailReason =
        err?.name === 'AbortError'
          ? 'Gemini timed out (>5.8s)'
          : `Gemini network error (${err?.message || 'unknown'})`;
    }
  }

  return finishLocal('gemini', `${lastFailReason} — fell back to Local Engine`);
}
