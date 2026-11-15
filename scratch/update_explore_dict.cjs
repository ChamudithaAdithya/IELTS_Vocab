const fs = require('fs');
const path = require('path');

const dictPath = path.resolve('D:/IELTS WEB/IELTS_Vocab/src/data/academicVocabularyDictionary.ts');
let content = fs.readFileSync(dictPath, 'utf8');

const userExamplesFormatted = `    "examples": [
      [
        "I want to explore the world.",
        "මට ලෝකය ගවේෂණය කිරීමට අවශ්‍යයි."
      ],
      [
        "We explored an ancient city.",
        "අපි පැරණි නගරයක් ගවේෂණය කළා."
      ],
      [
        "Children love to explore new things.",
        "ළමයි අලුත් දේවල් සොයා බලන්න කැමතියි."
      ],
      [
        "They explored the forest.",
        "ඔවුන් වනාන්තරය ගවේෂණය කළා."
      ],
      [
        "Scientists explore the mysteries of nature.",
        "විද්‍යාඥයන් සොබාදහමේ අභිරහස් ගවේෂණය කරනවා."
      ],
      [
        "I like to explore new places.",
        "මම අලුත් ස්ථාන ගවේෂණය කිරීමට කැමතියි."
      ],
      [
        "Archaeologists explore ancient ruins.",
        "පුරාවිද්‍යාඥයන් පැරණි නටබුන් ගවේෂණය කරනවා."
      ],
      [
        "Let's explore this topic.",
        "අපි මේ මාතෘකාව ගැන සොයා බලමු."
      ],
      [
        "She explored different career opportunities.",
        "ඇය විවිධ රැකියා අවස්ථා පිළිබඳව සොයා බැලුවා."
      ],
      [
        "We need to explore the reasons behind this problem.",
        "මෙම ගැටලුවට හේතු සොයා බැලීමට අපට අවශ්‍යයි."
      ]
    ]`;

const exploreRegex = /"explore":\s*\{[\s\S]*?"examples":\s*\[[\s\S]*?\]\s*\}/;

const match = content.match(exploreRegex);
if (!match) {
  console.error("Could not find explore in academicVocabularyDictionary.ts");
  process.exit(1);
}

const updatedExploreBlock = match[0].replace(/"examples":\s*\[[\s\S]*?\]/, userExamplesFormatted.trim());
content = content.replace(match[0], updatedExploreBlock);

fs.writeFileSync(dictPath, content, 'utf8');
console.log("Successfully updated explore in academicVocabularyDictionary.ts!");

