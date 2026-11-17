const fs = require('fs');
const path = require('path');

const dictPath = path.resolve(__dirname, '..', 'src', 'data', 'academicVocabularyDictionary.ts');
let dictContent = fs.readFileSync(dictPath, 'utf8');

const match = dictContent.match(/export const ACADEMIC_VOCAB_DICTIONARY:\s*Record<[^>]+>\s*=\s*(\{[\s\S]*\});\s*$/);
if (!match) {
  console.error("Could not find ACADEMIC_VOCAB_DICTIONARY declaration!");
  process.exit(1);
}

const dict = JSON.parse(match[1]);
const dictKeys = Object.keys(dict);

// Load all 10 batches
const combined = {};
for (let i = 0; i < 10; i++) {
  const batchFile = path.resolve(__dirname, 'l9_batches', `output_${i}.cjs`);
  const batch = require(batchFile);
  Object.assign(combined, batch);
}

console.log(`Loaded ${dictKeys.length} dictionary keys and ${Object.keys(combined).length} generated batches.`);

let updatedCount = 0;
for (const key of dictKeys) {
  if (!combined[key]) {
    console.error(`Missing key in combined batches: "${key}"`);
    process.exit(1);
  }
  // Replace examples with the 5 short, natural sentences
  dict[key].examples = combined[key];
  updatedCount++;
}

console.log(`Updated all ${updatedCount} entries with 5 short, natural example sentences!`);

const newDeclaration = `export const ACADEMIC_VOCAB_DICTIONARY: Record<string, RichVocabEntry> = ${JSON.stringify(dict, null, 2)};`;

const updatedContent = dictContent.slice(0, match.index) + newDeclaration + '\n';
fs.writeFileSync(dictPath, updatedContent, 'utf8');

console.log(`Successfully updated ${dictPath}!`);
