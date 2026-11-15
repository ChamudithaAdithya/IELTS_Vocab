const fs = require('fs');

const dictContent = fs.readFileSync('src/data/academicVocabularyDictionary.ts', 'utf8');

// Quick test of loading ACADEMIC_VOCAB_DICTIONARY
// We can extract just the object as JSON or evaluate in node
const match = dictContent.match(/export const ACADEMIC_VOCAB_DICTIONARY:\s*Record<[^>]+>\s*=\s*(\{[\s\S]*\});\s*$/);
if (match) {
  try {
    const dict = JSON.parse(match[1]);
    console.log('Successfully JSON parsed dictionary!');
    const keys = Object.keys(dict);
    console.log('Total entries:', keys.length);
    const exampleCounts = keys.map(k => dict[k].examples ? dict[k].examples.length : 0);
    console.log('Min examples:', Math.min(...exampleCounts), 'Max examples:', Math.max(...exampleCounts));
  } catch (err) {
    console.log('JSON parse error, likely due to trailing commas or comments:', err.message);
  }
}

