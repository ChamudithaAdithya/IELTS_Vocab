const fs = require('fs');

// We can check dictionary keys
const dictContent = fs.readFileSync('src/data/academicVocabularyDictionary.ts', 'utf8');
const match = dictContent.match(/export const ACADEMIC_VOCAB_DICTIONARY[^=]*=\s*(\{[\s\S]*\});\s*$/);
if (!match) {
  console.log('Regex did not match dictionary export');
} else {
  console.log('Dictionary export found');
}

