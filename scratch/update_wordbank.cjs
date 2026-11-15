const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('D:/IELTS WEB/IELTS_Vocab/src/components/WordBankView.tsx');
let fileContent = fs.readFileSync(targetPath, 'utf8');

fileContent = fileContent.replace(
  /All 80 target vocabulary words across 8 lessons\./,
  'All {ALL_WORDS.length} target vocabulary words across {LESSONS.length} comprehensive lessons.'
);

fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log('Successfully updated WordBankView.tsx');

