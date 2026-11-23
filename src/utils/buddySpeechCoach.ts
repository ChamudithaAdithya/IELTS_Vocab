/**
 * AI Speaking Buddy (Lingo Buddy) — Phase 4 Advanced Speech, Fluency & Sinhala Coach (P2.1 & P2.3)
 *
 * Architectural Rule (PHASE_04_ADVANCED_ENGLISH_INTELLIGENCE.md §1):
 * - Evaluates HOW the learner speaks (speed, pauses, hesitations, repetition, self-correction,
 *   sentence length, response development, word stress & connected speech) separately from grammar.
 * - NEVER treats ordinary STT confidence scores as a phoneme pronunciation score.
 * - NEVER equates speaking faster with better fluency — prioritizes clarity, rhythm, and coherence.
 */

import type {
  BuddyFluencyMetrics,
  PronunciationSpotlight
} from '../types/speakingBuddy';

// ---------------------------------------------------------------------------
// P2.1 CURATED WORD-STRESS, DIFFICULT SOUNDS & CONNECTED-SPEECH COACHING BANK
// ---------------------------------------------------------------------------
export const PRONUNCIATION_DRILL_BANK: PronunciationSpotlight[] = [
  {
    word: 'comfortable',
    stressPattern: 'COM-for-ta-ble (3 syllables: KUMF-tuh-buhl)',
    ipa: '/ˈkʌm.fə.tə.bəl/',
    tip: 'Stress the first syllable "COM" and soften/reduce the middle "-for-" sound instead of pronouncing "com-FOR-ta-ble".',
    tipSi: 'පළමු අක්ෂරය වන "COM" ශබ්දයට බර දෙන්න — මැද "for" ශබ්දය මෘදු ලෙස කියන්න ("KUMF-tuh-buhl").',
    category: 'stress',
    example: 'I feel much more comfortable speaking English with a friend.'
  },
  {
    word: 'vegetable',
    stressPattern: 'VEG-ta-ble (3 syllables: VEJ-tuh-buhl)',
    ipa: '/ˈvedʒ.tə.bəl/',
    tip: 'Drop the middle "-e-" syllable cleanly — say "VEJ-tuh-buhl", not "ve-ge-TA-ble".',
    tipSi: 'මැද "e" ශබ්දය ඉවත් කර අක්ෂර 3කින් "VEJ-tuh-buhl" ලෙස ස්වාභාවිකව උච්චාරණය කරන්න.',
    category: 'stress',
    example: 'I added fresh vegetables and ginger to the pan.'
  },
  {
    word: 'interesting',
    stressPattern: 'IN-tres-ting (stress on 1st syllable)',
    ipa: '/ˈɪn.trəs.tɪŋ/',
    tip: 'Place primary stress on "IN-" and blend "-ter-" smoothly into 3 syllables: "IN-tres-ting".',
    tipSi: '"IN" කොටසට බර දී අක්ෂර 3කින් "IN-tres-ting" ලෙස කියන්න.',
    category: 'stress',
    example: 'That documentary about space was really interesting.'
  },
  {
    word: 'technology',
    stressPattern: 'tech-NOL-o-gy (stress on 2nd syllable)',
    ipa: '/tekˈnɒl.ə.dʒi/',
    tip: 'Keep the main beat clearly on "-NOL-" while keeping "tech-" short and crisp.',
    tipSi: 'දෙවන අක්ෂරය වන "NOL" මත ප්‍රධාන බර (stress) තබන්න: tech-NOL-o-gy.',
    category: 'stress',
    example: 'Modern technology makes daily English practice much easier.'
  },
  {
    word: 'development',
    stressPattern: 'de-VEL-op-ment (stress on 2nd syllable)',
    ipa: '/dɪˈvel.əp.mənt/',
    tip: 'Stress "-VEL-", not "-op-". Notice the soft schwa sound in "-op-" and "-ment".',
    tipSi: '"VEL" කොටසට බර දෙන්න — "de-VEL-op-ment".',
    category: 'stress',
    example: 'Software development requires patience and steady practice.'
  },
  {
    word: 'environment',
    stressPattern: 'en-VI-ron-ment (stress on 2nd syllable)',
    ipa: '/ɪnˈvaɪ.rən.mənt/',
    tip: 'Keep the "n" subtle before "m" and glide cleanly through "-VI-ron-ment".',
    tipSi: '"VI" කොටසට බර දී "en-VI-ron-ment" ලෙස සුමටව කියන්න.',
    category: 'stress',
    example: 'A relaxed environment helps you speak without fear.'
  },
  {
    word: 'university',
    stressPattern: 'u-ni-VER-si-ty (stress on 3rd syllable)',
    ipa: '/ˌjuː.nɪˈvɜː.sə.ti/',
    tip: 'Begin with a clear "yoo-" consonant glide (which is why we say "a university", not "an") and stress "-VER-".',
    tipSi: '"යූ" (yoo) ශබ්දයෙන් ආරම්භ කර "VER" කොටසට බර දෙන්න — ඒ නිසා "a university" යයි යෙදේ.',
    category: 'stress',
    example: 'Yesterday I went to university and met my friends.'
  },
  {
    word: 'restaurant',
    stressPattern: 'RES-tront / RES-tuh-ront',
    ipa: '/ˈres.trɒnt/',
    tip: 'Stress "RES-" strongly and soften the middle "-au-" syllable so it flows naturally.',
    tipSi: '"RES" කොටසට බර දී මැද කොටස සැහැල්ලුවෙන් කියන්න ("RES-tront").',
    category: 'stress',
    example: 'We tried a cozy little restaurant near the beach.'
  },
  {
    word: 'clothes',
    stressPattern: 'CLOHZ (single smooth syllable)',
    ipa: '/kləʊðz/',
    tip: 'In natural connected speech, "clothes" sounds almost like "close" (one syllable), not "clo-thez".',
    tipSi: '"Clothes" තනි අක්ෂරයක් ලෙස "ක්ලෝස්" (clohz) ලෙස උච්චාරණය කරන්න — "clo-thez" නොවේ.',
    category: 'consonant_vowel',
    example: 'I went shopping yesterday and bought some clothes.'
  },
  {
    word: 'actually',
    stressPattern: 'AK-choo-uh-lee (stress on 1st syllable)',
    ipa: '/ˈæk.tʃu.ə.li/',
    tip: 'Keep the opening "AK-" crisp and blend "-tu-" into a soft "ch" sound.',
    tipSi: 'මුල් "AK" ශබ්දය පැහැදිලිව කියා "-tu-" කොටස මෘදු "ච" ශබ්දයක් ලෙස සම්බන්ධ කරන්න.',
    category: 'consonant_vowel',
    example: 'Actually, I ended up cooking a big meal at home.'
  },
  {
    word: 'favourite',
    stressPattern: 'FAV-rit (2–3 light syllables)',
    ipa: '/ˈfeɪ.vər.ɪt/',
    tip: 'Stress "FAV-" with a long "ay" vowel and keep the ending short and light.',
    tipSi: '"FAV" කොටස දිගු "ඒ" ශබ්දයකින් බර දී "FAV-rit" ලෙස කෙටියෙන් අවසන් කරන්න.',
    category: 'stress',
    example: 'Chicken curry with ginger is my favourite homemade dish.'
  },
  {
    word: 'pronunciation',
    stressPattern: 'pro-nun-ci-A-tion (stress on "-A-")',
    ipa: '/prəˌnʌn.siˈeɪ.ʃən/',
    tip: 'Notice it is "pro-NUN-" (short u), NOT "pro-NOUN-". Primary stress lands on "-A-".',
    tipSi: '"pro-NOUN" නොව "pro-NUN-ci-A-tion" ලෙස මැද කොටස කෙටියෙන් සහ "A" කොටසට බර දී කියන්න.',
    category: 'consonant_vowel',
    example: 'Clear pronunciation matters more than speaking super fast.'
  },
  {
    word: 'recipe',
    stressPattern: 'RES-uh-pee (final "-e" is pronounced "ee")',
    ipa: '/ˈres.ə.pi/',
    tip: 'Pronounce all 3 syllables with a bright "-pee" at the end — never "re-sipe".',
    tipSi: 'අග "e" අකුර "ඊ" ලෙස ශබ්ද කරමින් "RES-uh-pee" ලෙස කියන්න.',
    category: 'consonant_vowel',
    example: 'I learned this ginger curry recipe from my family.'
  },
  {
    word: 'schedule',
    stressPattern: 'SHED-yool (UK) / SKEJ-ool (US)',
    ipa: '/ˈʃedʒ.uːl/ · /ˈskedʒ.uːl/',
    tip: 'Both British ("SHED-yool") and American ("SKEJ-ool") are 100% standard — pick whichever feels most natural to you.',
    tipSi: 'බ්‍රිතාන්‍ය ("SHED-yool") සහ ඇමරිකානු ("SKEJ-ool") උච්චාරණ දෙකම නිවැරදියි.',
    category: 'consonant_vowel',
    example: 'My university schedule is pretty packed this semester.'
  },
  {
    word: 'going to',
    stressPattern: 'Linking: "going-to" → smooth glide ("goin\' to")',
    ipa: '/ˈɡəʊ.ɪŋ.tuː/',
    tip: 'Link "going" smoothly into "to" without a harsh stop between words for natural spoken rhythm.',
    tipSi: '"Going" සහ "to" අතර දැඩි විරාමයක් නොතබා සුමටව සම්බන්ධ කර කියන්න.',
    category: 'linking',
    example: "I'm going to cook a big meal tonight."
  },
  {
    word: 'want to',
    stressPattern: 'Linking: "want-to" → single shared "t" sound',
    ipa: '/ˈwɒnt.tuː/',
    tip: 'Blend the two "t" sounds into one smooth consonant instead of pausing between "want" and "to".',
    tipSi: 'වචන දෙකේ "t" ශබ්ද දෙක වෙන් නොකර එකට සම්බන්ධ කර ස්වාභාවිකව කියන්න.',
    category: 'linking',
    example: 'I want to explore different cultures when I travel.'
  },
  {
    word: 'because',
    stressPattern: 'be-CAUSE (stress on 2nd syllable)',
    ipa: '/bɪˈkɒz/',
    tip: 'Keep "be-" light and quick, and land your voice cleanly on "-CAUSE" to introduce reasons smoothly.',
    tipSi: '"be" කොටස සැහැල්ලුවෙන් කියා "-CAUSE" කොටසට බර දෙන්න.',
    category: 'stress',
    example: 'I enjoy travelling because it opens my mind.'
  },
  {
    word: 'tomorrow',
    stressPattern: 'to-MOR-row (stress on 2nd syllable)',
    ipa: '/təˈmɒr.əʊ/',
    tip: 'Reduce the opening "to-" to a quick "tuh-" and stress "-MOR-".',
    tipSi: 'මුල් "to" සැහැල්ලුවෙන් "tuh" ලෙස කියා "-MOR-" කොටසට බර දෙන්න.',
    category: 'stress',
    example: 'I think there might not be school tomorrow.'
  }
];

