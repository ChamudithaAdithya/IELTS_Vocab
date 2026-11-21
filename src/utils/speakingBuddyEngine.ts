/**
 * AI Speaking Buddy (Lingo Buddy) — Phase 1 Conversation & Transcription Engine
 * Layer 1: Conversation Intelligence (listening, understanding, responding like a friend)
 * Phase 1 P0.1 & P0.2 implementation with dual Gemini Cloud + Rich Local Friend fallback.
 */

import type {
  BuddyMessage,
  BuddyMode,
  BuddyModeConfig,
  BuddyPersonality,
  BuddyPersonalityConfig,
  BuddySession
} from '../types/speakingBuddy';
import { punctuateSpokenTranscript } from './speakingEngine';

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

export const BUDDY_TOPIC_STARTERS = [
  {
    id: 'daily',
    label: 'Daily Life',
    prompt: "So, tell me something interesting that happened today — even something small!"
  },
  {
    id: 'uni-tech',
    label: 'University & Tech',
    prompt: "Are you learning anything exciting in university or tech right now? I'd love to hear about it!"
  },
  {
    id: 'travel',
    label: 'Travel & Places',
    prompt: "If you could take a spontaneous trip anywhere this weekend, where would you head?"
  },
  {
    id: 'movies',
    label: 'Movies & Hobbies',
    prompt: "Watched any good movies, series, or picked up a fun hobby recently?"
  }
];

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
    localStorage.setItem(BUDDY_SESSIONS_KEY, JSON.stringify(sessions.slice(0, MAX_STORED_SESSIONS)));
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
    intensity: 'balanced',
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
 * Cleanly formats raw spoken text for Phase 1 P0.2 without altering the speaker's actual grammar.
 * Restores sentence boundaries, capitalization, and natural . , ? ! punctuation.
 */
export function processBuddyTranscript(rawSpeech: string): string {
  return punctuateSpokenTranscript(rawSpeech);
}

/**
 * Generates a natural, warm, context-aware friend reply offline (Local Conversation Engine)
 * when no Gemini API key is connected or if network call times out.
 */
