const fs = require('fs');
const path = require('path');

const rawVocabulary = fs.readFileSync('src/data/academic-vocabulary.txt', 'utf8');

const CORRECTIONS = {
  'Ignore': 'ignore',
  'rang form to': 'range from ... to',
  'bay contrast': 'by contrast',
  'cop with': 'cope with',
  'un upheaval': 'an upheaval',
  'fore-see': 'foresee',
  'straight forward': 'straightforward',
  'succeed  in/at': 'succeed in/at',
  'succeed in/at': 'succeed in/at',
  'legally  construct': 'legally / construct',
  'legally construct': 'legally / construct',
  'an option  fail to': 'an option / fail to',
  'an option fail to': 'an option / fail to',
  'unrealistic  merely': 'unrealistic / merely',
  'unrealistic merely': 'unrealistic / merely',
  'irrevocable  on the point of': 'irrevocable / on the point of',
  'irrevocable on the point of': 'irrevocable / on the point of',
  'polaris': 'polarise',
  'unction': 'function',
  'disperse with': 'dispense with',
};

const splitCombinedEntry = (entry) =>
  entry.split(/\s+\/\s+(?=[a-z])/i).map(item => item.trim()).filter(Boolean);

const importedTerms = rawVocabulary
  .replace(/\r?\n/g, ' ')
  .split(',')
  .map(item => item.replace(/\s+/g, ' ').trim())
  .filter(Boolean)
  .flatMap(item => splitCombinedEntry(CORRECTIONS[item] ?? item));

const uniqueTerms = importedTerms.filter(
  (term, index, terms) =>
    terms.findIndex(candidate => candidate.toLocaleLowerCase() === term.toLocaleLowerCase()) === index,
);

console.log('Total unique terms in Lesson 9:', uniqueTerms.length);
console.log('First 20 terms:', uniqueTerms.slice(0, 20));
console.log('Last 20 terms:', uniqueTerms.slice(-20));

