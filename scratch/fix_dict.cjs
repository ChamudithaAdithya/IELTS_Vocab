const fs = require('fs');
const path = require('path');

const dictPath = path.resolve('D:/IELTS WEB/IELTS_Vocab/src/data/academicVocabularyDictionary.ts');
let content = fs.readFileSync(dictPath, 'utf8');

const faultyTarget = `      [
        "We need to explore the reasons behind this problem.",
        "මෙම ගැටලුවට හේතු සොයා බැලීමට අපට අවශ්‍යයි."
      ]
    ],
      [
        "Energy-importing nations must explore alternative sources of power to ensure national security.",
        "බලශක්තිය ආනයනය කරන රටවල් ජාතික ආරක්ෂාව තහවුරු කිරීම සඳහා විකල්ප බලශක්ති ප්‍රභවයන් ගවේෂණය කළ යුතුය."
      ],
      [
        "Gap-year travel allows young people to explore unfamiliar cultures before entering university.",
        "විශ්වවිද්‍යාලයට ඇතුළත් වීමට පෙර ගන්නා විවේක වසර තුළ සංචාරය කිරීමෙන් තරුණ පිරිසට නුහුරු සංස්කෘතීන් ගවේෂණය කිරීමට අවස්ථාව ලැබේ."
      ]
    ]
  },
  "such": {`;

const fixedReplacement = `      [
        "We need to explore the reasons behind this problem.",
        "මෙම ගැටලුවට හේතු සොයා බැලීමට අපට අවශ්‍යයි."
      ]
    ]
  },
  "such": {`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = faultyTarget.replace(/\r\n/g, '\n');
const normFix = fixedReplacement.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const updated = normContent.replace(normTarget, normFix);
  fs.writeFileSync(dictPath, updated, 'utf8');
  console.log("Successfully cleaned up academicVocabularyDictionary.ts!");
} else {
  console.error("Target pattern not found!");
}

