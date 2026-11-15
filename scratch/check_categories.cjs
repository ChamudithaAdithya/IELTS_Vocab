const fs = require('fs');

const lessonsTs = fs.readFileSync('src/data/lessons.ts', 'utf8');
const catRegex = /category:\s*['"`]([^'"`]+)['"`]/g;
let m;
const cats = [];
while ((m = catRegex.exec(lessonsTs)) !== null) {
  cats.push(m[1]);
}
console.log('Categories in lessons.ts:', cats);

const l10 = fs.readFileSync('src/data/lesson10Mapungubwe.ts', 'utf8');
const m10 = l10.match(/category:\s*['"`]([^'"`]+)['"`]/);
if (m10) console.log('Category in lesson 10:', m10[1]);

const l9 = fs.readFileSync('src/data/importedVocabulary.ts', 'utf8');
const m9 = l9.match(/category:\s*['"`]([^'"`]+)['"`]/);
if (m9) console.log('Category in lesson 9:', m9[1]);

