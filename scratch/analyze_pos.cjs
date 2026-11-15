const fs = require('fs');

const dictContent = fs.readFileSync('src/data/academicVocabularyDictionary.ts', 'utf8');
const match = dictContent.match(/export const ACADEMIC_VOCAB_DICTIONARY:\s*Record<[^>]+>\s*=\s*(\{[\s\S]*\});\s*$/);
const dict = JSON.parse(match[1]);

const posCounts = {};
for (const [k, v] of Object.entries(dict)) {
  posCounts[v.pos] = (posCounts[v.pos] || 0) + 1;
}

console.log('Parts of speech distribution:');
console.log(posCounts);

// Look at 15 random entries
const keys = Object.keys(dict);
const samples = [0, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 950, 990];
for (const idx of samples) {
  const k = keys[idx];
  const e = dict[k];
  console.log(`\nKey: "${k}" (POS: ${e.pos})`);
  console.log(`Def: ${e.def.slice(0, 60)}...`);
  console.log(`SiDef: ${e.siDef}`);
  console.log(`Collocs:`, e.collocations.map(c => `${c[0]} -> ${c[1]}`));
  console.log(`First existing example:`, e.examples[0] ? e.examples[0][0] : 'None');
}

