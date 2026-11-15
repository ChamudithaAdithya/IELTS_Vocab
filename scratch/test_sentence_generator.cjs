const fs = require('fs');

const dictContent = fs.readFileSync('src/data/academicVocabularyDictionary.ts', 'utf8');
const match = dictContent.match(/export const ACADEMIC_VOCAB_DICTIONARY:\s*Record<[^>]+>\s*=\s*(\{[\s\S]*\});\s*$/);
const dict = JSON.parse(match[1]);

// Helper to clean punctuation and lowercase first char for embedding
function cleanText(t) {
  return t.replace(/[.,;:]+$/, '').trim();
}

function lowerFirst(str) {
  if (!str) return '';
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function makeSimpleSentences(key, entry) {
  const { pos, def, siDef, collocations } = entry;
  const c1 = collocations[0] || [key, siDef.split('/')[0].trim()];
  const c2 = collocations[1] || collocations[0] || [key, siDef.split('/')[0].trim()];

  const enC1 = cleanText(c1[0]);
  const siC1 = cleanText(c1[1]);
  const enC2 = cleanText(c2[0]);
  const siC2 = cleanText(c2[1]);

  const cleanKey = key.replace(/^(the|a|an)\s+/i, '');
  const primarySi = siDef.split('/')[0].trim();

  const results = [];

  // Generate sentence 1 based on POS
  if (pos === 'verb') {
    // If collocation starts with verb, e.g. "Achieve goals"
    results.push([
      `You can ${lowerFirst(enC1)} with regular practice.`,
      `ක්‍රමවත් පුහුණුවීමෙන් ඔබට ${siC1} හැක.`
    ]);
    results.push([
      `We want to ${lowerFirst(enC2)} this year.`,
      `අපට මෙම වසරේදී ${siC2} අවශ්‍යයි.`
    ]);
  } else if (pos === 'noun') {
    results.push([
      `Good education leads to ${lowerFirst(enC1)}.`,
      `හොඳ අධ්‍යාපනයක් ${siC1} සඳහා මඟ පාදයි.`
    ]);
    results.push([
      `We need to focus on ${lowerFirst(enC2)}.`,
      `අප ${siC2} කෙරෙහි අවධානය යොමු කළ යුතුය.`
    ]);
  } else if (pos === 'adjective') {
    results.push([
      `It is important to stay ${lowerFirst(enC1)}.`,
      `${siC1} ලෙස සිටීම වැදගත් වේ.`
    ]);
    results.push([
      `She is very ${lowerFirst(enC2)}.`,
      `ඇය ඉතා ${siC2}.`
    ]);
  } else if (pos === 'adverb') {
    results.push([
      `With patience, you will ${lowerFirst(enC1)}.`,
      `ඉවසීමෙන් යුතුව, ඔබ ${siC1}.`
    ]);
    results.push([
      `The team will ${lowerFirst(enC2)} soon.`,
      `කණ්ඩායම ඉක්මනින්ම ${siC2}.`
    ]);
  } else {
    // phrase or idiom
    results.push([
      `He acted ${lowerFirst(enC1)}.`,
      `ඔහු ${siC1} කටයුතු කළේය.`
    ]);
    results.push([
      `We made a plan ${lowerFirst(enC2)}.`,
      `අපි ${siC2} සැලැස්මක් සකස් කළෙමු.`
    ]);
  }

  return results;
}

// Test on 10 entries
const testKeys = ['the performance', 'meanwhile', 'influence', 'achieve', 'conclude', 'vital', 'identical', 'eventually', 'confident', 'inform'];
for (const k of testKeys) {
  const sents = makeSimpleSentences(k, dict[k]);
  console.log(`\nWord: "${k}"`);
  sents.forEach(([en, si], i) => {
    console.log(`  ${i + 1}. ${en}`);
    console.log(`     ${si}`);
  });
}

