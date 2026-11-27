/**
 * Stage A — Transcription Coherence, Incomplete Speech, Contextual Phonetics & Unusual Expression Classifier.
 * Extracted from buddyGrammarEngine.ts for clean modular separation of concerns.
 */

import type {
  BuddyUtteranceCategory,
  ContextualWordInterpretation,
  TranscriptCoherenceResult
} from '../types/speakingBuddy';

/**
 * STAGE A — Transcription Coherence Validator
 * Separates likely STT / microphone mishearings & word salads from genuine learner grammar mistakes.
 * Critical Rule: NEVER label an incoherent transcript as "Clean, natural English".
 */
const CONCRETE_FOOD_OBJECT_NOUNS = new Set([
  'cappuccino', 'espresso', 'latte', 'coffee', 'tea', 'juice', 'milk', 'water', 'soda',
  'potato', 'potatoes', 'mango', 'mangoes', 'banana', 'apple', 'orange', 'tomato', 'onion',
  'ginger', 'garlic', 'rice', 'pasta', 'noodles', 'bread', 'cheese', 'butter', 'chicken',
  'fish', 'meat', 'beef', 'pork', 'egg', 'eggs', 'cake', 'pizza', 'burger', 'sandwich',
  'salad', 'soup', 'curry', 'sugar', 'salt', 'pepper', 'chocolate', 'biscuit', 'cookie',
  'table', 'chair', 'phone', 'laptop', 'shoe', 'shoes', 'shirt', 'car', 'bus', 'train',
  'dog', 'cat', 'bird', 'tree', 'flower', 'book', 'pen', 'bottle', 'window', 'door'
]);

const VALID_COMPOUND_PAIRS = new Set([
  'cooking oil', 'olive oil', 'coconut oil', 'fried rice', 'ice cream', 'orange juice',
  'mango juice', 'apple juice', 'potato curry', 'chicken curry', 'fish curry', 'egg curry',
  'tomato sauce', 'soy sauce', 'garlic bread', 'cheese sandwich', 'coffee shop', 'tea cup',
  'water bottle', 'phone call', 'school bus', 'train station', 'laptop bag', 'chocolate cake',
  'chicken rice', 'beef burger', 'chicken burger', 'egg noodles', 'milk tea', 'ginger tea',
  'lemon tea', 'green tea', 'black coffee', 'iced coffee'
]);

/**
 * Detects unfinished / trailing learner thoughts (e.g. "About my...", "I was thinking...", "Let's talk about...")
 * so Lingo Buddy encourages the learner to continue naturally instead of flagging false grammar mistakes!
 * Preserves complete dependent fragments like "Because I was tired." (no ellipsis, complete predicate) for grammar coaching.
 */
