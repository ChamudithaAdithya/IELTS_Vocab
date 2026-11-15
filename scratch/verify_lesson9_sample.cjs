const fs = require('fs');

const dictPath = 'src/data/academicVocabularyDictionary.ts';
const dictContent = fs.readFileSync(dictPath, 'utf8');
const match = dictContent.match(/export const ACADEMIC_VOCAB_DICTIONARY:\s*Record<[^>]+>\s*=\s*(\{[\s\S]*\});\s*$/);
const dict = JSON.parse(match[1]);

const sampleKeys = ['the performance', 'meanwhile', 'achieve', 'vital', 'modify'];

for (const k of sampleKeys) {
  const e = dict[k];
  console.log(`\n============================`);
  console.log(`Term: "${k}" [POS: ${e.pos}]`);
  console.log(`Definition: ${e.def}`);
  console.log(`Sinhala: ${e.siDef}`);
  console.log(`Examples count: ${e.examples.length}`);
  e.examples.forEach(([en, si], i) => {
    const tag = i < 2 ? '[SIMPLE]' : '[ACADEMIC]';
    console.log(`  ${i + 1}. ${tag} ${en}`);
    console.log(`     -> ${si}`);
  });
}

