const fs = require('fs');

const raw = fs.readFileSync('src/data/academic-vocabulary.txt', 'utf8');
const terms = raw
  .replace(/\r?\n/g, ' ')
  .split(',')
  .map(item => item.replace(/\s+/g, ' ').trim())
  .filter(Boolean);

console.log('Total raw terms in academic-vocabulary.txt:', terms.length);

const { LESSONS } = require('../dist/assets/index-9Ia3_IGZ.js'); // or load from lessons