export function detectIncompleteSpeech(transcript: string): {
  isIncomplete: boolean;
  fragment?: string;
  starterKind?: 'about' | 'thinking' | 'wanting' | 'trailing';
} {
  const clean = transcript.trim();
  if (!clean || /\?\s*$/.test(clean)) {
    return { isIncomplete: false };
  }

  // 1. Explicit trailing ellipsis ("About my...", "I was thinking...", "Well, yesterday I...")
  if (/(?:\.\.\.|…)\s*$/.test(clean)) {
    const core = clean.replace(/(?:\.\.\.|…)+\s*$/, '').trim();
    const starterKind = /\b(thinking|wondering)\b/i.test(core)
      ? 'thinking'
      : /^(?:well[,\s]+|so[,\s]+|actually[,\s]+)*(?:about|regarding|talking\s+about)\b/i.test(core)
      ? 'about'
      : /\b(want|wanted|like|trying|going|planning)\s+to\b/i.test(core)
      ? 'wanting'
      : 'trailing';
    return { isIncomplete: true, fragment: core || clean, starterKind };
  }

  const stripped = clean.replace(/[.!]+\s*$/, '').trim();
  const words = stripped.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 10) {
    return { isIncomplete: false };
  }

  // 2. Classic unfinished topic / thought starters even if STT ended them with a period
  if (
    /^(?:well[,\s]+|so[,\s]+|actually[,\s]+|umm?[,\s]+|uh[,\s]+)*(?:about|regarding|concerning|talking\s+about|speaking\s+of)(?:\s+(?:my|your|our|his|her|their|the|a|an|this|that))?$/i.test(
      stripped
    )
  ) {
    return { isIncomplete: true, fragment: stripped, starterKind: 'about' };
  }

  if (
    /^(?:well[,\s]+|so[,\s]+|actually[,\s]+|umm?[,\s]+|uh[,\s]+)*(?:I|we)\s+(?:was|were|am|'m|have\s+been)\s+(?:just\s+)?(?:thinking|wondering|planning|trying|hoping)(?:\s+(?:about|of|to|that))?$/i.test(
      stripped
    ) ||
    /^(?:I'm|I\s+am|I\s+was)\s+(?:just\s+)?(?:thinking|wondering|going\s+to|about\s+to)$/i.test(stripped)
  ) {
    return { isIncomplete: true, fragment: stripped, starterKind: 'thinking' };
  }

  if (
    /^(?:well[,\s]+|so[,\s]+|actually[,\s]+)*(?:I|we)\s+(?:want|wanted|would\s+like|'d\s+like|need|needed)\s+to(?:\s+(?:talk|say|ask|tell\s+you)(?:\s+about)?)?$/i.test(
      stripped
    ) ||
    /^(?:let'?s|can\s+we)\s+(?:talk|chat|speak)\s+about(?:\s+(?:my|the|a|an))?$/i.test(stripped)
  ) {
    return { isIncomplete: true, fragment: stripped, starterKind: 'wanting' };
  }

  // 3. Trailing open syntactic slot at the end of a short statement (possessive, article, subordinator, bare "to")
  // Exclude valid standalone replies like "I think so", "I hope so", "Me too", "Not at all", "Nothing much"
  const VALID_COMPLETE_ENDINGS =
    /^(?:(?:I|we)\s+(?:don'?t\s+)?(?:think|hope|guess|suppose|believe)\s+so|me\s+too|you\s+too|same\s+here|not\s+at\s+all|nothing\s+much|not\s+much|of\s+course|for\s+sure|all\s+right)$/i;
  if (
    !VALID_COMPLETE_ENDINGS.test(stripped) &&
    words.length <= 7 &&
    /\b(?:my|your|our|his|her|their|the|a|an|because|although|while|when|if|into|about|from|with)\s*$/i.test(
      stripped
    )
  ) {
    return { isIncomplete: true, fragment: stripped, starterKind: 'trailing' };
  }

  return { isIncomplete: false };
}

interface ContextualWordRule {
  id: string;
  kind: 'stt_error' | 'pronunciation_difficulty';
  regex: RegExp;
  excludeRegex?: RegExp;
  requireContextRegex?: RegExp;
  extractHeard: (m: RegExpMatchArray) => string;
  intendedWord: string;
  confidence: number;
  phoneticNote: string;
  phoneticNoteSi: string;
  ipaComparison?: string;
}

const CONTEXTUAL_WORD_RULES: ContextualWordRule[] = [
  {
    id: 'stt-carrier-career',
    kind: 'stt_error',
    regex:
      /\b(?:talk\s+about|discuss|about|my|your|our|his|her|their|future|good|great|new|successful|change|switch|build\s+a|choose\s+a|start\s+a|in\s+my)\s+(carrier)\b|\b(carrier)\s+(?:path|goals?|plan|growth|change|development|choice|opportunities)\b/i,
    excludeRegex:
      /\b(aircraft|airline|mobile|network|sim|shipping|cargo|mail|baby|pet|bike|bicycle|luggage|mosquito|disease|water)\b/i,
    extractHeard: m => m[1] || m[2] || 'carrier',
    intendedWord: 'career',
    confidence: 0.96,
    phoneticNote:
      'The transcript captured "carrier", though in this context you almost certainly meant "career" (stress the second syllable: ca-REER).',
    phoneticNoteSi:
      'මයික්‍රෆෝනය "carrier" ලෙස සටහන් කළත්, මෙහි අදහස "career" (වෘත්තීය ජීවිතය — ca-REER ලෙස දෙවන කොටසට බර තබා උච්චාරණය කරන්න) විය හැකියි.',
    ipaComparison: 'career /kəˈrɪər/ vs. carrier /ˈkæriər/'
  },
  {
    id: 'stt-recording-coding',
    kind: 'stt_error',
    regex:
      /\b(?:move\s+(?:on\s+)?to\s+(?:the\s+)?(recording)(?:\s+part|\s+section|\s+shops?)?|(recording)\s+(?:shops?|projects?|languages?|bootcamp|interview|skills?))\b/i,
    excludeRegex: /\b(studio|microphone|audio|song|album|music|voice|camera|video)\b/i,
    extractHeard: m => m[1] || m[2] || 'recording',
    intendedWord: 'coding',
    confidence: 0.94,
    phoneticNote:
      'Speech recognition heard "recording", which in a tech/topic-switch context usually means "coding".',
    phoneticNoteSi:
      'මයික්‍රෆෝනය "recording" ලෙස හඳුනා ගත්තද, මෙම සංවාදයේදී ඔබ අදහස් කළේ "coding" විය හැකියි.',
    ipaComparison: 'coding /ˈkoʊdɪŋ/ vs. recording /rɪˈkɔːrdɪŋ/'
  },
  {
    id: 'stt-coarse-course',
    kind: 'stt_error',
    regex:
      /\b(?:university|college|online|english|coding|degree|training|short|crash|new|taking\s+a|finished\s+a)\s+(coarse)\b/i,
    extractHeard: m => m[1] || 'coarse',
    intendedWord: 'course',
    confidence: 0.98,
    phoneticNote:
      '"Coarse" and "course" sound identical in speech — speech-to-text simply picked the homophone spelling instead of "course".',
    phoneticNoteSi:
      '"Coarse" සහ "course" එකම ලෙස උච්චාරණය වන බැවින් මෙය ව්‍යාකරණ වරදක් නොව හඬ හඳුනාගැනීමේ අක්ෂර වෙනසකි.'
  },
  {
    id: 'stt-desert-dessert',
    kind: 'stt_error',
    regex:
      /\b(?:after\s+(?:dinner|lunch)|for\s+(desert)|sweet\s+(desert)|chocolate\s+(desert)|(?:eat|ate|had|ordered)\s+(?:a\s+|some\s+)?(desert))\b/i,
    excludeRegex: /\b(sahara|sand|camel|arid|oasis)\b/i,
    extractHeard: m => m[1] || m[2] || m[3] || m[4] || 'desert',
    intendedWord: 'dessert',
    confidence: 0.95,
    phoneticNote:
      'In a food context, "desert" is a speech-recognition / stress slip for "dessert" (sweet dish after a meal, stressed on the second syllable: de-ZERT).',
    phoneticNoteSi:
      'ආහාර ගැන කතා කරන විට අතුරුපස සඳහා "dessert" (de-ZERT) යෙදේ — "desert" යනු කාන්තාරයයි.',
    ipaComparison: 'dessert /dɪˈzɜːrt/ vs. desert /ˈdezərt/'
  },
  {
    id: 'stt-board-bored',
    kind: 'stt_error',
    regex: /\b(?:I\s+am|I'm|I\s+was|feel|feeling|got|so|really|very)\s+(board)\b/i,
    excludeRegex: /\b(game|games|member|directors|white|chalk|cutting|exam|notice|room)\b/i,
    extractHeard: m => m[1] || 'board',
    intendedWord: 'bored',
    confidence: 0.98,
    phoneticNote:
      '"Board" and "bored" are exact homophones in spoken English — speech recognition wrote the wrong spelling, not a grammar error.',
    phoneticNoteSi: '"Board" සහ "bored" එකම ශබ්දය ඇති වචන දෙකකි — මෙය ඔබේ ව්‍යාකරණ වරදක් නොවේ.'
  },
  {
    id: 'stt-roll-role',
    kind: 'stt_error',
    regex: /\b(?:my|new|current|job|team|leadership)\s+(roll)\s+(?:at|in|as|on)\b/i,
    excludeRegex: /\b(bread|egg|spring|sushi|cinnamon|paper|drum)\b/i,
    extractHeard: m => m[1] || 'roll',
    intendedWord: 'role',
    confidence: 0.98,
    phoneticNote:
      '"Roll" and "role" sound identical aloud — speech recognition picked "roll" where you meant "role".',
    phoneticNoteSi: '"Roll" සහ "role" එකම ලෙස ශබ්ද වන බැවින් මෙය හඬ පිටපත් කිරීමේ වෙනසක් පමණි.'
  },
  {
    id: 'stt-quiet-quite',
    kind: 'stt_error',
    regex:
      /\b(quiet)\s+(?:busy|tired|interesting|difficult|hard|easy|expensive|good|happy|excited|stressful|fun|late|early|often|a\s+lot|different)\b/i,
    extractHeard: m => m[1] || 'quiet',
    intendedWord: 'quite',
    confidence: 0.95,
    phoneticNote:
      'Before an adjective like "busy" or "interesting", "quiet" (/ˈkwaɪət/, two syllables) is a common STT/pronunciation swap for "quite" (/kwaɪt/, one syllable).',
    phoneticNoteSi:
      'විශේෂණ පදයකට පෙර "තරමක් / බොහෝ දුරට" යන අර්ථයට "quite" (/kwaɪt/) යෙදේ — "quiet" යනු නිශ්ශබ්ද යන්නයි.',
    ipaComparison: 'quite /kwaɪt/ vs. quiet /ˈkwaɪət/'
  },
  {
    id: 'stt-peace-piece',
    kind: 'stt_error',
    regex: /\ba\s+(peace)\s+of\s+(?:cake|advice|work|paper|news|information|bread|pizza|music)\b/i,
    extractHeard: m => m[1] || 'peace',
    intendedWord: 'piece',
    confidence: 0.99,
    phoneticNote: '"Peace" and "piece" sound identical in speech — this is purely an STT homophone spelling.',
    phoneticNoteSi: '"Peace" සහ "piece" එකම ශබ්දය ඇති බැවින් මෙය හඬ හඳුනාගැනීමේ අක්ෂර වෙනසකි.'
  },
  {
    id: 'stt-waist-waste',
    kind: 'stt_error',
    regex: /\b(waist)\s+(?:of\s+time|of\s+money|my\s+time|time|money)\b/i,
    extractHeard: m => m[1] || 'waist',
    intendedWord: 'waste',
    confidence: 0.99,
    phoneticNote: '"Waist" and "waste" are exact homophones — STT wrote the wrong spelling.',
    phoneticNoteSi: '"Waist" සහ "waste" එකම ලෙස උච්චාරණය වන බැවින් මෙය ව්‍යාකරණ වරදක් නොවේ.'
  },
  {
    id: 'pron-leave-live',
    kind: 'pronunciation_difficulty',
    regex:
      /\b(?:I|we|they|my\s+parents|my\s+family)\s+(leave)\s+(?:in|at|near|with\s+my)\s+[A-Za-z]{3,}\b|\bwhere\s+do\s+you\s+(leave)\b/i,
    excludeRegex:
      /\bleave\s+(?:in\s+(?:five|ten|fifteen|twenty|\d+|a\s+few|an?)\s+(?:minutes?|hours?|days?|weeks?)|at\s+\d|for\s+work|home|school|the\s+house)\b/i,
    extractHeard: m => m[1] || m[2] || 'leave',
    intendedWord: 'live',
    confidence: 0.95,
    phoneticNote:
      'It sounds like you meant "live" (short /ɪ/ vowel, like "sit") rather than "leave" (long /iː/ vowel, like "see").',
    phoneticNoteSi:
      '"ජීවත් වෙනවා" යන්නට "live" (/lɪv/ — කෙටි "ඉ" ශබ්දය) යෙදේ. දිගු "ඊ" ශබ්දය යෙදූ විට එය "leave" (පිටත් වෙනවා) ලෙස ඇසේ.',
    ipaComparison: 'live /lɪv/ (short i) vs. leave /liːv/ (long ee)'
  },
  {
    id: 'pron-snake-snack',
    kind: 'pronunciation_difficulty',
    regex:
      /\b(?:eat|ate|eating|had|have|grab|grabbed|quick|light|evening|afternoon|midnight|healthy|sweet)\s+(?:a\s+|some\s+|an\s+)?(snake)\b/i,
    excludeRegex: /\b(venom|cobra|python|bite|bitten|jungle|garden|zoo|reptile)\b/i,
    extractHeard: m => m[1] || 'snake',
    intendedWord: 'snack',
    confidence: 0.96,
    phoneticNote:
      'In a food context, "snake" (/sneɪk/) is a classic vowel slip for "snack" (/snæk/ — open short "a" as in "cat").',
    phoneticNoteSi:
      'කෙටි ආහාරයකට "snack" (/snæk/ — "cat" හි මෙන් කෙටි "ඇ" ශබ්දය) යෙදේ; "snake" (/sneɪk/) යනු සර්පයායි.',
    ipaComparison: 'snack /snæk/ vs. snake /sneɪk/'
  },
  {
    id: 'pron-copy-coffee',
    kind: 'pronunciation_difficulty',
    regex:
      /\b(?:cup\s+of|mug\s+of|drink|drinking|drank|hot|iced|black|morning|fresh)\s+(copy)\b/i,
    extractHeard: m => m[1] || 'copy',
    intendedWord: 'coffee',
    confidence: 0.96,
    phoneticNote:
      'The mic heard "copy" (/p/), though with drinks you likely meant "coffee" (/f/ — touch your top teeth gently to your lower lip for the "f" sound).',
    phoneticNoteSi:
      'පානයක් ගැන කතා කරන බැවින් ඔබ අදහස් කළේ "coffee" (/f/ ශබ්දය — උඩු දත් යටි තොලේ ස්පර්ශ කරමින්) විය හැකියි.',
    ipaComparison: 'coffee /ˈkɒfi/ (/f/) vs. copy /ˈkɒpi/ (/p/)'
  },
  {
    id: 'pron-walk-work',
    kind: 'pronunciation_difficulty',
    regex:
      /\b(walk)\s+(?:from\s+home|as\s+an?\s+[a-z]+|at\s+(?:a\s+company|an?\s+office|a\s+bank|a\s+hospital|a\s+startup))|\blot\s+of\s+(walk)\s+at\s+(?:the\s+)?office\b/i,
    extractHeard: m => m[1] || m[2] || 'walk',
    intendedWord: 'work',
    confidence: 0.94,
    phoneticNote:
      'In an office/job context, "walk" (/wɔːk/) was likely meant as "work" (/wɜːrk/ — central vowel as in "bird").',
    phoneticNoteSi:
      'රැකියාව ගැන කතා කරන විට "work" (/wɜːrk/ — "bird" හි මෙන් ශබ්දය) සහ "walk" (/wɔːk/ — ඇවිදිනවා) අතර ශබ්ද වෙනස ගැන සැලකිලිමත් වන්න.',
    ipaComparison: 'work /wɜːrk/ vs. walk /wɔːk/'
  },
  {
    id: 'pron-tank-thank',
    kind: 'pronunciation_difficulty',
    regex: /\b(tank)\s+you\b|\b(tanks)\s+(?:a\s+lot|so\s+much)\b/i,
    extractHeard: m => m[1] || m[2] || 'tank',
    intendedWord: 'thank',
    confidence: 0.97,
    phoneticNote:
      'The mic heard "tank" (/t/) for "thank" (/θ/ — place your tongue tip lightly between your teeth for soft "th").',
    phoneticNoteSi:
      '"Thank" උච්චාරණයේදී දිවේ අග දත් අතර මෘදුව තබා /θ/ ("ත" මෘදු ශබ්දය) පිට කරන්න.',
    ipaComparison: 'thank /θæŋk/ vs. tank /tæŋk/'
  },
  {
    id: 'pron-tree-three',
    kind: 'pronunciation_difficulty',
    regex: /\b(tree)\s+(?:years?|months?|weeks?|days?|hours?|minutes?|times?|people|friends|brothers|sisters)\b/i,
    extractHeard: m => m[1] || 'tree',
    intendedWord: 'three',
    confidence: 0.95,
    phoneticNote:
      'Before a number unit, "tree" (/t/) was likely meant as "three" (/θr/ — soft "th" with air flowing past the tongue tip).',
    phoneticNoteSi:
      'සංඛ්‍යාවක් කීමේදී "three" (/θriː/) සහ "tree" (/triː/ — ගස) අතර "th" ශබ්ද වෙනස හුරු වන්න.',
    ipaComparison: 'three /θriː/ vs. tree /triː/'
  }
];

export function detectContextualWordInterpretation(
  transcript: string,
  conversationContext: string = ''
): ContextualWordInterpretation | undefined {
  const clean = transcript.trim();
  if (!clean) return undefined;
  const combinedCtx = `${conversationContext} ${clean}`;

  for (const rule of CONTEXTUAL_WORD_RULES) {
    if (rule.excludeRegex && rule.excludeRegex.test(combinedCtx)) continue;
    if (rule.requireContextRegex && !rule.requireContextRegex.test(conversationContext)) continue;
    const match = clean.match(rule.regex);
    if (match) {
      const heardWord = rule.extractHeard(match);
      const intendedWord =
        heardWord.toLowerCase() === 'tanks' ? 'thanks' : rule.intendedWord;
      return {
        heardWord,
        intendedWord,
        kind: rule.kind,
        confidence: rule.confidence,
        phoneticNote: rule.phoneticNote,
        phoneticNoteSi: rule.phoneticNoteSi,
        ipaComparison: rule.ipaComparison
      };
    }
  }
  return undefined;
}

/**
 * Recognizes grammatically valid formal, literary, inverted, or creative expressions
 * so Lingo Buddy celebrates valid unusual phrasing instead of over-correcting it.
 */
export function detectUnusualButCorrectExpression(transcript: string): boolean {
  const clean = transcript.trim();
  if (!clean) return false;
  return (
    /^(?:seldom|rarely|scarcely|hardly\s+ever|never\s+before)\s+(?:do|did|have|had|am|is|are|was|were)\s+(?:I|we|they|he|she)\b/i.test(
      clean
    ) ||
    /\b(thrice|fortnight|partake|fondness\s+for|my\s+abode|solitude\s+(?:suits|rejuvenates)|commence|endeavou?r\s+to|whilst|ought\s+to|shan't|peruse)\b/i.test(
      clean
    )
  );
}

export function validateTranscriptCoherence(
  transcript: string,
  uncertainWords: string[] = [],
  sttConfidence?: number,
  conversationContext: string = ''
): TranscriptCoherenceResult {
  const clean = transcript.trim();
  if (!clean) {
    return { quality: 'unclear', reason: 'Empty transcript.', utteranceCategory: 'unclear_speech' };
  }

  // Stage A0: Check for natural unfinished/trailing speech FIRST (e.g. "About my...", "I was thinking...")
  // Incomplete speech is NOT garbled noise and NOT a grammatical error!
  const incompleteCheck = detectIncompleteSpeech(clean);
  if (incompleteCheck.isIncomplete) {
    const frag = incompleteCheck.fragment || clean;
    return {
      quality: 'partially_unclear',
      utteranceCategory: 'incomplete_speech',
      incompleteFragment: frag,
      reason: 'Incomplete sentence — learner paused or trailed off mid-thought.',
      clarificationHint:
        'No grammar mistake here — it sounds like you were still finishing your thought. Go ahead and continue!'
    };
  }

  const contextualWord = detectContextualWordInterpretation(clean, conversationContext);

  const lower = clean.toLowerCase();
  const tokens = lower
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const suspiciousSpans: string[] = [];
  let hardGarbleScore = 0;

  // 1. Impossible double modals (e.g. "must will be", "can will", "should must")
  // Note: "maybe will" is a real learner adverb+modal error handled by Stage B, NOT a double modal!
  const doubleModalMatch = clean.match(
    /\b(must|should|might|could|would|can|may)\s+(will|would|shall|can|must|could)\b/i
  );
  if (doubleModalMatch) {
    hardGarbleScore += 2;
    suspiciousSpans.push(doubleModalMatch[0]);
  }

  // 2. Stacked 3+ unrelated concrete nouns with no verb/conjunction/preposition (e.g. "cappuccino potato mango")
  for (let i = 0; i <= tokens.length - 3; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    const c = tokens[i + 2];
    if (
      CONCRETE_FOOD_OBJECT_NOUNS.has(a) &&
      CONCRETE_FOOD_OBJECT_NOUNS.has(b) &&
      CONCRETE_FOOD_OBJECT_NOUNS.has(c)
    ) {
      const pair1 = `${a} ${b}`;
      const pair2 = `${b} ${c}`;
      if (!VALID_COMPOUND_PAIRS.has(pair1) && !VALID_COMPOUND_PAIRS.has(pair2)) {
        hardGarbleScore += 3;
        suspiciousSpans.push(`${a} ${b} ${c}`);
        break;
      }
    }
  }

  // 3. Nonsensical STT collisions / word salads seen in live mics
  const noNothingMatch = clean.match(/\bno\s+nothing\s+[a-z]+(?:ing)?\s+thing\b/i);
  if (noNothingMatch) {
    hardGarbleScore += 3;
    suspiciousSpans.push(noNothingMatch[0]);
  }

  const restingThingMatch = clean.match(/\b(?:nothing\s+)?resting\s+thing\b/i);
  if (
    restingThingMatch &&
    !suspiciousSpans.some(s => s.toLowerCase().includes(restingThingMatch[0].toLowerCase()))
  ) {
    hardGarbleScore += 2;
    suspiciousSpans.push(restingThingMatch[0]);
  }

  const thinkHappenMatch = clean.match(/\bI\s+think\s+happen\b/i);
  if (thinkHappenMatch) {
    hardGarbleScore += 2;
    suspiciousSpans.push(thinkHappenMatch[0]);
  }

  // Stem-echo STT loop & impossible modifier (e.g. "Promote spot that I got promoted food")
  const promotedFoodMatch = clean.match(/\bpromoted\s+(food|meal|rice|curry|water|coffee|tea)\b/i);
  if (promotedFoodMatch) {
    hardGarbleScore += 3;
    suspiciousSpans.push(promotedFoodMatch[0]);
  }
  const echoLoopMatch = clean.match(/\b([a-z]{5,})\s+[a-z]{2,}\s+that\s+I\s+got\s+\1(?:ed|ing|s)?\b/i);
  if (echoLoopMatch) {
    hardGarbleScore += 2;
    suspiciousSpans.push(echoLoopMatch[0]);
  }

  // Triple immediate token stutter ("the the the" / "what what what")
  const tripleRepeat = clean.match(/\b([a-z']{2,})\s+\1\s+\1\b/i);
  if (tripleRepeat) {
    hardGarbleScore += 2;
    suspiciousSpans.push(tripleRepeat[0]);
  }

  // 3B. General Broken-Syntax / Garbled STT Collision Detector (catches arbitrary mic word salads!)
  // Non-English en-IN STT bleed tokens (standalone or mixed into an English sentence, e.g., "Main hun.", "Ek.", "Kunjit.", "Koi natural...")
  const standaloneForeignBleed = clean.match(
    /^\s*(?:main\s+hun|hun|ek|amma|kunjit|kya|nahi|hai|koi|achha|mokada|ane|eka)[.!?,\s]*$/i
  );
  if (standaloneForeignBleed) {
    hardGarbleScore += 3;
    suspiciousSpans.push(clean);
  }
  const foreignSttBleed = clean.match(/\b(koi|kya|hai|nahi|achha|mokada|ane|eka|main\s+hun)\b/i);
  if (foreignSttBleed && !standaloneForeignBleed && tokens.length >= 2) {
    hardGarbleScore += 2;
    suspiciousSpans.push(foreignSttBleed[0]);
  }

  // Truncated mid-sentence cutoff ending on a dangling preposition/conjunction (e.g., "...playing multiplayer with.")
  const truncatedEnding = clean.match(/\b(?:with|because|and|but|while|although|about|from|into)\s*[.]?\s*$/i);
  if (truncatedEnding && tokens.length >= 4 && !/\?$/.test(clean)) {
    hardGarbleScore += 2;
    suspiciousSpans.push(truncatedEnding[0].trim());
  }

  // 3C. Impossible Pronoun + Unrelated Noun/Base-Verb + Finite Past/Aux Collision (e.g. "I rain got you", "we table went")
  // Excludes valid adverbs and auxiliaries/modals so valid English ("You have got it", "I just got it") never false-triggers
  const impossiblePronounCollision = clean.match(
    /\b(I|you|we|they|he|she)\s+(?!(?:just|really|never|always|already|almost|still|also|even|only|often|usually|sometimes|probably|definitely|actually|basically|honestly|literally|simply|nearly|hardly|barely|all|both|each|have|has|had|can|could|will|would|shall|should|may|might|must|did|does|not|who|that)\b)([a-z]{3,})\s+(got|went|came|saw|did|ate|took|made|gave|knew|thought|said|told|found|left|felt|was|were|am|is|are|had)\s+(you|me|it|him|her|us|them|there|here)\b/i
  );
  if (impossiblePronounCollision) {
    hardGarbleScore += 3;
    suspiciousSpans.push(impossiblePronounCollision[0]);
  }

  // Impossible Article + Finite Auxiliary/Past Verb ("the had a party", "a went home")
  const impossibleArticleAux = clean.match(/\b(the|a|an)\s+(had|was|were|did|went|got|am|are)\s+(?:a|an|the|my|our|to)\b/i);
  if (impossibleArticleAux) {
    hardGarbleScore += 2;
    suspiciousSpans.push(impossibleArticleAux[0]);
  }

  // 3D. Per-Sentence Incomplete / Dangling Fragment Check (catches "Much into. Nothing much.")
  const VALID_SHORT_CONVERSATIONAL_FRAGMENTS = /^(?:yes|yeah|yep|yup|no|nope|nah|not\s+really|not\s+much|nothing\s+much|nothing\s+special|not\s+yet|of\s+course|sure|sure\s+thing|okay|ok|alright|all\s+right|maybe|maybe\s+later|maybe\s+tomorrow|sounds\s+good|sounds\s+great|good\s+idea|fair\s+enough|thank\s+you|thanks|thanks\s+a\s+lot|hi|hello|hey|good\s+morning|good\s+evening|good\s+night|see\s+you|by\s+the\s+way|me\s+too|same\s+here|why\s+not|no\s+worries|no\s+problem|for\s+sure|a\s+little\s+bit|just\s+a\s+little|just\s+relaxing|just\s+chilling|(?:for\s+)?(?:about\s+)?[a-z0-9]+\s+(?:people|hours|days|minutes|years|weeks)|like\s+[a-z0-9\s]{2,20}|in\s+the\s+(?:morning|evening|afternoon)|at\s+(?:home|work|night|school|university))$/i;

  const subSentences = clean
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(Boolean);

  let detectedIncompleteFragment: string | undefined;
  for (const sub of subSentences) {
    const subWords = sub.split(/\s+/).filter(Boolean);
    if (subWords.length >= 1 && subWords.length <= 3 && !VALID_SHORT_CONVERSATIONAL_FRAGMENTS.test(sub)) {
      // Flag 1-3 word fragments ending in a preposition/auxiliary/determiner ("Much into", "What I am", "My", "With a")
      if (
        /\b(into|with|from|about|for|onto|upon|without|between|through|under|over|am|is|are|was|were|have|has|had|my|your|our|their|his|her|the|a|an|very|much|so|too)$/i.test(
          sub
        ) ||
        /^(much|very|so|too|also|because|although|while|when|if)\s+[a-z]+$/i.test(sub)
      ) {
        detectedIncompleteFragment = sub;
        hardGarbleScore += 2;
        suspiciousSpans.push(sub);
        break;
      }
    }
  }

  // Impossible English verb/preposition chains produced by corrupted STT ("make going like out my pic night")
  const brokenVerbChain = clean.match(
    /\b(?:make|take|get|give|put|keep|let)\s+(?:going|coming|running|doing|saying|working)\b/i
  );
  if (brokenVerbChain) {
    hardGarbleScore += 2;
    suspiciousSpans.push(brokenVerbChain[0]);
  }

  const brokenPrepPossessive = clean.match(
    /\b(?:like|going|coming)\s+out\s+(?:my|your|his|her|our|their)\b|\bout\s+my\s+(?:pic|pick|night|day|time)\b/i
  );
  if (brokenPrepPossessive) {
    hardGarbleScore += 2;
    suspiciousSpans.push(brokenPrepPossessive[0]);
  }

  // Unlinked run-on STT collision: statement slamming directly into "how to ..." / "what to ..." with no punctuation
  const unlinkedHowToCollision = clean.match(
    /\b(?:detected|mistakes|english|thing|happened|yesterday|today)\s+(?:how|what|where)\s+to\s+[a-z]+\s+[a-z]+ing\b/i
  );
  if (unlinkedHowToCollision) {
    hardGarbleScore += 2;
    suspiciousSpans.push(unlinkedHowToCollision[0]);
  }

  // 4. Severe low STT confidence from speech engine
  if (typeof sttConfidence === 'number' && sttConfidence > 0 && sttConfidence < 0.55) {
    hardGarbleScore += 3;
  }
  if (tokens.length >= 3 && uncertainWords.length > 0) {
    const ratio = uncertainWords.length / tokens.length;
    if (ratio >= 0.5) {
      hardGarbleScore += 2;
      suspiciousSpans.push(...uncertainWords.slice(0, 3));
    }
  }

  if (hardGarbleScore >= 3) {
    const quoted = suspiciousSpans.length > 0 ? `"${suspiciousSpans.slice(0, 2).join(' ... ')}"` : `"${clean}"`;
    return {
      quality: 'unclear',
      reason: `Parts of the speech capture (${quoted}) don't form a clear English meaning — likely a microphone or transcription slip.`,
      suspiciousSpans,
      clarificationHint:
        suspiciousSpans.length > 0
          ? `It came through as ${quoted}. Could you repeat that or click Edit to fix any misheard words?`
          : `I'm not sure I caught that clearly. Could you say it again or click Edit?`
    };
  }

  // 5. Partially unclear: overall meaning IS recoverable, but one specific phrase looks like an STT slip
  const whenQuestionCookMatch = clean.match(
    /\bwhen\s+I\s+question\b(?=.*\b(?:put|add|cook|cooking|ginger|oil|garlic|onion|fry|boil|heat|pan|pot)\b)/i
  );
  if (whenQuestionCookMatch) {
    return {
      quality: 'partially_unclear',
      reason: '"when I question" sounds like a speech-recognition slip (possibly "when I start cooking" or "when I cook").',
      suspiciousSpans: [whenQuestionCookMatch[0]],
      clarificationHint: 'I understood the cooking steps, though "when I question" sounded like a mic slip for "when I start cooking".'
    };
  }

  if (hardGarbleScore === 2) {
    return {
      quality: 'partially_unclear',
      utteranceCategory: detectedIncompleteFragment ? 'incomplete_speech' : undefined,
      contextualWord,
      reason: detectedIncompleteFragment
        ? `The fragment "${detectedIncompleteFragment}" looks incomplete or cut off.`
        : `Part of the sentence (${suspiciousSpans.join(', ')}) sounded unclear.`,
      suspiciousSpans,
      incompleteFragment: detectedIncompleteFragment,
      clarificationHint: detectedIncompleteFragment
        ? `Part of your speech ("${detectedIncompleteFragment}") sounded cut off or incomplete — could you clarify what you meant?`
        : `Part of that sounded unclear (${suspiciousSpans.join(', ')}) — check if the mic misheard a word.`
    };
  }

  return {
    quality: 'clear',
    utteranceCategory: contextualWord ? contextualWord.kind : undefined,
    contextualWord
  };
}
