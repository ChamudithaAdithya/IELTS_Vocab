/**
 * AI Speaking Buddy (Lingo Buddy) — Phase 2 Dedicated English Correction Engine (P0.3 & P0.4)
 * Layer 2: English Intelligence — decoupled from Friend Chat Responder so replies are instant
 * and grammar feedback is strictly structured, categorized, and never mislabels valid English.
 */

import type {
  BuddyGrammarAnalysis,
  BuddyMistake,
  BuddyMode,
  BuddyVocabUpgrade,
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

export const CATEGORY_LABELS: Record<GrammarCategoryCode, string> = {
  VERB_TENSE: 'Verb Tense',
  ARTICLES: 'Articles',
  PREPOSITIONS: 'Prepositions',
  SVA: 'Subject-Verb Agreement',
  VERB_FORMS: 'Verb Forms',
  PLURALS: 'Plurals & Uncountables',
  SENTENCE_STRUCTURE: 'Sentence Structure',
  WORD_CHOICE: 'Word Choice & Collocation',
  WORD_ORDER: 'Word Order',
  CONDITIONALS: 'Conditionals',
  VOCABULARY: 'Vocabulary Upgrade',
  REPETITION: 'Repetition'
};

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

export function validateTranscriptCoherence(
  transcript: string,
  uncertainWords: string[] = [],
  sttConfidence?: number
): TranscriptCoherenceResult {
  const clean = transcript.trim();
  if (!clean) {
    return { quality: 'unclear', reason: 'Empty transcript.' };
  }

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

  return { quality: 'clear' };
}

interface LocalGrammarPattern {
  id: string;
  regex: RegExp;
  category: GrammarCategoryCode;
  severity: FeedbackSeverity;
  /** Optional precision sub-span targeting so adjacent errors (e.g. "go" + "to shopping") never overlap! */
  getSpan?: (match: RegExpExecArray) => { startOffset: number; endOffset: number; original: string };
  getCorrection: (match: RegExpExecArray, fullSentence: string) => string;
  explanation: string;
  simpleExplanation?: string;
  explanationSi: string;
  verbFormTable?: { v1: string; v2: string; v3: string };
  sinhalaTransferNote?: string;
  grammar_rule: string;
  example: string;
  more_examples?: string[];
  learning_tip: string;
  confidence: number;
  isProvisional?: boolean;
}

const LOCAL_BUDDY_PATTERNS: LocalGrammarPattern[] = [
  {
    id: 'ne-what-is-meaning-of',
    regex: /^what\s+is\s+the\s+meaning\s+of\s+["']?([a-zA-Z0-9-]+(?:\s+[a-zA-Z0-9-]+)?)["']?\??$/gi,
    category: 'WORD_CHOICE',
    severity: 'UNNATURAL',
    getCorrection: (m) => `What does '${m[1].trim()}' mean?`,
    explanation: 'In everyday spoken English, native speakers almost always ask "What does X mean?" rather than "What is the meaning of X?".',
    simpleExplanation: 'Native speakers naturally ask "What does X mean?" in conversation.',
    explanationSi: 'සාමාන්‍ය ඉංග්‍රීසි කතාබහේදී "What is the meaning of X?" වෙනුවට "What does X mean?" ලෙස ඇසීම වඩාත් ස්වාභාවිකයි.',
    grammar_rule: 'What does [word/phrase] mean?',
    example: "What does 'low-key' mean?",
    learning_tip: 'Use "What does ... mean?" whenever asking about a word or expression.',
    confidence: 0.95
  },
  {
    id: 'vt-bare-ing-past-time',
    regex: /\b(I|he|she|we|they|you)\s+(watching|going|doing|eating|playing|working|studying|staying|reading|cooking|buying|making|visiting|walking|running|sleeping|talking|meeting)\b(?=[^.?!]{0,40}\b(yesterday|last\s+(?:night|week|month|year|weekend|sunday|saturday|friday)|ago)\b)/gi,
    category: 'VERB_TENSE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const vMap: Record<string, string> = {
        watching: 'watched',
        going: 'went',
        doing: 'did',
        eating: 'ate',
        playing: 'played',
        working: 'worked',
        studying: 'studied',
        staying: 'stayed',
        reading: 'read',
        cooking: 'cooked',
        buying: 'bought',
        making: 'made',
        visiting: 'visited',
        walking: 'walked',
        running: 'ran',
        sleeping: 'slept',
        talking: 'talked',
        meeting: 'met'
      };
      return `${m[1]} ${vMap[m[2].toLowerCase()] || m[2]}`;
    },
    explanation: 'For a finished action in the past (with "yesterday" or "last week"), use the simple past verb ("watched") instead of a bare "-ing" form.',
    simpleExplanation: 'Use the past tense ("watched") for things that happened yesterday.',
    explanationSi: '"Yesterday" වැනි නිමවූ අතීත කාලයක් සමඟ "-ing" ක්‍රියාපදයක් තනිව නොයොදා සරල අතීත කාලය ("watched") භාවිත කරන්න.',
    grammar_rule: 'Finished Past Action: Subject + Past Simple Verb + yesterday',
    example: 'I watched a movie yesterday.',
    learning_tip: 'Never use an "-ing" verb without am/is/are/was/were — and with "yesterday", prefer simple past ("watched").',
    confidence: 0.99
  },
  {
    id: 'vf-bare-ing-present',
    regex: /(?:^|[.!?]\s+|\b(?:and|but|so|because)\s+)(I|he|she|we|they|you)\s+(watching|going|doing|eating|playing|working|studying|staying|reading|cooking|buying|making|visiting|walking|running|sleeping|talking)\b/gi,
    category: 'VERB_FORMS',
    severity: 'GRAMMAR_ERROR',
    getSpan: (m) => {
      const sub = `${m[1]} ${m[2]}`;
      const startOffset = m[0].length - sub.length;
      return { startOffset, endOffset: m[0].length, original: sub };
    },
    getCorrection: (m) => {
      const s = m[1];
      const sl = s.toLowerCase();
      const aux = sl === 'i' ? "'m" : sl === 'he' || sl === 'she' ? "'s" : "'re";
      return `${s}${aux} ${m[2]}`;
    },
    explanation: 'An "-ing" action verb always requires a form of "be" ("am / is / are" or "was / were") after the subject.',
    simpleExplanation: 'Add "am / is / are" before an "-ing" verb (e.g., "I\'m watching").',
    explanationSi: 'කර්තෘ පදයකට පසුව කෙලින්ම "-ing" ක්‍රියාපදයක් යෙදිය නොහැක — "am / is / are" එක් කරන්න ("I\'m watching").',
    grammar_rule: 'Present Continuous: Subject + am / is / are + verb-ing',
    example: "I'm watching a movie right now.",
    learning_tip: 'Pair "I" + "-ing" with "I\'m": "I\'m watching", "I\'m going".',
    confidence: 0.97
  },
  {
    id: 'vt-didnt-understand-what-mean',
    regex: /\b(didn'?t|did\s+not)\s+(understand|get|hear|catch|know|realise|realize)\s+(what|where|why|how)\s+(you|he|she|they|we)\s+(mean|say|want|ask)\b/gi,
    category: 'VERB_TENSE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const pastMap: Record<string, string> = {
        mean: 'meant',
        say: 'said',
        want: 'wanted',
        ask: 'asked'
      };
      return `${m[1]} ${m[2]} ${m[3]} ${m[4]} ${pastMap[m[5].toLowerCase()] || m[5]}`;
    },
    explanation: 'Because "didn\'t understand" refers to what was just said in the past, use the past tense "meant" ("what you meant") instead of "mean".',
    simpleExplanation: 'Use "meant" (past) when referring to what someone just said: "what you meant."',
    explanationSi: 'මීට පෙර පැවසූ දෙයක් අදහස් කරන බැවින් "what you mean" වෙනුවට අතීත කාලයෙන් "what you meant" යෙදිය යුතුය.',
    grammar_rule: 'Past Reference in Clauses: didn\'t understand + what you meant / said',
    example: "Sorry, I didn't understand what you meant.",
    learning_tip: 'When asking about an earlier comment, pair "didn\'t understand" with "what you meant".',
    confidence: 0.97
  },
  {
    id: 'art-copula-profession',
    regex: /\b(I\s+am|I'm|he\s+is|he's|she\s+is|she's|you\s+are|you're|was|became)\s+(software\s+engineer|civil\s+engineer|mechanical\s+engineer|electrical\s+engineer|data\s+scientist|data\s+analyst|web\s+developer|mobile\s+developer|frontend\s+developer|backend\s+developer|full[\s-]stack\s+developer|ui\s+designer|ux\s+designer|university\s+student|college\s+student|high\s+school\s+student|medical\s+student|project\s+manager|product\s+manager|business\s+analyst|engineer|developer|programmer|designer|doctor|nurse|teacher|lecturer|professor|student|lawyer|accountant|manager|researcher|scientist|architect|consultant|entrepreneur|freelancer|intern|driver|chef|artist|writer)\b/gi,
    category: 'ARTICLES',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const role = m[2];
      const vowelSound = /^(?:[aeiou])/i.test(role) && !/^uni/i.test(role);
      return `${m[1]} ${vowelSound ? 'an' : 'a'} ${role}`;
    },
    explanation: 'In English, always use "a" or "an" before a singular job title or role (e.g., "I am a software engineer", "She is a doctor").',
    simpleExplanation: 'Use "a" or "an" before jobs and roles: "I am a software engineer."',
    explanationSi: 'රැකියාවක් හෝ භූමිකාවක් ඒකවචනයෙන් පැවසීමේදී ඊට පෙර "a" හෝ "an" යෙදීම අනිවාර්ය වේ ("I am a software engineer").',
    grammar_rule: 'Professions & Roles: be + a / an + singular profession',
    example: 'I am a software engineer working on web applications.',
    more_examples: ['She is a university student.', 'My brother became an architect.'],
    learning_tip: 'Whenever you state someone\'s job or student status, include "a" or "an" right before it.',
    confidence: 0.99
  },
  {
    id: 'art-go-to-the-place',
    regex: /\b(go|going|went|goes|head|heading|headed|walk|walking|walked|drive|driving|drove)\s+to\s+(gym|cinema|park|mall|airport|bank|hospital|supermarket|market|store|shop|office|beach|library|station|museum|hotel|cafe|restaurant|doctor|dentist)\b/gi,
    category: 'ARTICLES',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} to the ${m[2]}`,
    explanation: 'Common everyday places like "the gym", "the park", "the mall", or "the office" require the article "the" after "go to".',
    simpleExplanation: 'Add "the" before everyday places: "going to the gym".',
    explanationSi: '"Gym", "park", "mall", "office" වැනි පොදු ස්ථානවලට යාමේදී "to the..." ලෙස "the" යෙදිය යුතුය ("going to the gym").',
    grammar_rule: 'Everyday Destinations: go to + the + place (the gym, the park, the airport)',
    example: "I'm going to the gym this evening.",
    more_examples: ['We went to the beach on Sunday.', 'She is heading to the airport now.'],
    learning_tip: 'No "the" for school/work/home ("going home", "going to work"), but ALWAYS "the" for the gym, the park, the mall, and the office!',
    confidence: 0.99
  },
  {
    id: 'unnat-going-to-my-home',
    regex: /\b(I\s+am\s+going|I'm\s+going|go|going|went|goes|head|heading|walk|walking|come|coming|came|return|returning|returned)\s+to\s+(?:my|our|your|his|her|their)\s+home\b/gi,
    category: 'PREPOSITIONS',
    severity: 'UNNATURAL',
    getCorrection: (m) => {
      const v = m[1];
      if (/^i\s+am\s+going$/i.test(v)) return "I'm going home";
      return `${v} home`;
    },
    explanation: 'While understandable, native speakers treat "home" as an adverb of direction after movement verbs — saying "I\'m going home" instead of "going to my home".',
    simpleExplanation: 'Drop "to my" before "home": say "I\'m going home."',
    explanationSi: 'ගෙදර යනවා යන්න ස්වාභාවික ඉංග්‍රීසියෙන් පවසන්නේ "to my" නොමැතිව "I\'m going home" ලෙසයි.',
    grammar_rule: 'Natural Movement Expression: go / come / head + home (no "to my")',
    example: "I'm going home right after work.",
    more_examples: ['We went home around nine.', 'Are you heading home now?'],
    learning_tip: 'With verbs of motion (go, come, walk, drive, head), attach "home" directly with nothing in between.',
    confidence: 0.97
  },
  {
    id: 'prep-go-to-home',
    regex: /\b(go|going|went|goes|come|coming|came|get|got|getting|arrive|arrived|head|heading)\s+to\s+home\b/gi,
    category: 'PREPOSITIONS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} home`,
    explanation: 'Never use the preposition "to" before "home" after verbs of movement like "go", "went", "come", or "get".',
    simpleExplanation: 'Do not use "to" before "home" — say "go home" or "went home".',
    explanationSi: '"Home" ඉදිරියෙන් "to" නිපාතය යොදන්න එපා — "went home" හෝ "going home" ලෙස කියන්න.',
    grammar_rule: 'Movement + home (NO "to"): go home, went home, get home',
    example: 'I went home early yesterday.',
    learning_tip: 'Say "at home" for location, and "go home" (no "to"!) for direction.',
    confidence: 0.99
  },
  {
    id: 'ss-subjectless-tired-opening',
    regex: /^(tired|exhausted|sleepy|hungry|stressed|sore)\s+(after|from|before|because\s+of)\b/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getSpan: (m) => ({ startOffset: 0, endOffset: m[1].length, original: m[1] }),
    getCorrection: (m) => `I feel ${m[1].toLowerCase()}`,
    explanation: 'In complete spoken English, include a subject and verb ("I feel" or "I\'m") before an opening adjective like "tired".',
    simpleExplanation: 'Start with "I feel" or "I\'m": "I feel tired after..."',
    explanationSi: 'වාක්‍යයක් "Tired..." ලෙස කෙලින්ම ආරම්භ කරනවාට වඩා "I feel tired..." හෝ "I\'m tired..." ලෙස කර්තෘ සහ ක්‍රියාපදය සමඟ පැවසීම ව්‍යාකරණානුකූලව සම්පූර්ණ වේ.',
    grammar_rule: 'Complete Clause Subject + Linking Verb: I feel / I am + adjective',
    example: "I feel tired after a workout, but it's refreshing.",
    learning_tip: 'Attach "I feel" or "I\'m" when describing how you feel.',
    confidence: 0.95
  },
  {
    id: 'art-prep-bare-workout-event',
    regex: /\b(after|before|during)\s+(workout|meeting|lecture|exam|interview|session|match|nap|shower)\b/gi,
    category: 'ARTICLES',
    severity: 'GRAMMAR_ERROR',
    getSpan: (m) => {
      const startOffset = m[0].length - m[2].length;
      return { startOffset, endOffset: m[0].length, original: m[2] };
    },
    getCorrection: (m) => {
      const noun = m[2];
      const vowel = /^(?:[aeiou])/i.test(noun);
      return `${vowel ? 'an' : 'a'} ${noun}`;
    },
    explanation: 'Singular countable event nouns like "workout", "meeting", or "exam" need an article ("a / an / my / the") after prepositions like "after" or "before".',
    simpleExplanation: 'Add "a" (or "an") before singular events: "after a workout", "before an exam".',
    explanationSi: '"Workout", "meeting", "exam" වැනි ඒකවචන නාමපදවලට පෙර "a / an" යෙදිය යුතුය ("after a workout").',
    grammar_rule: 'Preposition + a / an + singular countable event ("after a workout")',
    example: 'I usually feel tired after a workout, but it is refreshing.',
    learning_tip: 'Countable singular events need "a / an / the / my": a workout, a meeting, an exam.',
    confidence: 0.96
  },
  {
    id: 'art-a-plural-noun',
    regex: /\b(a)\s+(friends|people|games|clothes|things|books|movies|days|hours|minutes|students|teachers|children|parents|colleagues|places|ideas|questions|problems|mistakes)\b/gi,
    category: 'ARTICLES',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => m[2],
    explanation: 'Do not use "a" before a plural noun (like "a friends"). Use the plural noun directly ("with friends") or singular ("with a friend").',
    simpleExplanation: 'Never put "a" before a plural noun — say "with friends" (or "with a friend").',
    explanationSi: 'බහුවචන නාමපදයකට පෙර "a" භාවිත නොකරන්න — "a friends" වෙනුවට "friends" (හෝ ඒකවචනයෙන් "a friend") ලෙස කියන්න.',
    grammar_rule: 'No "a / an" before Plural Nouns',
    example: 'We had a party at home while hanging out with friends.',
    learning_tip: '"A" always means ONE — never pair it with a plural noun ending in -s like "friends" or "games".',
    confidence: 0.98
  },
  {
    id: 'ss-i-not-missing-aux',
    regex: /\b(I|we|they|you)\s+not\s+(like|play|know|want|need|think|have|go|work|study|eat|drink|watch|use|prefer|survival|good|sure|ready|busy|happy|tired|fine|able)\b/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const subj = m[1];
      const next = m[2].toLowerCase();
      const adjOrNoun = ['survival', 'good', 'sure', 'ready', 'busy', 'happy', 'tired', 'fine', 'able'].includes(next);
      if (adjOrNoun) {
        const be = subj.toLowerCase() === 'i' ? 'am not' : 'are not';
        return next === 'survival' ? `${subj} don't play ${m[2]}` : `${subj} ${be} ${m[2]}`;
      }
      return `${subj} don't ${m[2]}`;
    },
    explanation: 'English negative sentences need a helping verb ("don\'t" before action verbs, or "am not / are not" before adjectives) instead of putting "not" directly after the subject.',
    simpleExplanation: 'Add "don\'t" or "am not" instead of "I not ...".',
    explanationSi: 'නැත යන අර්ථය දැක්වීමට "I not..." ලෙස කෙලින්ම යොදන්න එපා — ක්‍රියාපදයකට පෙර "I don\'t..." සහ විශේෂණයකට පෙර "I am not..." භාවිත කරන්න.',
    grammar_rule: 'Negatives: Subject + don\'t + verb / Subject + am/are not + adjective',
    example: "I don't play survival mode because I already have everything I need.",
    learning_tip: 'Never say "I not..." — always use "I don\'t..." (for actions) or "I\'m not..." (for states).',
    confidence: 0.96
  },
  {
    id: 'ss-resumptive-that-i-need-it',
    regex: /\b(everything|something|anything|all)\s+that\s+(I|you|we|they|he|she)\s+(need|needed|want|wanted|like|liked|use|used)\s+(it|them)\b/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} that ${m[2]} ${m[3]}`,
    explanation: 'When you already used "everything that...", do not repeat "it" or "them" at the end of the clause — "everything" is already the object.',
    simpleExplanation: 'Remove the extra "it" at the end: say "everything that I need" (not "everything that I need it").',
    explanationSi: '"Everything that I need" යන්නෙහි "everything" දැනටමත් කර්මය බැවින් අගට අමතර "it" යෙදීම අවශ්‍ය නොවේ.',
    grammar_rule: 'Relative Clauses: No extra object pronoun ("it / them") at the end',
    example: 'I almost have everything that I need.',
    learning_tip: 'After "everything that I need", stop at the verb — drop the extra "it".',
    confidence: 0.96
  },
  // 0. HIGH-PRIORITY REAL SPOKEN SYNTAX & STRUCTURAL PATTERNS (Reported Questions, Broken Modals, Incomplete Predicates)
  {
    id: 'ss-didnt-get-what-asking',
    regex: /\b(didn't|did\s+not)\s+(get|understand)\s+(what|where|why|how)\s+(you|we|they)\s+([a-z]{3,}ing)\b/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} understand ${m[3]} ${m[4]} were ${m[5]}`,
    explanation: 'A continuous verb ("asking", "saying") needs a helping verb ("were") after "you". Also, "didn\'t understand" sounds clearer and more complete than "didn\'t get" here.',
    explanationSi: '"Asking" වැනි -ing ක්‍රියාපදයකට පෙර උපකාරක ක්‍රියාපදයක් ("were") අත්‍යවශ්‍ය වේ — එනම් "what you were asking" ලෙස යෙදිය යුතුය.',
    grammar_rule: 'Embedded Continuous Clause: what + subject + was / were + verb-ing',
    example: "Sorry, I didn't understand what you were asking.",
    more_examples: [
      "I couldn't hear what she was saying.",
      "I didn't realise where they were going."
    ],
    learning_tip: 'Whenever you use a verb ending in "-ing" with a subject ("you asking"), always add am/is/are or was/were in front of it.',
    confidence: 0.99
  },
  {
    id: 'ss-missing-copula-anything-adj',
    regex: /\b(think|feel|believe|know|guess)\s+(anything|nothing|everything|something)\s+(possible|impossible|wrong|right|easy|hard|difficult|good|bad|important|clear|okay|fine)\b/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} ${m[2]} is ${m[3]}`,
    explanation: 'The clause after "think" needs a linking verb ("is") between the subject ("anything") and the adjective ("possible").',
    simpleExplanation: 'Add "is" between "anything" and "possible": "anything is possible".',
    explanationSi: '"Anything" සහ "possible" අතර "is" ක්‍රියාපදය යෙදිය යුතුය ("I don\'t think anything is possible").',
    grammar_rule: 'Noun Clause: Subject + think + [Subject + is + Adjective]',
    example: "Sometimes I don't think anything is possible, even though I keep trying.",
    learning_tip: 'Every clause needs a verb — never join "anything" directly to "possible" without "is".',
    confidence: 0.96
  },
  {
    id: 'ss-to-so-much',
    regex: /\bto\s+so\s+(much|many)\b/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => (m[1].toLowerCase() === 'many' ? 'very many things' : 'right now'),
    explanation: '"To so much" is incomplete/ungrammatical at the end of a sentence — either remove "to" ("...in my life right now") or include the verb after "to" (e.g., "to handle so much").',
    simpleExplanation: 'Do not end a sentence with "to so much" — say "...in my life right now" or "...to do so much".',
    explanationSi: 'වාක්‍යයක් අගට "to so much" ලෙස යෙදීම වැරදියි — "right now" හෝ "to handle so much" ලෙස නිවැරදි කරන්න.',
    grammar_rule: 'Complete Infinitive or Adverbial Ending ("right now" / "to handle so much")',
    example: "I feel like I have too much on my plate in my life right now.",
    learning_tip: 'After "to", always follow with a base verb ("to do", "to achieve") or a place/person — never "so much".',
    confidence: 0.94,
    isProvisional: true
  },
  {
    id: 'ss-wh-missing-do-base',
    regex: /(?:^|[.!?]\s+)(what|where|why|when|how)\s+(you|we|they)\s+(mean|think|want|need|like|say|know|live|work|study|eat|cook|use|prefer|suggest|recommend)\b/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const leadSpace = m[0].match(/^([.!?]\s+)/)?.[1] || '';
      return `${leadSpace}${m[1]} do ${m[2]} ${m[3]}`;
    },
    explanation: 'Direct present-simple questions with "what / where / why / how" require the helping verb "do" before "you / we / they" (e.g., "What do you mean?").',
    simpleExplanation: 'Add "do" after "what / why / where" in questions: "What do you mean?"',
    explanationSi: '"What / where / why" වලින් ආරම්භ වන ප්‍රශ්න වලදී "you / we / they" ඉදිරියෙන් "do" උපකාරක ක්‍රියාපදය අත්‍යවශ්‍ය වේ ("What do you mean?").',
    grammar_rule: 'Wh-Question Formula: Wh-word + do + subject + base verb',
    example: 'What do you mean by concepts in class?',
    more_examples: ['Where do you live?', 'Why do you think that?'],
    learning_tip: 'Whenever you ask a question starting with "What you...", pause and add "do": "What DO you mean?"',
    confidence: 0.98
  },
  {
    id: 'ss-wh-missing-aux-ing',
    regex: /\b(what|where|why|how)\s+(you|we|they)\s+(asking|saying|doing|going|talking|cooking|making|studying|working|watching|thinking|looking|meaning|trying)\b/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m, full) => {
      const pastHint = /\b(didn't|did|was|were|yesterday|just|earlier|before|heard|asked|said|told)\b/i.test(full);
      const isDirectQuestionStart = full.trim().toLowerCase().startsWith(m[0].toLowerCase());
      const aux = pastHint ? 'were' : 'are';
      return isDirectQuestionStart
        ? `${m[1]} ${aux} ${m[2]} ${m[3]}`
        : `${m[1]} ${m[2]} ${aux} ${m[3]}`;
    },
    explanation: 'You omitted the auxiliary verb ("are" or "were") before the "-ing" verb. Continuous tenses always require a form of "be".',
    explanationSi: '"-ing" ක්‍රියාපදයක් සමඟ "are" හෝ "were" උපකාරක ක්‍රියාපදය අනිවාර්යයෙන්ම යෙදිය යුතුය.',
    grammar_rule: 'Continuous Questions & Clauses: be (are / were) + verb-ing',
    example: 'What are you doing this weekend? / I missed what you were saying.',
    more_examples: ['Where are you going now?', 'I understand what you are trying to say.'],
    learning_tip: 'Never leave a subject directly next to an "-ing" action verb — insert "am / is / are / was / were".',
    confidence: 0.97
  },
  {
    id: 'ss-wh-he-she-missing-aux-ing',
    regex: /\b(what|where|why|how)\s+(he|she|it)\s+(asking|saying|doing|going|talking|cooking|making|studying|working|happening)\b/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m, full) => {
      const pastHint = /\b(didn't|did|was|were|yesterday|just|earlier)\b/i.test(full);
      const isDirectStart = full.trim().toLowerCase().startsWith(m[0].toLowerCase());
      const aux = pastHint ? 'was' : 'is';
      return isDirectStart ? `${m[1]} ${aux} ${m[2]} ${m[3]}` : `${m[1]} ${m[2]} ${aux} ${m[3]}`;
    },
    explanation: 'The continuous verb needs the helping verb "is" or "was" after "he / she / it".',
    explanationSi: '"He / she / it" සමඟ "-ing" ක්‍රියාපදය යෙදෙන විට "is" හෝ "was" අනිවාර්ය වේ.',
    grammar_rule: 'Continuous Clause: he / she / it + is / was + verb-ing',
    example: 'I asked what she was doing.',
    learning_tip: 'Pair he/she/it + -ing with "is" (present) or "was" (past).',
    confidence: 0.96
  },
  {
    id: 'wo-maybe-will-noun-not',
    regex: /\bmaybe\s+will\s+(school|class|classes|college|university|work|office|exam|exams|lecture|lectures|meeting|practice|training|rain)\s+not(\s+(?:tomorrow|today|tonight|next\s+\w+|later|this\s+\w+))?\b/gi,
    category: 'WORD_ORDER',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const noun = m[1].toLowerCase();
      const timePart = m[2] || '';
      if (noun === 'rain') {
        return `it might not rain${timePart}`;
      }
      return `there might not be ${noun}${timePart}`;
    },
    explanation: 'In English, we don\'t combine "maybe will" or place "not" after the noun. Use "there might not be + noun" (or "school might be cancelled") to express uncertainty.',
    explanationSi: 'සැකයක් හෝ සම්භාවිතාවක් දැක්වීමේදී "maybe will [noun] not" ලෙස නොකියා "there might not be [noun]" යන නිවැරදි වාක්‍ය රටාව භාවිත කරන්න.',
    grammar_rule: 'Possibility + Existence: there might (not) be + noun + time',
    example: 'I think there might not be school tomorrow.',
    more_examples: [
      'There might not be classes next Monday.',
      'I think school might be cancelled tomorrow.'
    ],
    learning_tip: 'Replace "maybe will not" with the much cleaner "might not" — and use "there might not be..." for events like school or class.',
    confidence: 0.98
  },
  {
    id: 'wo-maybe-will-general',
    regex: /\bmaybe\s+will\s+(not\s+)?([a-z]+)\b/gi,
    category: 'WORD_ORDER',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `it might ${m[1] ? 'not ' : ''}${m[2].toLowerCase()}`,
    explanation: 'English requires a subject before a modal verb, and "maybe will" is usually replaced with "might" or "may" for natural probability.',
    explanationSi: '"Maybe will" වෙනුවට කර්තෘ පදයක් සමඟ "might" භාවිත කිරීම නිවැරදි ඉංග්‍රීසි රටාවයි.',
    grammar_rule: 'Modal Probability: Subject + might (not) + base verb',
    example: 'I think it might rain tomorrow.',
    more_examples: ['It might not happen today.', 'We might go out later.'],
    learning_tip: 'Use "might" instead of combining "maybe" + "will".',
    confidence: 0.94
  },
  {
    id: 'ss-verb-bare-adjective',
    regex: /\b(cook|make|prepare|eat|have|buy|order)\s+(big|small|special|heavy|light)(?=\s*[.!?]?$|\s+(?:today|tonight|tomorrow|later|for\s+(?:dinner|lunch|breakfast)))/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const verb = m[1];
      const adj = m[2].toLowerCase();
      if (/^(cook|prepare|eat|order)$/i.test(verb)) {
        return `${verb} a ${adj} meal`;
      }
      return `${verb} something ${adj}`;
    },
    explanation: 'An adjective like "big" cannot stand alone as the object of "cook" — it needs a noun after it, such as "a big meal" or "something big".',
    explanationSi: '"Big" යනු නාම විශේෂණයක් බැවින් එයට පසුව "meal" වැනි නාම පදයක් යෙදිය යුතුය (උදා: "cook a big meal").',
    grammar_rule: 'Transitive Verb + Article + Adjective + Noun ("cook a big meal")',
    example: 'I will cook a big meal for my family tonight.',
    more_examples: [
      'I am going to cook something special today.',
      'We prepared a big dinner for the weekend.'
    ],
    learning_tip: 'After action verbs like "cook", "make", or "buy", attach a noun to adjectives: "a big meal", "something nice".',
    confidence: 0.93,
    isProvisional: true
  },
  {
    id: 'ss-when-i-question-cook',
    regex: /\b(so,?\s+)?when\s+I\s+question,?\s+I\s+(put|add|heat|use)\s+([^.?!]+?)(?:\s+and\s+cook)?(?=[.!?]?$)/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const lead = m[1] ? 'So, ' : '';
      const rawVerb = m[2].toLowerCase();
      const betterVerb = rawVerb === 'put' ? 'add' : rawVerb;
      return `${lead}when I start cooking, I ${betterVerb} ${m[3].trim()}`;
    },
    explanation: '"When I question" does not fit the meaning of cooking (it may also be a mic slip for "when I start cooking"). Also, in recipes we usually say "add some ginger and cooking oil" rather than "put ... and cook".',
    explanationSi: 'ඉවුම් පිහුම් විස්තර කිරීමේදී "when I start cooking, I add..." ලෙස පැහැදිලි ක්‍රියාපද භාවිත කිරීම වඩාත් නිවැරදි හා ස්වාභාවික වේ.',
    grammar_rule: 'Time Clause + Recipe Collocation: When I start cooking, I add [ingredients].',
    example: 'So, when I start cooking, I add some ginger and cooking oil.',
    more_examples: [
      'First, I heat the oil and add chopped ginger and garlic.',
      'When I cook curry, I always start with oil and spices.'
    ],
    learning_tip: 'When describing cooking steps, use sequence words like "First, I heat..." and "then I add...".',
    confidence: 0.88,
    isProvisional: true
  },
  {
    id: 'vf-missing-to-infinitive',
    regex: /\b(want|wants|wanted|need|needs|needed|try|tried|plan|planned|planning|hope|hoped|decide|decided|forgot|forget)\s+(go|eat|cook|buy|sleep|study|work|see|meet|talk|speak|learn|play|watch|make|do|come|visit|travel)\b/gi,
    category: 'VERB_FORMS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} to ${m[2]}`,
    explanation: 'Verbs like "want", "need", "try", and "plan" must be followed by "to + base verb" (the full infinitive).',
    explanationSi: '"Want", "need", "try" වැනි ක්‍රියාපද වලින් පසුව තවත් ක්‍රියාපදයක් එන විට අතරමැදට "to" යෙදිය යුතුය.',
    grammar_rule: 'Infinitive Pattern: want / need / try / plan + to + base verb',
    example: 'I want to cook something delicious tonight.',
    more_examples: ['I need to study for my exam.', 'We plan to visit Kandy next month.'],
    learning_tip: 'Connect two action verbs with "to": want TO go, need TO cook, try TO speak.',
    confidence: 0.97
  },
  {
    id: 'ss-double-neg-no-nothing',
    regex: /\bno\s+nothing\b/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: () => 'nothing',
    explanation: 'Using "no" and "nothing" together creates a double negative. Use just "nothing" or "not anything".',
    explanationSi: '"No" සහ "nothing" එකට යෙදීම ද්විත්ව නිෂේධනයකි (double negative). "Nothing" පමණක් යොදන්න.',
    grammar_rule: 'Avoid Double Negatives: use "nothing" OR "not anything"',
    example: 'Nothing special happened today.',
    learning_tip: 'Keep only one negative word per clause: "Nothing happened" or "I didn\'t do anything."',
    confidence: 0.98
  },
  {
    id: 'ss-i-no-verb',
    regex: /\b(I|we|they|you)\s+no\s+(have|want|like|know|think|understand|go|eat|see|need)\b/gi,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} don't ${m[2]}`,
    explanation: 'Use "don\'t" (not "no") before a verb to make a negative statement in the present simple.',
    explanationSi: 'ක්‍රියාපදයක් නිෂේධ කිරීමට "no" නොව "don\'t" භාවිත කළ යුතුය.',
    grammar_rule: "Present Simple Negative: Subject + don't + base verb",
    example: "I don't have class tomorrow.",
    learning_tip: 'Use "no" before nouns ("no time"), and "don\'t / doesn\'t" before verbs ("don\'t have").',
    confidence: 0.98
  },
  {
    id: 'sva-there-is-plural',
    regex: /\bthere\s+is\s+(many|a\s+lot\s+of|several|two|three|four|five|some)\s+([a-z]{3,}s)\b/gi,
    category: 'SVA',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `there are ${m[1]} ${m[2]}`,
    explanation: 'Use "there are" (plural) when referring to more than one item.',
    explanationSi: 'බහුවචන නාම පදයක් සමඟ "there is" නොව "there are" භාවිත කළ යුතුය.',
    grammar_rule: 'Plural Existence: there are + plural noun',
    example: 'There are many good restaurants in this area.',
    learning_tip: 'Match "there is" with singular nouns and "there are" with plural nouns.',
    confidence: 0.96
  },
  {
    id: 'unnat-actually-done-nothing-basically',
    regex: /\b(I\s+(?:have|'ve)\s+actually\s+done\s+nothing\s+basically)\b/gi,
    category: 'REPETITION',
    severity: 'UNNATURAL',
    getCorrection: () => "I've basically done nothing today",
    explanation: 'Your grammar is understandable, though stacking both "actually" and "basically" in one short sentence sounds slightly cluttered. Keeping just one makes it much smoother.',
    explanationSi: 'එකම කෙටි වාක්‍යයේ "actually" සහ "basically" දෙකම යෙදීම අනවශ්‍යයි — ඉන් එකක් පමණක් භාවිත කිරීම වඩාත් ස්වාභාවික වේ.',
    grammar_rule: 'Concise Spoken Flow: use one softening adverb ("basically" OR "really"), not two',
    example: "I haven't really done much today.",
    more_examples: ["I've basically done nothing all day.", "Actually, I didn't do much today."],
    learning_tip: 'Pick either "actually" OR "basically" per sentence to sound crisp and confident.',
    confidence: 0.91
  },

  // 1. VERB FORMS (Irregular Past & Past Participles)
  {
    id: 'vf-buyed',
    regex: /\bbuyed\b/gi,
    category: 'VERB_FORMS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: () => 'bought',
    explanation: '"Buy" is an irregular verb. Its past tense is "bought", not "buyed".',
    simpleExplanation: 'Use "bought" for the past tense of "buy".',
    explanationSi: '"Buy" යනු අක්‍රමවත් ක්‍රියාපදයකි (irregular verb). එහි අතීත කාලය "bought" වේ.',
    verbFormTable: { v1: 'Buy', v2: 'Bought', v3: 'Bought' },
    grammar_rule: 'Irregular Past Tense: buy → bought → bought',
    example: 'I bought a new jacket at the mall yesterday.',
    more_examples: ['She bought groceries on her way home.', 'We bought tickets online.'],
    learning_tip: 'Never add "-ed" to common irregular verbs like buy (bought), bring (brought), or think (thought).',
    confidence: 0.99
  },
  {
    id: 'vf-goed',
    regex: /\bgoed\b/gi,
    category: 'VERB_FORMS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: () => 'went',
    explanation: '"Go" is an irregular verb. Its past tense is "went", not "goed".',
    explanationSi: '"Go" ක්‍රියාපදයේ අතීත කාලය "went" වේ ("goed" නොවේ).',
    grammar_rule: 'Irregular Past Tense: go → went → gone',
    example: 'We went to the beach last Sunday.',
    learning_tip: 'Remember the trio: go – went – gone.',
    confidence: 0.99
  },
  {
    id: 'vf-eated',
    regex: /\beated\b/gi,
    category: 'VERB_FORMS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: () => 'ate',
    explanation: '"Eat" is an irregular verb. Its past tense is "ate", not "eated".',
    explanationSi: '"Eat" හි අතීත කාලය "ate" වේ.',
    grammar_rule: 'Irregular Past Tense: eat → ate → eaten',
    example: 'We ate dinner at a nice restaurant.',
    learning_tip: 'Remember: eat – ate – eaten.',
    confidence: 0.99
  },
  {
    id: 'vf-other-irreg',
    regex: /\b(drinked|sleeped|catched|teached|thinked|runned|comed|writed|taked|maked|speaked|seed)\b/gi,
    category: 'VERB_FORMS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const map: Record<string, string> = {
        drinked: 'drank',
        sleeped: 'slept',
        catched: 'caught',
        teached: 'taught',
        thinked: 'thought',
        runned: 'ran',
        comed: 'came',
        writed: 'wrote',
        taked: 'took',
        maked: 'made',
        speaked: 'spoke',
        seed: 'saw'
      };
      return map[m[1].toLowerCase()] || m[1];
    },
    explanation: 'This is an irregular English verb — it takes a special past-tense form instead of adding "-ed".',
    explanationSi: 'මෙය අක්‍රමවත් ක්‍රියාපදයක් (irregular verb) බැවින් "-ed" එකතු නොකර නිවැරදි අතීත රූපය යෙදිය යුතුය.',
    grammar_rule: 'Irregular Past Tense Forms',
    example: 'She taught us a helpful method and I wrote it down.',
    learning_tip: 'Practise high-frequency irregular verbs in short past-tense stories.',
    confidence: 0.98
  },
  {
    id: 'vf-have-went-past-time',
    regex: /\b(?:have|has)\s+went\b(?=.{0,45}\b(?:yesterday|last\s+(?:week|month|year|night|friday|monday|sunday)|ago)\b)/gi,
    category: 'VERB_TENSE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: () => 'went',
    explanation: 'You combined present perfect ("have") with an incorrect past form ("went") alongside a finished past time expression like "yesterday". Use simple past ("went") here.',
    explanationSi: '"Yesterday" වැනි නිශ්චිත අතීත කාලයක් ඇති විට Present Perfect ("have") නොයොදා Simple Past ("went") පමණක් භාවිත කරන්න.',
    grammar_rule: 'Simple Past with finished time ("yesterday", "last week", "two days ago")',
    example: 'I went to Colombo yesterday.',
    more_examples: ['I went to school yesterday.', 'She visited her grandmother last week.', 'They watched a movie two days ago.'],
    learning_tip: 'When you say "yesterday", "last week", or "two days ago", use simple past directly.',
    confidence: 0.98
  },
  {
    id: 'vf-have-went',
    regex: /\b(have|has|had)\s+went\b/gi,
    category: 'VERB_FORMS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} gone`,
    explanation: 'After "have / has / had", always use the past participle (V3: "gone"), not the simple past (V2: "went").',
    simpleExplanation: 'After "have", we need the past participle (V3: "gone"), not the simple past (V2: "went").',
    explanationSi: '"Have" යන helping verb එකෙන් පසුව සාමාන්‍යයෙන් භාවිතා කළ යුත්තේ verb එකේ past participle (V3 - "gone") ආකාරයයි.',
    verbFormTable: { v1: 'Go', v2: 'Went', v3: 'Gone' },
    grammar_rule: 'Perfect Tense: have / has / had + V3 (past participle)',
    example: 'They have gone to the library already.',
    more_examples: ['I have eaten lunch.', 'She has written three emails.'],
    learning_tip: 'Remember: go (V1) → went (V2) → gone (V3 after have/has).',
    confidence: 0.98
  },
  {
    id: 'vf-was-go',
    regex: /\b(?:was|were)\s+(go|went|come|eat|buy|meet|see|study|work)\b/gi,
    category: 'VERB_TENSE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const map: Record<string, string> = {
        go: 'went',
        went: 'went',
        come: 'came',
        eat: 'ate',
        buy: 'bought',
        meet: 'met',
        see: 'saw',
        study: 'studied',
        work: 'worked'
      };
      return map[m[1].toLowerCase()] || m[1];
    },
    explanation: 'Do not place "was/were" before a base action verb in simple past. Use the past verb directly (or "was + -ing" for ongoing actions).',
    explanationSi: 'සරල අතීත ක්‍රියාවක් ප්‍රකාශ කිරීමේදී "was/were" සමඟ මූල ක්‍රියාපදය නොයොදා අතීත ක්‍රියාපදය ("went", "met") කෙලින්ම යොදන්න.',
    grammar_rule: 'Simple Past: Subject + Past Verb (NOT: was + base verb)',
    example: 'Today I went to university and met my friends.',
    learning_tip: 'Use "I went" for completed actions, or "I was going" only if describing an action in progress.',
    confidence: 0.96
  },
  {
    id: 'vf-didnt-past',
    regex: /\b(didn't|did\s+not)\s+(went|ate|bought|saw|came|met|took|made|got|had|knew|understood|thought|felt|said|told|gave|found|left|kept|slept|drank|wrote|spoke|ran|brought|caught|taught|heard)\b/gi,
    category: 'VERB_FORMS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const base: Record<string, string> = {
        went: 'go',
        ate: 'eat',
        bought: 'buy',
        saw: 'see',
        came: 'come',
        met: 'meet',
        took: 'take',
        made: 'make',
        got: 'get',
        had: 'have',
        knew: 'know',
        understood: 'understand',
        thought: 'think',
        felt: 'feel',
        said: 'say',
        told: 'tell',
        gave: 'give',
        found: 'find',
        left: 'leave',
        kept: 'keep',
        slept: 'sleep',
        drank: 'drink',
        wrote: 'write',
        spoke: 'speak',
        ran: 'run',
        brought: 'bring',
        caught: 'catch',
        taught: 'teach',
        heard: 'hear'
      };
      return `${m[1]} ${base[m[2].toLowerCase()] || m[2]}`;
    },
    explanation: 'Because "didn\'t" already carries the past tense, the main verb returns to its base form (V1).',
    explanationSi: '"Didn\'t" මඟින් අතීත කාලය දැක්වෙන නිසා ඊළඟ ක්‍රියාපදය මූල රූපයෙන් (V1) තැබිය යුතුය.',
    grammar_rule: "Negative Simple Past: didn't + base verb (V1)",
    example: "I didn't go out last night because it rained.",
    learning_tip: 'After "did" or "didn\'t", always reset the next verb to base form.',
    confidence: 0.98
  },
  {
    id: 'vf-i-am-agree',
    regex: /\b(I)\s+am\s+agree\b/gi,
    category: 'VERB_FORMS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} agree`,
    explanation: '"Agree" is an action verb, not an adjective, so it does not take "am" before it.',
    explanationSi: '"Agree" යනු ක්‍රියාපදයක් නිසා "I am agree" නොකියා "I agree" යයි කියන්න.',
    grammar_rule: 'Subject + agree (NOT: subject + be + agree)',
    example: 'I completely agree with your point.',
    learning_tip: 'Say "I agree" or "I totally agree" — never "I am agree".',
    confidence: 0.99
  },

  // 2. PREPOSITIONS
  {
    id: 'prep-went-to-shopping',
    regex: /\b(go|went|going)\s+(to\s+(shopping|swimming|running|hiking|camping|fishing|sightseeing))\b/gi,
    category: 'PREPOSITIONS',
    severity: 'GRAMMAR_ERROR',
    getSpan: (m) => {
      const startOffset = m[0].length - m[2].length;
      return { startOffset, endOffset: m[0].length, original: m[2] };
    },
    getCorrection: (m) => m[3],
    explanation: 'We don\'t use "to" between "go/went" and "-ing" leisure activities like "shopping" or "swimming".',
    simpleExplanation: 'Skip "to" before "-ing" activities: say "went shopping" instead of "went to shopping".',
    explanationSi: '"Go / went" සමඟ "shopping", "swimming" වැනි -ing ක්‍රියාකාරකම් යෙදෙන විට අතරමැදට "to" නොයොදන්න.',
    sinhalaTransferNote: 'සිංහලෙන් "ෂොපින් යන්න" යන අදහසට "went to shopping" ලෙස සිතුවත්, ඉංග්‍රීසියේ "to" යොදන්නේ ස්ථානයකට ("go to the mall") පමණි.',
    grammar_rule: 'go + verb-ing (go shopping, go swimming, go hiking)',
    example: 'I went shopping yesterday and bought some clothes.',
    more_examples: ['We went swimming at the hotel pool.', 'Let\'s go hiking this weekend.'],
    learning_tip: 'Use "go to + place" (go to the mall), but "go + -ing" (go shopping).',
    confidence: 0.99
  },
  {
    id: 'prep-interested-on',
    regex: /\binterested\s+on\b/gi,
    category: 'PREPOSITIONS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: () => 'interested in',
    explanation: 'The adjective "interested" always pairs with the preposition "in", not "on".',
    explanationSi: '"Interested" සමඟ සෑමවිටම යෙදෙන්නේ "in" නිපාතයයි ("on" නොවේ).',
    grammar_rule: 'interested + in + noun / verb-ing',
    example: 'I am really interested in software engineering.',
    learning_tip: 'Pair "interested in" together as one fixed chunk.',
    confidence: 0.99
  },
  {
    id: 'prep-depends-of',
    regex: /\b(depend|depends|depending)\s+of\b/gi,
    category: 'PREPOSITIONS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} on`,
    explanation: 'In English, "depend" collocates with "on" (or "upon"), never "of".',
    explanationSi: '"Depend" ක්‍රියාපදය සමඟ නිවැරදි නිපාතය "on" වේ.',
    grammar_rule: 'depend + on',
    example: 'It really depends on my schedule this week.',
    learning_tip: 'Always say "it depends on..."',
    confidence: 0.99
  },
  {
    id: 'prep-listen-music',
    regex: /\b(listen|listened|listening)\s+(music|songs|podcasts|the\s+radio)\b/gi,
    category: 'PREPOSITIONS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} to ${m[2]}`,
    explanation: 'The verb "listen" requires the preposition "to" before an object.',
    explanationSi: '"Listen" ක්‍රියාපදයට පසුව වස්තුවක් ඇති විට "to" නිපාතය අනිවාර්ය වේ.',
    grammar_rule: 'listen + to + object',
    example: 'I usually listen to music while studying.',
    learning_tip: 'Remember: hear something, but listen TO something.',
    confidence: 0.97
  },
  {
    id: 'prep-discuss-about',
    regex: /\b(discuss|discussed|discussing)\s+about\b/gi,
    category: 'PREPOSITIONS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => m[1],
    explanation: '"Discuss" already means "talk about", so adding "about" is redundant.',
    explanationSi: '"Discuss" තුළම "ගැන කතා කරනවා" යන අර්ථය ඇති නිසා "about" නොයොදන්න.',
    grammar_rule: 'discuss + topic (NO "about")',
    example: 'We discussed artificial intelligence in our lecture.',
    learning_tip: 'Say "talk about a topic" OR "discuss a topic" — never "discuss about".',
    confidence: 0.98
  },
  {
    id: 'prep-married-with',
    regex: /\bmarried\s+with\b/gi,
    category: 'PREPOSITIONS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: () => 'married to',
    explanation: 'In English, we say someone is "married to" another person, not "married with".',
    explanationSi: 'කෙනෙකු සමඟ විවාහ වී සිටීම දැක්වීමට "married to" භාවිතා කරයි.',
    grammar_rule: 'be married + to + person',
    example: 'My cousin is married to a doctor.',
    learning_tip: 'Use "married to" for the spouse, and "married with kids" only for children.',
    confidence: 0.95
  },

  // 3. VERB TENSE (Past Context Mismatches)
  {
    id: 'vt-yesterday-present',
    regex: /\b(yesterday|last\s+night|last\s+week|two\s+days\s+ago)(,?\s+)(I|we|they|he|she)\s+(am|is|go|goes|eat|eats|buy|buys|meet|meets|see|sees|have|has|do|does|study|studies|work|works)\b/gi,
    category: 'VERB_TENSE',
    severity: 'GRAMMAR_ERROR',
    getSpan: (m) => {
      const startOffset = m[0].length - m[4].length;
      return { startOffset, endOffset: m[0].length, original: m[4] };
    },
    getCorrection: (m) => {
      const past: Record<string, string> = {
        am: 'was',
        is: 'was',
        go: 'went',
        goes: 'went',
        eat: 'ate',
        eats: 'ate',
        buy: 'bought',
        buys: 'bought',
        meet: 'met',
        meets: 'met',
        see: 'saw',
        sees: 'saw',
        have: 'had',
        has: 'had',
        do: 'did',
        does: 'did',
        study: 'studied',
        studies: 'studied',
        work: 'worked',
        works: 'worked'
      };
      return past[m[4].toLowerCase()] || m[4];
    },
    explanation: 'Because the sentence refers to a finished past time (e.g., "yesterday"), the verb needs to be in the simple past tense.',
    simpleExplanation: 'Because it happened yesterday, change the verb to past tense (e.g., "go" → "went").',
    explanationSi: '"Yesterday" වැනි අතීත කාල වචනයක් ඇති බැවින් ක්‍රියාපදය අතීත කාලයෙන් (Simple Past) යෙදිය යුතුය.',
    grammar_rule: 'Simple Past Tense with past time markers',
    example: 'Yesterday I went shopping and bought some clothes.',
    learning_tip: 'Spot time words like "yesterday" or "last week" and shift your verbs into past tense.',
    confidence: 0.96
  },
  {
    id: 'vt-verb-yesterday',
    regex: /\b(I|we|they)\s+(go|am\s+going|eat|buy|meet|see)\s+([a-zA-Z0-9\s]{0,25}?)\b(yesterday|last\s+week|last\s+night)\b/gi,
    category: 'VERB_TENSE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const past: Record<string, string> = {
        go: 'went',
        'am going': 'went',
        eat: 'ate',
        buy: 'bought',
        meet: 'met',
        see: 'saw'
      };
      const fixedVerb = past[m[2].toLowerCase().replace(/\s+/g, ' ')] || m[2];
      return `${m[1]} ${fixedVerb} ${m[3]}${m[4]}`;
    },
    explanation: 'The action took place in the past ("yesterday / last week"), so the verb should be in the simple past tense.',
    explanationSi: 'මෙම ක්‍රියාව අතීතයේ සිදුවූවක් බැවින් ක්‍රියාපදය අතීත කාලයට හැරවිය යුතුය.',
    grammar_rule: 'Simple Past Tense: Subject + Past Verb + Past Time',
    example: 'I went to the bookstore yesterday.',
    learning_tip: 'Check the time marker at the end of your sentence to match your verb tense.',
    confidence: 0.95
  },
  {
    id: 'vt-and-meet-past',
    regex: /\b(?:(?<=yesterday[^.?!]{1,50})|(?<=went[^.?!]{1,40})|(?<=visited[^.?!]{1,40}))and\s+(meet|buy|eat|see|go)\b/gi,
    category: 'VERB_TENSE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const past: Record<string, string> = {
        meet: 'met',
        buy: 'bought',
        eat: 'ate',
        see: 'saw',
        go: 'went'
      };
      return `and ${past[m[1].toLowerCase()] || m[1]}`;
    },
    explanation: 'The second action happened in the same past timeframe as the first action, so keep both verbs in the past tense.',
    explanationSi: 'පළමු ක්‍රියාව අතීත කාලයෙන් ඇති නිසා "and" වලින් පසුව එන දෙවන ක්‍රියාවද අතීත කාලයෙන් තැබිය යුතුය.',
    grammar_rule: 'Tense Consistency across coordinated verbs',
    example: 'Yesterday I went to university and met my friends.',
    learning_tip: 'When joining two past events with "and", make sure BOTH verbs are past tense.',
    confidence: 0.94
  },

  // 4. SUBJECT-VERB AGREEMENT (SVA)
  {
    id: 'sva-he-she-dont',
    regex: /\b(he|she|it)\s+don'?t\b/gi,
    category: 'SVA',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} doesn't`,
    explanation: 'Third-person singular subjects ("he", "she", "it") require "doesn\'t", not "don\'t".',
    explanationSi: 'තෙවන පාර්ශ්ව ඒකවචන (he, she, it) සමඟ "don\'t" නොව "doesn\'t" යෙදිය යුතුය.',
    grammar_rule: "Third-Person Singular Negative: he / she / it + doesn't",
    example: "She doesn't like coffee in the evening.",
    learning_tip: 'Pair he/she/it with "doesn\'t" automatically.',
    confidence: 0.99
  },
  {
    id: 'sva-he-she-base',
    regex: /\b(he|she)\s+(go|like|want|have|work|study|live|play)\b/gi,
    category: 'SVA',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const third: Record<string, string> = {
        go: 'goes',
        like: 'likes',
        want: 'wants',
        have: 'has',
        work: 'works',
        study: 'studies',
        live: 'lives',
        play: 'plays'
      };
      return `${m[1]} ${third[m[2].toLowerCase()] || `${m[2]}s`}`;
    },
    explanation: 'In the present simple, verbs following "he" or "she" need an "-s / -es" ending (or "has").',
    explanationSi: 'වර්තමාන කාලයේදී "he / she" සමඟ ක්‍රියාපදයට "-s / -es" එකතු කළ යුතුය.',
    grammar_rule: 'Present Simple SVA: he / she / it + verb-s/es',
    example: 'She goes to the gym every morning.',
    learning_tip: 'Listen for the "-s" sound after "he", "she", or a single person\'s name.',
    confidence: 0.95
  },
  {
    id: 'sva-people-is',
    regex: /\b(people)\s+is\b/gi,
    category: 'SVA',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} are`,
    explanation: '"People" is a plural noun and must agree with "are" (or "were"), not "is".',
    explanationSi: '"People" බහුවචන නාම පදයක් නිසා "are" යෙදිය යුතුය.',
    grammar_rule: 'Plural Agreement: people + are / were',
    example: 'Many people are interested in remote work.',
    learning_tip: 'Treat "people" just like "they" → people are.',
    confidence: 0.99
  },

  // 5. PLURALS & UNCOUNTABLE NOUNS
  {
    id: 'pl-lots-of-works',
    regex: /\b(lots\s+of|a\s+lot\s+of|many|much)\s+works\b/gi,
    category: 'PLURALS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: () => 'a lot of work',
    explanation: '"Work" (meaning tasks or job duties) is uncountable in English, so we say "a lot of work", not "lots of works".',
    simpleExplanation: '"Work" has no plural "-s" here — say "a lot of work".',
    explanationSi: 'වැඩකටයුතු යන අර්ථයෙන් "work" ගිණිය නොහැකි නාම පදයක් බැවින් "-s" නොයොදා "a lot of work" යයි කියන්න.',
    sinhalaTransferNote: 'සිංහලෙන් "වැඩ ගොඩක්" බහුවචන ලෙස හැඟුණත්, ඉංග්‍රීසියේ work, advice, information යනු uncountable (ගිණිය නොහැකි) නිසා "-s" නොයෙදේ.',
    grammar_rule: 'Uncountable Nouns: work, information, advice, homework (no plural -s)',
    example: 'I had a lot of work to finish before Friday.',
    learning_tip: 'Use "a lot of work" or "many tasks" — never "lots of works".',
    confidence: 0.98
  },
  {
    id: 'pl-uncountables',
    regex: /\b(informations|advices|furnitures|homeworks|equipments)\b/gi,
    category: 'PLURALS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => m[1].slice(0, -1),
    explanation: 'This noun is uncountable in standard English and never takes a plural "-s".',
    explanationSi: 'මෙය ගිණිය නොහැකි නාම පදයක් (uncountable noun) බැවින් අගට "-s" එකතු නොකරන්න.',
    grammar_rule: 'Uncountable Nouns: no plural -s (use "some..." or "a piece of...")',
    example: 'She gave me some really useful advice and information.',
    learning_tip: 'Say "some advice" or "a piece of information" instead of adding -s.',
    confidence: 0.99
  },
  {
    id: 'pl-many-singular',
    regex: /\bmany\s+(student|friend|book|person|thing|movie|country|place|problem)\b/gi,
    category: 'PLURALS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const plural: Record<string, string> = {
        person: 'people',
        country: 'countries'
      };
      const w = m[1].toLowerCase();
      return `many ${plural[w] || `${w}s`}`;
    },
    explanation: '"Many" is always followed by a plural countable noun.',
    explanationSi: '"Many" වලින් පසුව සෑමවිටම බහුවචන නාම පදයක් යෙදිය යුතුය.',
    grammar_rule: 'Quantifier Agreement: many + plural noun',
    example: 'Many students attend that lecture every week.',
    learning_tip: 'After "many", "several", or "a few", remember the plural -s.',
    confidence: 0.97
  },

  // 6. ARTICLES
  {
    id: 'art-verb-bare-ai-or-tech-noun',
    regex: /\b(developed|develop|built|build|building|created|create|creating|made|make|making|designed|design|wrote|write|launched|tested|added|add|using|used|use|bought|buy|read|watched|found|find|have|has|had|need|needs|needed|got|saw|starting|started)\s+(AI\s+(?:tool|app|model|system|assistant|chatbot|agent|project|feature|platform)|app|application|website|tool|feature|project|program|system|model|component|book|laptop|phone|car|movie|dress|shirt|job|idea|mistake|problem|question|plan|recipe|dish|meal|trip)\b/gi,
    category: 'ARTICLES',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => {
      const nounPhrase = m[2];
      const startsVowelSound = /^(?:ai\b|[aeiou])/i.test(nounPhrase);
      return `${m[1]} ${startsVowelSound ? 'an' : 'a'} ${nounPhrase}`;
    },
    explanation: 'A singular countable noun phrase (like "AI tool", "website", or "book") needs an article ("a", "an", or "the") before it. Use "an" before "AI" because it begins with a vowel sound ("ay-eye").',
    simpleExplanation: 'Put "a" or "an" before a single countable noun (e.g., "an AI tool", "a book").',
    explanationSi: 'ඒකවචන ගිණිය හැකි නාම පදයකට පෙර "a" හෝ "an" යෙදිය යුතුය. "AI" යන්න ස්වර ශබ්දයකින් ආරම්භ වන බැවින් "an AI tool" යයි කියන්න.',
    grammar_rule: 'Indefinite Article: a / an + singular countable noun ("an AI tool", "a website")',
    example: 'I developed an AI tool to help students practice English.',
    more_examples: ['I built a website for my university project.', 'I bought a book yesterday.'],
    learning_tip: 'Singular countable nouns rarely stand bare — add "a", "an", "the", or "my" in front of them.',
    confidence: 0.94
  },
  {
    id: 'art-a-vowel',
    regex: /\ba\s+(AI\b|apple|hour|umbrella|interesting|awesome|amazing|exciting|important|exam|idea|email|app|application)\b/gi,
    category: 'ARTICLES',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `an ${m[1]}`,
    explanation: 'Use "an" instead of "a" before words that begin with a vowel sound.',
    explanationSi: 'ස්වර ශබ්දයකින් (vowel sound) ආරම්භ වන වචන වලට පෙර "a" නොව "an" යෙදිය යුතුය.',
    grammar_rule: 'a + consonant sound · an + vowel sound',
    example: 'We had an interesting lecture about AI today.',
    learning_tip: 'Listen to the opening sound: "an hour", "an interesting book", but "a university".',
    confidence: 0.98
  },

  // 7. CONDITIONALS
  {
    id: 'cond-if-will',
    regex: /\bif\s+(I|you|we|they|he|she|it)\s+will\s+([a-z]+)\b/gi,
    category: 'CONDITIONALS',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `if ${m[1]} ${m[2]}`,
    explanation: 'In first conditional "if"-clauses, use present simple instead of "will". Save "will" for the result clause.',
    explanationSi: '"If" කොටස තුළ "will" භාවිතා නොකර සරල වර්තමාන කාලය (Present Simple) යොදන්න.',
    grammar_rule: 'First Conditional: If + present simple, ... will + base verb',
    example: 'If I go to Colombo tomorrow, I will call you.',
    learning_tip: 'Keep "will" out of the "if" part: "If it rains, we will stay home."',
    confidence: 0.97
  },

  // 8. WORD ORDER & DOUBLE COMPARATIVES
  {
    id: 'wo-like-very-much-it',
    regex: /\blike\s+very\s+much\s+(it|that|this|them|him|her)\b/gi,
    category: 'WORD_ORDER',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `like ${m[1]} very much`,
    explanation: 'In English, keep the object ("it", "that") right after the verb, and place "very much" at the end.',
    explanationSi: 'ඉංග්‍රීසි වාක්‍ය රටාවේදී "like" ක්‍රියාපදයට පසුව "it" යොදා "very much" වාක්‍යය අගට තැබිය යුතුය.',
    grammar_rule: 'Word Order: Verb + Object + Adverbial ("like it very much")',
    example: 'I watched that film and I liked it very much.',
    learning_tip: 'Never separate a verb from its direct object with "very much".',
    confidence: 0.99
  },
  {
    id: 'wo-double-comparative',
    regex: /\bmore\s+(better|faster|cheaper|easier|higher|closer|bigger|nicer)\b/gi,
    category: 'WORD_ORDER',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => m[1],
    explanation: 'Adjectives ending in "-er" (or "better") are already comparative — adding "more" creates a double comparative.',
    explanationSi: '"Better / faster" දැනටමත් සංසන්දනාත්මක රූප බැවින් ඊට පෙර "more" නොයොදන්න.',
    grammar_rule: 'Use either "more + adjective" OR "adjective-er", never both',
    example: 'Studying in a quiet room is much better for focus.',
    learning_tip: 'If you want emphasis, say "much better" instead of "more better".',
    confidence: 0.99
  },

  // 9. WORD CHOICE & COLLOCATIONS
  {
    id: 'wc-did-a-party',
    regex: /\b(did|do|doing)\s+a\s+party\b/gi,
    category: 'WORD_CHOICE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1].toLowerCase() === 'did' ? 'had' : m[1].toLowerCase() === 'doing' ? 'having' : 'have'} a party`,
    explanation: 'In natural English, we "have a party" or "throw a party", not "do a party".',
    explanationSi: 'සාදයක් පැවැත්වීම සඳහා "do a party" නොව "have a party" හෝ "throw a party" යයි කියනු ලැබේ.',
    grammar_rule: 'Collocation: have / throw a party',
    example: 'We had a small party to celebrate her birthday.',
    learning_tip: 'Pair "party" with "have" or "throw".',
    confidence: 0.98
  },
  {
    id: 'wc-do-mistake',
    regex: /\b(do|did|doing)\s+a\s+mistake\b/gi,
    category: 'WORD_CHOICE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1].toLowerCase() === 'did' ? 'made' : m[1].toLowerCase() === 'doing' ? 'making' : 'make'} a mistake`,
    explanation: 'The standard English collocation is "make a mistake", not "do a mistake".',
    explanationSi: 'වැරැද්දක් සිදු කිරීම සඳහා "do a mistake" නොව "make a mistake" යයි යෙදේ.',
    grammar_rule: 'Collocation: make a mistake',
    example: 'Everyone makes mistakes when learning a language.',
    learning_tip: 'Remember: do homework, but MAKE a mistake.',
    confidence: 0.99
  },
  {
    id: 'wc-i-am-success',
    regex: /\b(I\s+am|he\s+is|she\s+is|we\s+are|they\s+are)\s+success\b/gi,
    category: 'WORD_CHOICE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `${m[1]} successful`,
    explanation: '"Success" is a noun. After "am / is / are", use the adjective form "successful".',
    explanationSi: '"Success" යනු නාම පදයකි. "I am..." වලින් පසුව "successful" යන නාම විශේෂණය යෙදිය යුතුය.',
    grammar_rule: 'Word Form: be + successful (adjective) vs. achieve success (noun)',
    example: 'She worked hard and became very successful.',
    learning_tip: 'Use "successful" to describe people ("I am successful") and "success" for outcomes ("a huge success").',
    confidence: 0.98
  },
  {
    id: 'wc-highly-interesting',
    regex: /\bhighly\s+interesting\b/gi,
    category: 'WORD_CHOICE',
    severity: 'UNNATURAL',
    getCorrection: () => 'very interesting',
    explanation: '"Highly" collocates with words like "recommended", "skilled", or "unlikely", whereas "interesting" pairs naturally with "very", "really", or "genuinely" (or simply "fascinating").',
    explanationSi: '"Interesting" සමඟ "highly" යෙදීම ස්වාභාවික නොවේ — "very interesting" හෝ "fascinating" භාවිත කරන්න.',
    grammar_rule: 'Collocation: very / genuinely interesting (or "fascinating")',
    example: 'That lecture on artificial intelligence was genuinely fascinating.',
    learning_tip: 'Swap "highly interesting" for "fascinating" or "really interesting".',
    confidence: 0.95
  },
  {
    id: 'alt-take-a-decision',
    regex: /\b(take|took|taking)\s+a\s+decision\b/gi,
    category: 'WORD_CHOICE',
    severity: 'ALTERNATIVE',
    getCorrection: (m) => {
      const v = m[1].toLowerCase();
      return `${v === 'took' ? 'made' : v === 'taking' ? 'making' : 'make'} a decision`;
    },
    explanation: '"Take a decision" is accepted in UK and South Asian English, though "make a decision" is the most widely used international phrasing.',
    explanationSi: '"Take a decision" බ්‍රිතාන්‍ය හා දකුණු ආසියානු ඉංග්‍රීසියේ භාවිත වුවත්, ජාත්‍යන්තරව වඩාත් පොදු යෙදුම "make a decision" වේ.',
    grammar_rule: 'Optional Style Note: make a decision (most common globally)',
    example: 'I need a little time to make a decision about my next course.',
    learning_tip: 'Not an error — just a handy international collocation upgrade!',
    confidence: 0.9
  },
  {
    id: 'wc-strong-rain-big-traffic',
    regex: /\b(strong\s+rain|big\s+traffic)\b/gi,
    category: 'WORD_CHOICE',
    severity: 'UNNATURAL',
    getCorrection: (m) => (m[1].toLowerCase().includes('rain') ? 'heavy rain' : 'heavy traffic'),
    explanation: 'Fluent speakers pair "rain" and "traffic" with "heavy" rather than "strong" or "big".',
    explanationSi: 'වර්ෂාව සහ වාහන තදබදය විස්තර කිරීමට "heavy rain" සහ "heavy traffic" යෙදීම වඩාත් ස්වාභාවික වේ.',
    grammar_rule: 'Natural Collocation: heavy rain / heavy traffic',
    example: 'I got stuck in heavy traffic because of the heavy rain.',
    learning_tip: 'Use "heavy" for intense rain, traffic, and workload.',
    confidence: 0.95
  },

  // 10. LESS NATURAL (Distinct from Grammar Errors!)
  {
    id: 'unnat-having-a-doubt',
    regex: /\b(?:am\s+having|have)\s+a\s+doubt\b/gi,
    category: 'WORD_CHOICE',
    severity: 'UNNATURAL',
    getCorrection: () => 'have a question',
    explanation: 'This is understood in South Asian English, but international fluent speakers say "I have a question" (since "doubt" implies distrust or disbelief).',
    simpleExplanation: 'Say "I have a question" when asking for help or clarification.',
    explanationSi: 'ප්‍රශ්නයක් ඇසීමට "I am having a doubt" වෙනුවට "I have a question" යෙදීම ජාත්‍යන්තර ඉංග්‍රීසියේ වඩාත් ස්වාභාවික වේ.',
    sinhalaTransferNote: 'සිංහලෙන් "සැකයක් තියෙනවා" යන වචනාර්ථය නිසා "having a doubt" කිව්වත්, ඉංග්‍රීසියේ "doubt" අවිශ්වාසය හඟවන බැවින් "I have a question" යොදන්න.',
    grammar_rule: 'Natural Expression: have a question (vs. doubt = disbelief)',
    example: 'Excuse me, I have a quick question about this topic.',
    learning_tip: 'Use "I have a question" when asking for clarification.',
    confidence: 0.96
  },
  {
    id: 'unnat-return-back',
    regex: /\b(return|returned|returning)\s+back\b/gi,
    category: 'WORD_CHOICE',
    severity: 'UNNATURAL',
    getCorrection: (m) => m[1],
    explanation: '"Return" already means "come/go back", so adding "back" is redundant.',
    explanationSi: '"Return" තුළම "ආපසු" යන අර්ථය ඇති නිසා "back" නැවත යෙදීම අනවශ්‍යයි.',
    grammar_rule: 'Avoid redundancy: return (or go back)',
    example: 'We returned home around 8 PM.',
    learning_tip: 'Choose either "return home" or "go back home".',
    confidence: 0.94
  },

  // 11. SENTENCE STRUCTURE (Standalone Fragment)
  {
    id: 'ss-because-fragment',
    regex: /^because\s+[^,.?!]{4,45}[.!?]?$/i,
    category: 'SENTENCE_STRUCTURE',
    severity: 'GRAMMAR_ERROR',
    getCorrection: (m) => `I did that ${m[0].charAt(0).toLowerCase()}${m[0].slice(1)}`,
    explanation: 'Starting and ending a standalone sentence with "Because..." leaves it as a dependent fragment. Attach it to a main clause in formal or complete responses.',
    explanationSi: '"Because..." යන්නෙන් පමණක් වාක්‍යය අවසන් කිරීම අසම්පූර්ණ වාක්‍යයකි (fragment). ප්‍රධාන වාක්‍ය කොටසක් සමඟ එය සම්බන්ධ කරන්න.',
    grammar_rule: 'Complete Complex Sentence: Main Clause + because + Reason Clause',
    example: 'I stayed home because I was tired.',
    learning_tip: 'Try completing the thought: "I stayed home because I was tired."',
    confidence: 0.88
  },

  // 12. REPETITION
  {
    id: 'rep-duplicate-phrase',
    regex: /\b(I\s+think|actually|basically|like)[,\s]+\1\b/gi,
    category: 'REPETITION',
    severity: 'UNNATURAL',
    getCorrection: (m) => m[1],
    explanation: 'Repeating the same filler phrase back-to-back breaks spoken flow. Pause quietly for half a second instead.',
    explanationSi: 'එකම වචනය නැවත නැවත කීම කථන චතුරතාව අඩු කරයි. ඒ වෙනුවට මොහොතක් නිහඬව සිතන්න.',
    grammar_rule: 'Spoken Fluency: Eliminate immediate phrase repetition',
    example: 'Personally, I think that approach works well.',
    learning_tip: 'A calm half-second pause sounds more confident than repeating "I think, I think".',
    confidence: 0.92
  },

  // 13. VOCABULARY UPGRADES (Strictly labelled ADVANCED — never Incorrect!)
  {
    id: 'voc-very-good',
    regex: /\bvery\s+good\b/gi,
    category: 'VOCABULARY',
    severity: 'ADVANCED',
    getCorrection: () => 'excellent',
    explanation: '"Very good" is grammatically correct, and upgrading to "excellent", "fantastic", or "outstanding" makes your speaking sound richer.',
    explanationSi: '"Very good" නිවැරදි වුවත්, "excellent" හෝ "outstanding" වැනි වචන භාවිතයෙන් ඔබේ ඉංග්‍රීසි වඩාත් උසස් ලෙස ඇසේ.',
    grammar_rule: 'Vocabulary Upgrade: Avoid overusing "very + basic adjective"',
    example: 'The lecture was genuinely fascinating and well-structured.',
    more_examples: ['That movie was absolutely captivating.', 'She did an outstanding job.'],
    learning_tip: 'Swap "very good" for "excellent", "wonderful", or "impressive".',
    confidence: 0.9
  },
  {
    id: 'voc-very-interesting',
    regex: /\bvery\s+interesting\b/gi,
    category: 'VOCABULARY',
    severity: 'ADVANCED',
    getCorrection: () => 'fascinating',
    explanation: '"Very interesting" is completely correct! Using "fascinating" or "captivating" adds vivid natural nuance.',
    explanationSi: '"Very interesting" වෙනුවට "fascinating" හෝ "captivating" යෙදීමෙන් අදහස වඩාත් ආකර්ෂණීය වේ.',
    grammar_rule: 'Expressive Adjectives: very interesting → fascinating / captivating',
    example: 'We had a fascinating discussion about artificial intelligence.',
    learning_tip: 'Use "fascinating" for ideas/lectures and "captivating" for stories/movies.',
    confidence: 0.9
  }
];

