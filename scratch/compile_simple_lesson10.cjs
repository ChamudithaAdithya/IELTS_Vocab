const fs = require('fs');
const path = require('path');

const part1 = require('./lesson10_data_part1.cjs');
const part2 = require('./lesson10_data_part2.cjs');
const part3 = require('./lesson10_data_part3.cjs');

const allWords = [...part1, ...part2, ...part3];
console.log(`Total words compiled: ${allWords.length}`);

const targetPath = path.resolve('D:/IELTS WEB/IELTS_Vocab/src/data/lesson10Mapungubwe.ts');

const fileHeader = `import { Lesson, Word } from '../types';

export const MAPUNGUBWE_WORDS: Word[] = ${JSON.stringify(allWords, null, 2)};

export const LESSON_10_MAPUNGUBWE: Lesson = {
  id: 'lesson-10',
  number: 10,
  title: 'History, Archaeology & Ancient Kingdoms',
  subtitle: 'IELTS Academic Reading Vocabulary – Mapungubwe Passage',
  category: 'History & Archaeology',
  description: 'Master 107 vital academic vocabulary words and simple, natural example sentences extracted from the Mapungubwe historical passage. Perfect for IELTS Reading, Task 2 essays, and speaking.',
  sinhalaDescription: 'මපුංගුබ්වේ ඓතිහාසික කියවීම් පාඨයෙන් උපුටාගත් වචන 107ක් සහ සරල සිංහල තේරුම් සහිත ප්‍රායෝගික උදාහරණ වාක්‍ය අධ්‍යයනය කරන්න.',
  bannerImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
  words: MAPUNGUBWE_WORDS,
  speakingChallenge: {
    part: 'PART 3 PRACTICE: CULTURAL HERITAGE PRESERVATION',
    question: 'Some people argue that governments should spend public funds preserving ancient ruins and archaeological sites like Mapungubwe, while others believe that money is better spent on modern healthcare and infrastructure. What is your view?',
    minimumTargetWords: 5,
    sampleBand9Answer: 'In my view, while healthcare and infrastructure are pressing modern needs, preserving archaeological heritage holds immense cultural significance. Pre-colonial civilization centers such as Mapungubwe rewrite the historical record by demonstrating advanced indigenous craftsmanship and thriving trade networks. Safeguarding these archaeological sites as UNESCO World Heritage landmarks inspires future generations with an enduring legacy.',
    examinerTips: [
      'Contrast both perspectives clearly before concluding with your own personal stance.',
      'Incorporate academic phrases such as "cultural significance", "historical record", and "indigenous craftsmanship".',
      'Provide concrete examples of ancient civilisations or monuments to strengthen your arguments.'
    ]
  },
  writingChallenge: {
    task: 'IELTS Writing Task 2 (Discussion Essay)',
    prompt: 'Some people think that governments should spend significant financial resources on preserving cultural heritage and archaeological sites. Others, however, believe that this money should be spent on modern public services and infrastructure. Discuss both views and give your own opinion.',
    sampleBand8Paragraph: 'Proponents of cultural heritage conservation contend that archaeological sites offer irreplaceable historical evidence of human achievement. When nations preserve pre-colonial urban centers and ancestral burials, they honor their cultural legacy and protect invaluable treasures like ancient pottery and metal craftsmanship. Moreover, recognized UNESCO World Heritage sites stimulate tourism and generate economic surplus that can subsequently fund local public services.'
  }
};
`;

fs.writeFileSync(targetPath, fileHeader, 'utf8');
console.log('Successfully wrote simple, clear example sentences to lesson10Mapungubwe.ts!');

