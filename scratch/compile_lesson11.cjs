const fs = require('fs');
const path = require('path');

const part1 = require('./lesson11_verbs_part1.cjs');
const part2 = require('./lesson11_verbs_part2.cjs');
const part3 = require('./lesson11_verbs_part3.cjs');

const allVerbs = [...part1, ...part2, ...part3];
console.log(`Total irregular verbs loaded: ${allVerbs.length}`);

const words = allVerbs.map((v, i) => ({
  id: `l11-w${i + 1}`,
  term: v.v1,
  partOfSpeech: 'verb',
  ipa: v.ipa,
  definition: `V1: ${v.v1} | V2: ${v.v2} | V3: ${v.v3} — ${v.si}. (${v.pattern})`,
  sinhalaDefinition: v.si,
  notes: `${v.pattern}. Essential irregular verb for forming past simple (V2) and present/past perfect (V3) tenses in IELTS Speaking and Writing.`,
  sinhalaNotes: `${v.pattern}. අතීත කාල (V2) සහ පූර්ණ කාල (V3) නිවැරදිව භාවිත කිරීමට අත්‍යවශ්‍ය අක්‍රමවත් ක්‍රියාපදයකි.`,
  collocations: v.colloc.map(([text, sinhala]) => ({ text, sinhala })),
  exampleSentences: v.examples,
  practicePrompt: `Write three clear sentences using V1 (${v.v1}), V2 (${v.v2}), and V3 (${v.v3}).`,
  bandLevel: 'Band 7.0+',
  commonMistake: v.mistake,
  v1: v.v1,
  v2: v.v2,
  v3: v.v3,
  verbPattern: v.pattern
}));

const targetPath = path.resolve('D:/IELTS WEB/IELTS_Vocab/src/data/lesson11TensesIrregularVerbs.ts');

const fileContent = `import { Lesson, Word } from '../types';

export const IRREGULAR_VERBS_WORDS: Word[] = ${JSON.stringify(words, null, 2)};

export const LESSON_11_TENSES: Lesson = {
  id: 'lesson-11',
  number: 11,
  title: 'Essential Irregular Verbs (V1, V2, V3)',
  subtitle: 'Mastering Irregular Verb Forms for All 9 Tenses & IELTS',
  category: 'Tenses',
  description: 'Irregular verbs do not form their past tense (V2) and past participle (V3) by adding -ed. Master all 63 common irregular verbs and their 3 key patterns (All Same, V2=V3, All Different) with simple example sentences and Sinhala meanings for all 9 tenses.',
  sinhalaDescription: 'අගට -ed එකතු නොවන අක්‍රමවත් ක්‍රියාපද (Irregular Verbs) 63ක් සහ ඒවායේ ප්‍රධාන රටා 3 (V1=V2=V3, V2=V3, V1≠V2≠V3) කාල 9කට අදාළ සරල සිංහල තේරුම් සහිත උදාහරණ වාක්‍ය සමඟ එකට ඉගෙන ගන්න.',
  bannerImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  words: IRREGULAR_VERBS_WORDS,
  speakingChallenge: {
    part: 'PART 3 PRACTICE: TALKING ABOUT PAST EXPERIENCES & HABITS',
    question: 'How do historical traditions and past events shape modern societal values?',
    minimumTargetWords: 4,
    sampleBand9Answer: 'Throughout history, communities have built their societal structures on core traditions passed down by ancestors. When challenges arose, past generations overcame hardships and taught enduring values of resilience. Having grown in diverse cultural landscapes, our contemporary laws have adopted these principles, showing that what occurred in the past directly influences our modern collective mindset.',
    examinerTips: [
      'Maintain strict accuracy when shifting between past simple (V2: built, arose, taught) and present perfect (V3: have built, have adopted).',
      'Do not regularize irregular verbs (never say "builded" or "teached").',
      'Use cohesive transition phrases such as "throughout history", "when challenges arose", and "in contemporary society".'
    ]
  },
  writingChallenge: {
    task: 'IELTS Writing Task 2 (Opinion / Trend Analysis)',
    prompt: 'In recent decades, digital technology has fundamentally transformed how people communicate and work. To what extent has this change brought more benefits than drawbacks?',
    sampleBand8Paragraph: 'Over the past fifty years, technological innovations have driven remarkable progress across global industries. Digital platforms have broken down geographical barriers and made international collaboration accessible to millions. Although sedentary habits have grown and some traditional manual skills were lost, society has gained unprecedented convenience, demonstrating that technological advancement has brought overwhelmingly positive outcomes.'
  }
};
`;

fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log('Successfully written lesson11TensesIrregularVerbs.ts!');

