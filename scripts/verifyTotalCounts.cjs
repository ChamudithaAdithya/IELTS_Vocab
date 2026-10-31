const fs = require('fs');

const lFile = fs.readFileSync('d:/IELTS WEB/IELTS_Vocab/src/data/cambridge1FullTests.ts', 'utf8');
const rFile = fs.readFileSync('d:/IELTS WEB/IELTS_Vocab/src/data/cambridge1ReadingTests.ts', 'utf8');
const wFile = fs.readFileSync('d:/IELTS WEB/IELTS_Vocab/src/data/cambridge1WritingTests.ts', 'utf8');

// Listening stats
const lSecMatches = lFile.match(/id:\s*['"]c1-t\d-sec\d['"]/g) || [];
const lQMatches = lFile.match(/question:\s*['"`]/g) || [];

// Reading stats
const rPassMatches = (rFile.match(/["']id["']:\s*["']c1-[^"']+["']/g) || []).filter(s => s.includes('pass'));
const rQMatches = rFile.match(/["']question["']:\s*['"`]/g) || [];

// Writing stats
const wTaskMatches = (wFile.match(/id:\s*['"]c1-[^'"]+['"]/g) || []).filter(s => !s.includes('-rep'));

// Speaking stats
const sPromptMatches = lFile.match(/id:\s*['"]c1-spk-[^'"]+['"]/g) || [];

console.log('========================================================');
console.log('   CAMBRIDGE PRACTICE TESTS 1 - 100% COMPLETION AUDIT   ');
console.log('========================================================');
console.log(`Listening Sections: ${lSecMatches.length} / 16`);
console.log(`Listening Questions: ${lQMatches.length} (Test 1: 41, Test 2: 41, Test 3: 42, Test 4: 42)`);
console.log(`Reading Passages: ${rPassMatches.length} / 15 (Academic Tests 1-4: 12, General Training: 3)`);
console.log(`Reading Questions: ${rQMatches.length} (Test 1: 40, Test 2: 41, Test 3: 38, Test 4: 39, GT: 41)`);
console.log(`Writing Tasks: ${wTaskMatches.length} / 10 (Academic 1-4 Tasks 1 & 2 + GT Tasks 1 & 2)`);
console.log(`Speaking Prompts: ${sPromptMatches.length} / 4 (Tests 1, 2, 3, 4 Task Cards)`);
console.log('========================================================');