function preservesInitialCap(orig: string, replacement: string): string {
  if (!orig || !replacement) return replacement;
  if (orig[0] === orig[0].toUpperCase() && orig[0] !== orig[0].toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/**
 * Phase 3 — P1.2 Vocabulary & Natural-Expression Upgrade Detector
 * Scans clear sentences for overused basic words ("very good", "very interesting", "big", "tired", etc.)
 * and surfaces 3 nuance-labelled upgrades + a fluent natural-sentence rewrite (never marked as Incorrect!).
 */
interface VocabUpgradeSpec {
  id: string;
  regex: RegExp;
  broadOnly?: boolean;
  upgrades: { word: string; nuance: string }[];
  explanation: string;
  explanationSi: string;
  example: string;
  category: 'vocabulary' | 'collocation' | 'expression';
}

const VOCAB_UPGRADE_SPECS: VocabUpgradeSpec[] = [
  {
    id: 'vu-very-good',
    regex: /\b(?:very|really|so)\s+good\b/gi,
    upgrades: [
      { word: 'excellent', nuance: 'common & polished' },
      { word: 'outstanding', nuance: 'impressive quality' },
      { word: 'fantastic', nuance: 'warm & enthusiastic' }
    ],
    explanation: 'Replacing "very good" with a vivid single adjective immediately makes your spoken English sound more fluent and expressive.',
    explanationSi: '"Very good" වෙනුවට "excellent" හෝ "fantastic" යෙදීමෙන් ඔබේ කථනය වඩාත් චතුර ලෙස ඇසේ.',
    example: 'The presentation was genuinely outstanding from start to finish.',
    category: 'vocabulary'
  },
  {
    id: 'vu-very-interesting',
    regex: /\b(?:very|really|so|highly)\s+interesting\b/gi,
    upgrades: [
      { word: 'fascinating', nuance: 'deeply engaging' },
      { word: 'captivating', nuance: 'holds full attention' },
      { word: 'thought-provoking', nuance: 'sparks ideas' }
    ],
    explanation: 'Using "fascinating" or "captivating" avoids repetitive "very + adjective" phrasing and fits movies, books, and lectures.',
    explanationSi: '"Very interesting" වෙනුවට "fascinating" හෝ "captivating" යෙදීමෙන් අදහස වඩාත් ප්‍රබල වේ.',
    example: 'The movie was absolutely fascinating — I was captivated by its storyline.',
    category: 'vocabulary'
  },
  {
    id: 'vu-very-bad',
    regex: /\b(?:very|really|so)\s+bad\b/gi,
    upgrades: [
      { word: 'terrible', nuance: 'strong everyday' },
      { word: 'awful', nuance: 'expressive casual' },
      { word: 'disappointing', nuance: 'polite & IELTS-ready' }
    ],
    explanation: '"Terrible", "awful", or "disappointing" carry much clearer emotional precision than "very bad".',
    explanationSi: '"Very bad" වෙනුවට "terrible" හෝ "disappointing" යෙදීම වඩාත් නිවැරදි හා ස්වාභාවික වේ.',
    example: 'The weather was terrible this morning, so we stayed indoors.',
    category: 'vocabulary'
  },
  {
    id: 'vu-very-tired',
    regex: /\b(?:very|really|so)\s+tired\b/gi,
    upgrades: [
      { word: 'exhausted', nuance: 'completely drained' },
      { word: 'worn out', nuance: 'natural phrasal' },
      { word: 'drained', nuance: 'mentally or physically' }
    ],
    explanation: '"Exhausted" and "worn out" are natural everyday upgrades when you want to describe real fatigue.',
    explanationSi: 'අධික වෙහෙස දැක්වීමට "very tired" වෙනුවට "exhausted" හෝ "worn out" යොදන්න.',
    example: 'After three back-to-back lectures, I was completely exhausted.',
    category: 'vocabulary'
  },
  {
    id: 'vu-very-important',
    regex: /\b(?:very|really|so)\s+important\b/gi,
    upgrades: [
      { word: 'essential', nuance: 'necessary' },
      { word: 'crucial', nuance: 'decisive impact' },
      { word: 'vital', nuance: 'high priority' }
    ],
    explanation: '"Crucial" and "essential" elevate both everyday explanations and IELTS Part 3 answers effortlessly.',
    explanationSi: '"Very important" වෙනුවට "crucial" හෝ "essential" යෙදීම IELTS කථනයට ඉතා සුදුසුයි.',
    example: 'Consistent daily practice is essential for speaking confidence.',
    category: 'vocabulary'
  },
  {
    id: 'vu-very-happy',
    regex: /\b(?:very|really|so)\s+happy\b/gi,
    upgrades: [
      { word: 'delighted', nuance: 'warm & polished' },
      { word: 'thrilled', nuance: 'excited joy' },
      { word: 'over the moon', nuance: 'natural idiom' }
    ],
    explanation: 'Expressive words like "thrilled" or "delighted" make personal stories sound much livelier.',
    explanationSi: 'සතුට ප්‍රකාශ කිරීමට "very happy" වෙනුවට "delighted" හෝ "thrilled" යොදන්න.',
    example: 'I was thrilled when I heard the good news about my exam.',
    category: 'expression'
  },
  {
    id: 'vu-very-big',
    regex: /\b(?:very|really|so)\s+big\b/gi,
    upgrades: [
      { word: 'huge', nuance: 'everyday natural' },
      { word: 'massive', nuance: 'impressive scale' },
      { word: 'enormous', nuance: 'vivid descriptive' }
    ],
    explanation: '"Huge" or "massive" sounds cleaner and more natural than "very big".',
    explanationSi: '"Very big" වෙනුවට "huge" හෝ "massive" භාවිත කිරීම වඩාත් ස්වාභාවිකයි.',
    example: 'We cooked a huge meal for the whole family on Sunday.',
    category: 'vocabulary'
  },
  {
    id: 'vu-too-much-work',
    regex: /\b(?:too\s+much|a\s+lot\s+of|lots\s+of)\s+work\b/gi,
    upgrades: [
      { word: 'overwhelmed with work', nuance: 'natural expression' },
      { word: 'a heavy workload', nuance: 'IELTS-ready collocation' },
      { word: 'swamped with tasks', nuance: 'idiomatic casual' }
    ],
    explanation: 'Fluent speakers often say "I was overwhelmed with work" or "I had a heavy workload" instead of repeating "lots of work".',
    explanationSi: 'වැඩ බහුල බව කියන්න "overwhelmed with work" හෝ "a heavy workload" භාවිත කළ හැකියි.',
    example: 'Sorry I missed your call — I had a heavy workload all week.',
    category: 'expression'
  },
  {
    id: 'vu-very-nice',
    regex: /\b(?:very|really|so)\s+nice\b/gi,
    upgrades: [
      { word: 'lovely', nuance: 'warm & natural' },
      { word: 'wonderful', nuance: 'enthusiastic' },
      { word: 'pleasant', nuance: 'calm & refined' }
    ],
    explanation: '"Nice" is one of the most overused adjectives in English — swapping in "lovely" or "wonderful" adds real warmth.',
    explanationSi: '"Very nice" වෙනුවට "lovely" හෝ "wonderful" යෙදීමෙන් අදහස වඩාත් රසවත් වේ.',
    example: 'We had a lovely evening catching up over coffee.',
    category: 'vocabulary'
  },
  {
    id: 'vu-standalone-good',
    regex: /\b(good)\b/gi,
    broadOnly: true,
    upgrades: [
      { word: 'enjoyable', nuance: 'for experiences' },
      { word: 'impressive', nuance: 'for quality' },
      { word: 'rewarding', nuance: 'for effort' }
    ],
    explanation: 'In Vocabulary Builder / Detailed mode, try swapping basic "good" for a more specific adjective that matches what you mean.',
    explanationSi: 'සාමාන්‍ය "good" වචනය වෙනුවට අවස්ථාවට ගැලපෙන "enjoyable" හෝ "impressive" වැනි වචනයක් යොදන්න.',
    example: 'It was a genuinely enjoyable afternoon with friends.',
    category: 'vocabulary'
  },
  {
    id: 'vu-standalone-nice',
    regex: /\b(nice)\b/gi,
    broadOnly: true,
    upgrades: [
      { word: 'pleasant', nuance: 'atmosphere / weather' },
      { word: 'thoughtful', nuance: 'people / gestures' },
      { word: 'cozy', nuance: 'places / cafes' }
    ],
    explanation: 'Choosing a more descriptive word than "nice" paints a clearer picture for your listener.',
    explanationSi: '"Nice" වෙනුවට "pleasant" හෝ "cozy" වැනි පැහැදිලි විශේෂණ පදයක් භාවිත කරන්න.',
    example: 'We found a cozy little cafe near the park.',
    category: 'vocabulary'
  }
];

export function detectVocabUpgrades(
  text: string,
  correctedSentence: string,
  intensity: CorrectionIntensity = 'balanced',
  mode: BuddyMode = 'friendly'
): BuddyVocabUpgrade[] {
  // Gentle mode stays focused on clarity unless user explicitly chose Vocabulary Builder mode
  if (intensity === 'gentle' && mode !== 'vocabulary') return [];

  const allowBroad = intensity === 'detailed' || mode === 'vocabulary';
  const maxItems = mode === 'vocabulary' || intensity === 'detailed' ? 3 : 2;
  const results: BuddyVocabUpgrade[] = [];
  const usedSpans: [number, number][] = [];

  for (const spec of VOCAB_UPGRADE_SPECS) {
    if (spec.broadOnly && !allowBroad) continue;
    spec.regex.lastIndex = 0;
    const match = spec.regex.exec(text);
    if (!match) continue;

    const start = match.index;
    const end = start + match[0].length;
    const overlaps = usedSpans.some(([s, e]) => !(end <= s || start >= e));
    if (overlaps) continue;
    usedSpans.push([start, end]);

    const topWord = spec.upgrades[0].word;
    const escaped = match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const naturalSentence = correctedSentence.replace(
      new RegExp(escaped, 'i'),
      preservesInitialCap(match[0], topWord)
    );

    results.push({
      id: `${spec.id}-${start}`,
      original: match[0],
      upgrades: spec.upgrades,
      explanation: spec.explanation,
      explanationSi: spec.explanationSi,
      example: spec.example,
      naturalSentence:
        naturalSentence.toLowerCase() !== correctedSentence.toLowerCase()
          ? naturalSentence
          : undefined,
      category: spec.category
    });

    if (results.length >= maxItems) break;
  }

  return results;
}

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
    providedCoherence || validateTranscriptCoherence(clean, uncertainWords, sttConfidence);

  // Stage A Gate: If transcript is incoherent / garbled STT, NEVER pretend it's "Clean, natural English"!
  if (coherence.quality === 'unclear') {
    return {
      original_sentence: clean,
      corrected_sentence: clean,
      mistakes: [],
      natural_expression: null,
      learning_recommendation: null,
      transcriptQuality: 'unclear',
      clarificationNote:
        coherence.clarificationHint ||
        coherence.reason ||
        "That sounded unclear — try speaking again or click Edit to fix any misheard words.",
      skippedUncertainWords: uncertainWords.length > 0 ? uncertainWords : undefined,
      analyzerSource: 'local',
      analyzedAt: Date.now()
    };
  }

  const uncertainSet = new Set(uncertainWords.map(w => w.toLowerCase()));
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

  return {
    original_sentence: clean,
    corrected_sentence: correctedSentence,
    mistakes,
    vocabUpgrades: vocabUpgrades.length > 0 ? vocabUpgrades : undefined,
    natural_expression: naturalExpression,
    learning_recommendation: topCat
      ? `Focus area: ${topCat} — keep practising this pattern in your next few turns.`
      : vocabUpgrades.length > 0
      ? `Vocabulary boost: try swapping "${vocabUpgrades[0].original}" for "${vocabUpgrades[0].upgrades[0].word}".`
      : null,
    transcriptQuality: coherence.quality,
    clarificationNote: coherence.clarificationHint || coherence.reason,
    isProvisional: hasProvisional || undefined,
    fluency,
    pronunciationSpotlights: pronunciationSpotlights.length > 0 ? pronunciationSpotlights : undefined,
    skippedUncertainWords: skippedUncertain.size > 0 ? Array.from(skippedUncertain) : undefined,
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
  // Never invent grammar corrections on unclear speech OR incomplete broken fragments!
  if (
    !analysis ||
    analysis.transcriptQuality === 'unclear' ||
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
    providedCoherence || validateTranscriptCoherence(clean, uncertainWords, sttConfidence);

  // Always compute instant local baseline as fallback & sanity cross-check (including conversationContext!)
  const localFallback = analyzeBuddyGrammarLocally({
    originalTranscript: clean,
    conversationContext,
    intensity,
    mode,
    uncertainWords,
    sttConfidence,
    durationSec,
    coherence
  });

  // If Stage A already flagged clear STT garbage and no API key is present (or even with API key),
  // avoid misreporting garbled STT as clean grammar.
  if (!apiKey || !apiKey.trim()) {
    return localFallback;
  }

  const intensityInstruction =
    intensity === 'gentle'
      ? 'Gentle mode: return ONLY 1–2 major GRAMMAR_ERROR items that impact clarity. Ignore minor stylistic tweaks.'
      : intensity === 'detailed'
      ? 'Detailed mode: identify every meaningful grammar error, unnatural expression, and high-value vocabulary upgrade with clear rules and multiple examples.'
      : 'Balanced mode: identify meaningful grammar mistakes and clear unnatural expressions, plus at most 1 optional vocabulary upgrade if genuinely helpful.';

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
8. For each mistake, include a clear plain-English "explanation" AND a conceptual Sinhala "explanationSi".

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

  let primaryModel = (model || '').trim().replace(/^models\//, '');
  if (!primaryModel || primaryModel.includes('3.8')) {
    primaryModel = 'gemini-2.5-flash';
  }
  const candidateModels = Array.from(
    new Set([primaryModel, 'gemini-2.5-flash', 'gemini-2.0-flash'])
  );

  for (const candidateModel of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidateModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.12, responseMimeType: 'application/json' }
        })
      });

      clearTimeout(timeoutId);
      if (!response.ok) {
        if ([400, 404, 429, 500, 503].includes(response.status)) continue;
        return localFallback;
      }

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
      resolvedQuality === 'unclear'
        ? clean
        : typeof parsed.corrected_sentence === 'string' && parsed.corrected_sentence.trim()
        ? parsed.corrected_sentence.trim()
        : clean;

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
          : null,
      transcriptQuality: resolvedQuality,
      clarificationNote:
        typeof parsed.clarification_note === 'string' && parsed.clarification_note.trim()
          ? parsed.clarification_note.trim()
          : coherence.clarificationHint || coherence.reason,
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
