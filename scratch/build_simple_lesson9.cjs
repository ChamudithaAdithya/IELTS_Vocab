const fs = require('fs');
const path = require('path');

const dictPath = path.resolve('D:/IELTS WEB/IELTS_Vocab/src/data/academicVocabularyDictionary.ts');
const dictContent = fs.readFileSync(dictPath, 'utf8');
const match = dictContent.match(/export const ACADEMIC_VOCAB_DICTIONARY:\s*Record<[^>]+>\s*=\s*(\{[\s\S]*\});\s*$/);

if (!match) {
  console.error("Could not parse ACADEMIC_VOCAB_DICTIONARY from file!");
  process.exit(1);
}

const dict = JSON.parse(match[1]);
const keys = Object.keys(dict);
console.log(`Loaded ${keys.length} dictionary entries.`);

// Helpers for string cleanup
function cleanPunct(str) {
  return (str || '').replace(/[.,;:]+$/, '').trim();
}

function lowerFirst(str) {
  if (!str) return '';
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function isTitle(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function cleanSinhalaVerb(si) {
  let s = (si || '').split('/')[0].trim();
  s = s.replace(/කිරීම$/, 'කරන්න').replace(/වීම$/, 'වෙන්න');
  return s;
}

function cleanSinhalaNoun(si) {
  return (si || '').split('/')[0].trim();
}

function cleanSinhalaAdj(si) {
  return (si || '').split('/')[0].trim();
}

function cleanSinhalaAdv(si) {
  return (si || '').split('/')[0].trim();
}

// Check if an entry already has simple sentences (e.g. explore has 10)
function alreadyHasSimple(key, entry) {
  if (key === 'explore') return true;
  // If first example is short and simple (< 50 chars)
  if (entry.examples && entry.examples.length > 3) {
    const firstEn = entry.examples[0][0];
    if (firstEn && firstEn.length < 50 && (firstEn.startsWith('I ') || firstEn.startsWith('We ') || firstEn.startsWith('She '))) {
      return true;
    }
  }
  return false;
}

// Generate 2 tailored simple sentences for any dictionary entry
function generateTwoSimpleSentences(term, entry) {
  const { pos, def, siDef, collocations } = entry;
  const primarySi = (siDef || '').split('/')[0].trim();
  const cleanTerm = term.replace(/^(the|a|an)\s+/i, '').trim();

  // Custom special handling for common words with unique natural usage
  const lowerTerm = term.toLowerCase();

  if (lowerTerm === 'the performance') {
    return [
      ["Her musical performance was very good.", "ඇගේ සංගීත ප්‍රසංගය ඉතා හොඳ විය."],
      ["The teacher praised his performance in the test.", "ගුරුවරයා විභාගයේ ඔහුගේ දක්ෂතාවය අගය කළේය."]
    ];
  }
  if (lowerTerm === 'meanwhile') {
    return [
      ["I cleaned my room; meanwhile, my brother washed the dishes.", "මම මගේ කාමරය පිරිසිදු කළා; මේ අතරතුර මගේ සහෝදරයා පිඟන් සේදුවා."],
      ["Mother cooked dinner; meanwhile, the children finished their homework.", "අම්මා රාත්‍රී ආහාරය පිසුවාය; මේ අතර ළමයි තම ගෙදර වැඩ අවසන් කළහ."]
    ];
  }
  if (lowerTerm === 'generally') {
    return [
      ["Generally, children sleep early on school nights.", "සාමාන්‍යයෙන්, පාසල් රාත්‍රීන්හිදී ළමයි වේලාසනින් නිදා ගනිති."],
      ["It is generally warm during the summer months.", "ගිම්හාන මාසවලදී සාමාන්‍යයෙන් උණුසුම් වේ."]
    ];
  }
  if (lowerTerm === 'influence') {
    return [
      ["Parents have a strong influence on their children.", "දෙමාපියන් තම දරුවන් කෙරෙහි ප්‍රබල බලපෑමක් ඇති කරයි."],
      ["Good friends can influence you in positive ways.", "හොඳ මිතුරන්ට ඔබට යහපත් ආකාරයෙන් බලපෑම් කළ හැකිය."]
    ];
  }
  if (lowerTerm === 'achieve') {
    return [
      ["She worked hard to achieve her dream.", "ඇය තම සිහිනය සැබෑ කර ගැනීමට මහන්සි වී වැඩ කළාය."],
      ["You can achieve good results with regular practice.", "දිනපතා පුහුණුවීමෙන් ඔබට හොඳ ප්‍රතිඵල අත්කර ගත හැක."]
    ];
  }
  if (lowerTerm === 'conclude') {
    return [
      ["The teacher concluded the lesson on time.", "ගුරුවරයා නියමිත වේලාවට පාඩම අවසන් කළේය."],
      ["We can conclude that practice makes reading easier.", "පුහුණුවීමෙන් කියවීම පහසු වන බව අපට නිගමනය කළ හැක."]
    ];
  }
  if (lowerTerm === 'vital') {
    return [
      ["Clean water is vital for our health.", "පිරිසිදු ජලය අපගේ සෞඛ්‍යයට අත්‍යවශ්‍යයි."],
      ["Sleep plays a vital role in daily energy.", "දෛනික ශක්තිය සඳහා නින්ද අත්‍යවශ්‍ය කාර්යභාරයක් ඉටු කරයි."]
    ];
  }
  if (lowerTerm === 'identical') {
    return [
      ["The two cars look identical.", "කාර් දෙක එක හා සමානව පෙනේ."],
      ["The twins wore identical blue dresses.", "නිවුන් දරුවන් එක සමාන නිල් ඇඳුම් ඇඳ සිටියහ."]
    ];
  }

  // Prepositional verbs like "concentrate on", "cope with", "succeed in"
  if (pos === 'verb') {
    if (term.includes(' on') || term.includes(' with') || term.includes(' in') || term.includes(' to') || term.includes(' from')) {
      const v = cleanTerm;
      const siV = cleanSinhalaVerb(primarySi);
      return [
        [`It is important to ${v} your studies every day.`, `සෑම දිනකම ඔබගේ අධ්‍යයන කටයුතු කෙරෙහි ${siV} වැදගත් වේ.`],
        [`She learned how to ${v} difficult situations calmly.`, `දුෂ්කර අවස්ථාවලදී සන්සුන්ව ${siV} ඇය ඉගෙන ගත්තාය.`]
      ];
    }

    // Regular transitive / intransitive verb
    const v = cleanTerm;
    const siV = cleanSinhalaVerb(primarySi);
    return [
      [`She worked hard to ${v} her goal.`, `ඇය තම ඉලක්කය ${siV} මහන්සි වී වැඩ කළාය.`],
      [`You can ${v} new skills with daily practice.`, `දිනපතා පුහුණුවීමෙන් ඔබට නව කුසලතා ${siV} හැකිය.`]
    ];
  }

  // Nouns
  if (pos === 'noun') {
    const n = cleanTerm;
    const siN = cleanSinhalaNoun(primarySi);
    return [
      [`The teacher explained the concept of ${n} clearly.`, `ගුරුවරයා ${siN} පිළිබඳ අදහස පැහැදිලිව විස්තර කළේය.`],
      [`Good habits have a positive effect on your ${n}.`, `හොඳ පුරුදු ඔබගේ ${siN} කෙරෙහි ධනාත්මක බලපෑමක් ඇති කරයි.`]
    ];
  }

  // Adjectives
  if (pos === 'adjective') {
    const a = cleanTerm;
    const siA = cleanSinhalaAdj(primarySi);
    return [
      [`Clean water and fresh food are ${a} for healthy living.`, `නිරෝගී ජීවිතයක් සඳහා පිරිසිදු ජලය සහ නැවුම් ආහාර ${siA} වේ.`],
      [`She gave a very ${a} answer to the difficult question.`, `ඇය එම අසීරු ප්‍රශ්නයට ඉතා ${siA} පිළිතුරක් ලබා දුන්නාය.`]
    ];
  }

  // Adverbs
  if (pos === 'adverb') {
    const adv = cleanTerm;
    const siAdv = cleanSinhalaAdv(primarySi);
    return [
      [`${isTitle(adv)}, students need enough sleep before an exam.`, `${siAdv}, විභාගයකට පෙර සිසුන්ට ප්‍රමාණවත් නින්දක් අවශ්‍ය වේ.`],
      [`With patient practice, you will ${adv} improve your English.`, `ඉවසීමෙන් පුහුණුවීම තුළින් ඔබ ${siAdv} ඔබේ ඉංග්‍රීසි දියුණු කරගනු ඇත.`]
    ];
  }

  // Phrases / Idioms
  const phr = cleanTerm;
  const siPhr = cleanPunct(primarySi);
  return [
    [`He read the book ${phr} learning new ideas.`, `ඔහු නව අදහස් ඉගෙන ගැනීමට ${siPhr} පොත කියෙව්වා.`],
    [`We must consider every option ${phr} this project.`, `අපි මෙම ව්‍යාපෘතියේදී ${siPhr} සෑම විකල්පයක් ගැනම සලකා බැලිය යුතුය.`]
  ];
}

// Generate for all entries
let updatedCount = 0;
for (const [k, v] of Object.entries(dict)) {
  if (alreadyHasSimple(k, v)) {
    continue;
  }
  const simplePairs = generateTwoSimpleSentences(k, v);
  // Prepend simple sentences to existing examples
  v.examples = [...simplePairs, ...v.examples];
  updatedCount++;
}

console.log(`Updated ${updatedCount} dictionary entries with simple sentences!`);

// Format and write back to file
const updatedContent = dictContent.replace(
  match[0],
  `export const ACADEMIC_VOCAB_DICTIONARY: Record<string, RichVocabEntry> = ${JSON.stringify(dict, null, 2)};`
);

fs.writeFileSync(dictPath, updatedContent, 'utf8');
console.log(`Successfully written enriched dictionary to ${dictPath}!`);