function generateLocalFriendReply(
  userText: string,
  history: BuddyMessage[],
  personality: BuddyPersonality,
  mode: BuddyMode
): string {
  const lower = userText.toLowerCase();
  const prevBuddyTexts = history
    .filter(m => m.role === 'buddy')
    .slice(-3)
    .map(m => m.text.toLowerCase());

  const pickNonRepeating = (options: string[]): string => {
    const fresh = options.filter(opt => !prevBuddyTexts.some(p => p.includes(opt.slice(0, 24).toLowerCase())));
    const pool = fresh.length > 0 ? fresh : options;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // Topic-aware natural friend reactions (never stiff teacher/examiner tone!)
  let coreReply = '';

  if (/\b(shop|shopping|bought|buyed|clothes|dress|shoes|mall|shirt)\b/.test(lower)) {
    coreReply = pickNonRepeating([
      "Oh nice! What kind of clothes did you end up picking out? Were you shopping for something special?",
      "Shopping trips are always fun! Did you find anything you'd been looking for, or was it a spontaneous buy?"
    ]);
  } else if (/\b(university|lecture|college|exam|class|study|studying|assignment|subject|professor)\b/.test(lower)) {
    if (/\b(ai|artificial intelligence|software|coding|programming|react|computer|tech)\b/.test(lower)) {
      coreReply = pickNonRepeating([
        "Oh, that sounds fascinating! Was it more about machine learning concepts or how AI is changing real-world software engineering?",
        "That sounds like a really engaging class! What part of it caught your attention the most?"
      ]);
    } else {
      coreReply = pickNonRepeating([
        "University days can get pretty intense! What was the most interesting part of your lecture or classes today?",
        "Sounds like you've been putting in solid effort! Which subject are you enjoying the most this semester?"
      ]);
    }
  } else if (/\b(tired|exhausted|busy|stress|overwhelmed|lots of work|lot of work|deadline|hectic)\b/.test(lower)) {
    coreReply = pickNonRepeating([
      "Oh, sounds like you had a really busy day! What kept you so occupied?",
      "Whew, you definitely earned a break after that! Are you planning to unwind a bit tonight?"
    ]);
  } else if (/\b(travel|trip|colombo|kandy|galle|beach|country|abroad|vacation|holiday|flight)\b/.test(lower)) {
    coreReply = pickNonRepeating([
      "That sounds like an awesome trip! What was your favourite moment or place you visited there?",
      "I love hearing travel stories! Did you go with friends or family, and what stood out the most to you?"
    ]);
  } else if (/\b(movie|film|series|netflix|music|song|book|game|gaming|cricket|football)\b/.test(lower)) {
    coreReply = pickNonRepeating([
      "Ooh, I'm curious now! What made it stand out to you — the story, the characters, or the overall vibe?",
      "Nice choice! Would you recommend it to a friend, or did it have any surprising twists?"
    ]);
  } else if (/\b(friend|friends|family|parents|brother|sister|dinner|coffee|party|hang out)\b/.test(lower)) {
    coreReply = pickNonRepeating([
      "Spending quality time with people you care about always lifts the mood! What did you all get up to?",
      "That sounds like a great time! Do you get to catch up like that often?"
    ]);
  } else if (/\b(food|eat|ate|cook|cooking|restaurant|lunch|dinner|breakfast|tea|coffee)\b/.test(lower)) {
    coreReply = pickNonRepeating([
      "Now you're making me hungry! Was it homemade or from a favourite spot you like going to?",
      "Good food instantly makes any day better! What's your go-to comfort dish when you want a treat?"
    ]);
  } else if (/\b(how are you|what about you|and you\?|who are you)\b/.test(lower)) {
    coreReply = pickNonRepeating([
      "I'm doing great, thanks for asking! Always happy to chat with you. What's been the highlight of your week so far?",
      "Doing awesome! I'm all ears today — tell me what's been keeping you busy lately."
    ]);
  } else if (mode === 'ielts_partner') {
    coreReply = pickNonRepeating([
      "That's a really interesting perspective! Why do you think that matters so much to people nowadays?",
      "I see what you mean! Has your opinion about this changed compared to a few years ago?"
    ]);
  } else {
    coreReply = pickNonRepeating([
      "That's really interesting! Tell me a bit more about that — how did you feel about how it went?",
      "Oh, I'd love to hear more! What happened next, or what made you think of that today?",
      "I get where you're coming from! Have you always felt that way, or is it something more recent?"
    ]);
  }

  // Light personality flavouring (never stiff or robotic)
  if (personality === 'calm') {
    return `Take your time — ${coreReply.charAt(0).toLowerCase()}${coreReply.slice(1)}`;
  }
  if (personality === 'motivational' && !coreReply.includes('great')) {
    return `${coreReply} You're expressing your thoughts really clearly — keep going!`;
  }
  if (personality === 'funny' && Math.random() < 0.45) {
    return `Haha, fair enough! ${coreReply}`;
  }
  if (personality === 'intellectual' && !/\b(fascinating|perspective)\b/i.test(coreReply)) {
    return `That's a thought-provoking point. ${coreReply}`;
  }

  return coreReply;
}

/**
 * Generates the AI Friend's natural spoken response (Phase 05A — independent from Grammar Analysis).
 * Uses Gemini API when available with a fast 7s timeout, falling back seamlessly to Local Friend Engine.
 */
export async function generateBuddyFriendReply(params: {
  userText: string;
  history: BuddyMessage[];
  personality: BuddyPersonality;
  mode: BuddyMode;
  apiKey?: string;
  model?: string;
}): Promise<{ reply: string; source: 'gemini' | 'local' }> {
  const { userText, history, personality, mode, apiKey, model } = params;
  const personalityCfg = getPersonalityConfig(personality);

  if (!apiKey || !apiKey.trim()) {
    return {
      reply: generateLocalFriendReply(userText, history, personality, mode),
      source: 'local'
    };
  }

  const recentTurns = history
    .slice(-8)
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

  const prompt = `You are "Lingo Buddy", a living AI English-speaking friend.
Personality: ${personalityCfg.label} (${personalityCfg.systemTone}).
Active Mode: ${modeHint}

CRITICAL PERSONA RULES:
1. Respond purely as a warm, genuine friend having a real conversation.
2. NEVER say "Your grammar is incorrect", "You made a mistake", "Please repeat", or give grammar lectures in this reply — grammar feedback is handled silently by a separate UI card.
3. Keep your spoken response concise and natural (2 to 3 short conversational sentences max, ideal for voice playback).
4. Reference what the user actually said and ask 1 natural, engaging follow-up question.
5. Output ONLY your spoken reply text (no quotes, no speaker prefix, no markdown asterisks).

Recent conversation:
${recentTurns}
Friend (User): ${userText}
Lingo Buddy:`;

  let candidateModel = (model || '').trim().replace(/^models\//, '');
  if (!candidateModel || candidateModel.includes('3.8')) {
    candidateModel = 'gemini-2.0-flash';
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidateModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 140 }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        reply: generateLocalFriendReply(userText, history, personality, mode),
        source: 'local'
      };
    }

    const data = await response.json();
    const rawReply = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '')
      .replace(/^["']|["']$/g, '')
      .replace(/\*\*/g, '')
      .trim();

    if (!rawReply) {
      return {
        reply: generateLocalFriendReply(userText, history, personality, mode),
        source: 'local'
      };
    }

    return { reply: rawReply, source: 'gemini' };
  } catch {
    return {
      reply: generateLocalFriendReply(userText, history, personality, mode),
      source: 'local'
    };
  }
}
