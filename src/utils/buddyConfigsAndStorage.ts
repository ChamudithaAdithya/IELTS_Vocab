/**
 * Lingo Buddy Personalities, Conversation Modes, Topic Starters, Session Persistence & Verbatim Punctuation.
 * Extracted from speakingBuddyEngine.ts for modular clarity.
 */

import type {
  BuddyMode,
  BuddyModeConfig,
  BuddyPersonality,
  BuddyPersonalityConfig,
  BuddySession,
  GrammarCategoryCode
} from '../types/speakingBuddy';

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