/**
 * Extracts up to 2 relevant Pronunciation & Stress Spotlights from the user's actual utterance.
 * Note: Does NOT pretend STT confidence is a phoneme score — gives proactive phonetic & stress coaching
 * on real target words the speaker just used.
 */
export function extractPronunciationSpotlights(
  transcript: string,
  uncertainWords: string[] = []
): PronunciationSpotlight[] {
  const lower = transcript.toLowerCase();
  const uncertainSet = new Set(uncertainWords.map(w => w.toLowerCase()));
  const matched: { item: PronunciationSpotlight; priority: number }[] = [];

  for (const entry of PRONUNCIATION_DRILL_BANK) {
    const escaped = entry.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'i');
    if (re.test(lower)) {
      const priority = uncertainSet.has(entry.word.toLowerCase()) ? 0 : 1;
      matched.push({ item: entry, priority });
    }
  }

  matched.sort((a, b) => a.priority - b.priority);
  return matched.slice(0, 2).map(m => m.item);
}

// ---------------------------------------------------------------------------
// P2.1 SEVEN-METRIC FLUENCY ANALYZER (Speed, Pauses, Hesitations, Repetitions,
// Self-Corrections, Sentence Length, Response Development)
// ---------------------------------------------------------------------------
const HESITATION_REGEX = /\b(um+|uh+|er+|erm+|ah+|hmm+|you know|sort of|kind of)\b/gi;
const SELF_CORRECTION_REGEX = /\b(i mean|sorry,?\s+i|wait,?\s+i|no,?\s+actually|or rather|what i meant)\b/gi;
const ELABORATION_CONNECTORS = /\b(because|since|although|whereas|however|for example|for instance|such as|therefore|so that|especially|in fact|which means)\b/gi;

