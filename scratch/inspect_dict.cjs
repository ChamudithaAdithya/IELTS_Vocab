const fs = require('fs');

const dictContent = fs.readFileSync('src/data/academicVocabularyDictionary.ts', 'utf8');

// Match all keys in ACADEMIC_VOCAB_DICTIONARY
const keys = [];
const keyRegex = /^\s*"([^"]+)":\s*\{/gm;
let m;
while ((m = keyRegex.exec(dictContent)) !== null) {
  keys.push(m[1]);
}

console.log('Total keys matched in dictionary:', keys.length);
console.log('First 10 keys:', keys.slice(0, 10));
console.log('Sample keys with parts of speech:');

const entries = [];
for (let i = 0; i < Math.min(10, keys.length); i++) {
  const k = keys[i];
  const reg = new RegExp(`"${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}":\\s*\\{([\\s\\S]*?)\\n  \\}`, 'm');
  const match = dictContent.match(reg);
  if (match) {
    entries.push({ key: k, block: match[1].slice(0, 200) });
  }
}
console.log(entries.map(e => e.key));