export function analyzeBuddyFluency(
  transcript: string,
  durationSec?: number
): BuddyFluencyMetrics {
  const clean = transcript.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Speaking Speed (WPM) — fallback assumes ~130 WPM natural baseline for typed or very short turns
  // Short turns (< 6 words) are dominated by mic/VAD latency, so avoid misleading "40 WPM" scores!
  const effectiveSec =
    typeof durationSec === 'number' && durationSec > 0 && wordCount >= 6
      ? Math.max(1.5, durationSec)
      : Math.max(1.5, (wordCount / 130) * 60);
  const rawWpm = Math.round((wordCount / effectiveSec) * 60);
  const wpm = Math.max(50, Math.min(240, rawWpm));

  let paceLabel: BuddyFluencyMetrics['paceLabel'] = 'Comfortable Pace';
  if (wpm < 100) paceLabel = 'Slow & Deliberate';
  else if (wpm <= 155) paceLabel = 'Comfortable Pace';
  else if (wpm <= 185) paceLabel = 'Brisk Pace';
  else paceLabel = 'Very Fast';

  // 2. Hesitations (vocalized fillers)
  const hesitationMatches = clean.match(HESITATION_REGEX) || [];
  const hesitationFillers = Array.from(new Set(hesitationMatches.map(m => m.toLowerCase())));
  const hesitationCount = hesitationMatches.length;

  // 3. Repetition (immediate repeated words or 2-word restarts)
  const repeatedPhrases: string[] = [];
  const repWordMatches = clean.match(/\b([a-z']{2,})[\s,]+\1\b/gi) || [];
  const repPhraseMatches = clean.match(/\b([a-z']+\s+[a-z']+)[\s,]+\1\b/gi) || [];
  [...repPhraseMatches, ...repWordMatches].forEach(r => {
    const norm = r.trim().toLowerCase();
    if (!repeatedPhrases.includes(norm)) repeatedPhrases.push(norm);
  });
  const repetitionCount = repeatedPhrases.length;

  // 4. Self-Corrections (mid-sentence restarts)
  const selfCorrectionCount = (clean.match(SELF_CORRECTION_REGEX) || []).length;

  // 5. Pauses (estimated from punctuation breaks, ellipses, hesitation stops & silence ratio)
  const ellipsisPauses = (clean.match(/\.\.\.|—|--/g) || []).length;
  const expectedSpeechSec = (wordCount / 145) * 60;
  const extraSilenceSec = Math.max(0, effectiveSec - expectedSpeechSec);
  const pauseCount = ellipsisPauses + hesitationCount + (extraSilenceSec > 2.2 ? Math.round(extraSilenceSec / 1.8) : 0);
  const avgPauseSec =
    pauseCount > 0 ? Number(Math.max(0.4, Math.min(3.5, (extraSilenceSec + pauseCount * 0.45) / pauseCount)).toFixed(1)) : 0;

  // 6. Average Sentence Length
  const sentences = clean
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(Boolean);
  const avgSentenceLength =
    sentences.length > 0 ? Number((wordCount / sentences.length).toFixed(1)) : wordCount;

  // 7. Response Development (ideas, reasons, examples — NOT raw speed!)
  const connectorCount = (clean.match(ELABORATION_CONNECTORS) || []).length;
  let developmentScore = Math.min(100, wordCount * 3 + connectorCount * 18 + (sentences.length >= 2 ? 16 : 0));
  if (wordCount <= 5) developmentScore = Math.min(developmentScore, 32);
  let responseDevelopment: BuddyFluencyMetrics['responseDevelopment'] = 'Developing';
  if (developmentScore >= 68) responseDevelopment = 'Well-Developed';
  else if (developmentScore < 38) responseDevelopment = 'Brief';

  // Coaching Principle (Phase 4 §1C): NEVER equate faster with better fluency!
  let clarityRhythmNote = '';
  if (wpm > 185) {
    clarityRhythmNote =
      'You spoke quite rapidly — slowing down slightly with calm pauses between ideas will make your pronunciation and clarity shine even more.';
  } else if (hesitationCount >= 2 || repetitionCount >= 1) {
    clarityRhythmNote =
      'Your pace is clear, though a couple of fillers or restarts interrupted your rhythm. A quiet half-second pause sounds more confident than "um" or repeating a word.';
  } else if (responseDevelopment === 'Brief') {
    clarityRhythmNote =
      'Clear delivery! Try expanding your next reply with one extra reason ("because...") or a quick example to build stronger fluency.';
  } else if (paceLabel === 'Slow & Deliberate') {
    clarityRhythmNote =
      'Steady, clear pacing — clarity always beats rushing. Keep linking short thought groups smoothly as your confidence grows.';
  } else {
    clarityRhythmNote =
      'Comfortable, natural speaking rhythm with good clarity! Keep elaborating with reasons and everyday examples.';
  }

  return {
    wpm,
    paceLabel,
    pauseCount,
    avgPauseSec,
    hesitationCount,
    hesitationFillers,
    repetitionCount,
    repeatedPhrases,
    selfCorrectionCount,
    avgSentenceLength,
    responseDevelopment,
    developmentScore,
    clarityRhythmNote
  };
}

// ---------------------------------------------------------------------------
// P2.3 SINHALA (සිංහල) STRUCTURAL TRANSFER & GRAMMAR CONCEPT GUIDE
// ---------------------------------------------------------------------------
export interface SinhalaTransferGuideItem {
  id: string;
  titleEn: string;
  titleSi: string;
  commonTransfer: string;
  naturalEnglish: string;
  whySi: string;
  whyEn: string;
  example: string;
}

export const SINHALA_TRANSFER_GUIDE: SinhalaTransferGuideItem[] = [
  {
    id: 'si-word-order',
    titleEn: 'Word Order: Sinhala (SOV) vs. English (SVO)',
    titleSi: 'වාක්‍ය රටාව: සිංහල (කර්තෘ-කර්ම-ක්‍රියා) vs. ඉංග්‍රීසි (කර්තෘ-ක්‍රියා-කර්ම)',
    commonTransfer: 'I very much like it / Maybe will school not tomorrow',
    naturalEnglish: 'I like it very much / There might not be school tomorrow',
    whySi: 'සිංහල භාෂාවේ ක්‍රියාපදය වාක්‍යය අගට එන නමුත්, ඉංග්‍රීසියේ කර්තෘ (Subject) ළඟටම ක්‍රියාපදය (Verb) සහ ඉන්පසු කර්මය (Object) යෙදිය යුතුය.',
    whyEn: 'English keeps Subject + Verb + Object tightly together, placing adverbs like "very much" at the end.',
    example: 'I watched that film yesterday and liked it very much.'
  },
  {
    id: 'si-have-v3',
    titleEn: 'Perfect Tense: Have / Has + V3 (Past Participle)',
    titleSi: 'Have / Has සමඟ V3 (Past Participle) භාවිතය',
    commonTransfer: 'I have went to Colombo',
    naturalEnglish: 'I have gone to Colombo (or: I went to Colombo yesterday)',
    whySi: '"Have / has" යන උපකාරක ක්‍රියාපදයෙන් පසුව සෑමවිටම ක්‍රියාපදයේ තෙවන රූපය (V3 - gone, eaten, written) යෙදිය යුතුය. "Yesterday" ඇති විට Simple Past (went) පමණක් යොදන්න.',
    whyEn: 'Use V3 after "have/has", and use Simple Past (V2) alone whenever a finished time like "yesterday" is mentioned.',
    example: 'I have gone there before, and I went again last week.'
  },
  {
    id: 'si-having-doubt',
    titleEn: 'Asking Questions: "Question" vs. "Doubt"',
    titleSi: 'ප්‍රශ්නයක් ඇසීම: "Question" සහ "Doubt" අතර වෙනස',
    commonTransfer: 'I am having a doubt',
    naturalEnglish: 'I have a question',
    whySi: 'සිංහලෙන් "සැකයක් තියෙනවා" යන්නට අනුව "having a doubt" කිව්වත්, ජාත්‍යන්තර ඉංග්‍රීසියේ "doubt" යනු අවිශ්වාසයයි. පැහැදිලි කර ගැනීමට "I have a question" කියන්න.',
    whyEn: 'In international English, "doubt" signals distrust or uncertainty, whereas "I have a question" naturally asks for clarification.',
    example: 'Excuse me, I have a quick question about this grammar rule.'
  },
  {
    id: 'si-uncountables',
    titleEn: 'Uncountable Nouns (No Plural -s)',
    titleSi: 'ගිණිය නොහැකි නාම පද (බහුවචන -s නොයෙදේ)',
    commonTransfer: 'lots of works / many informations / good advices',
    naturalEnglish: 'a lot of work / a lot of information / useful advice',
    whySi: 'සිංහලෙන් "වැඩ ගොඩක් / උපදෙස් ගොඩක්" ලෙස බහුවචනයෙන් කිව්වත්, ඉංග්‍රීසියේ work, advice, information, homework යනු uncountable නිසා "-s" එකතු නොකරන්න.',
    whyEn: 'Nouns like work, advice, information, and furniture never take "-s" — use "a lot of" or "some" instead.',
    example: 'I had a lot of work today, and my mentor gave me great advice.'
  },
  {
    id: 'si-go-ing',
    titleEn: 'Leisure Activities: Go + Verb-ing (No "to")',
    titleSi: 'විනෝදාංශ සඳහා "Go + -ing" ("to" අවශ්‍ය නැත)',
    commonTransfer: 'I went to shopping / went to swimming',
    naturalEnglish: 'I went shopping / went swimming',
    whySi: 'ස්ථානයකට යන විට පමණක් "go to" (go to the mall) යොදන්න. Shopping, swimming, hiking වැනි -ing ක්‍රියාකාරකම් සමඟ "to" නොයොදන්න.',
    whyEn: 'Use "go to + place" (go to the mall), but "go + -ing" directly for activities (go shopping, go hiking).',
    example: 'We went shopping at the mall and went swimming afterwards.'
  }
];
