const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('D:/IELTS WEB/IELTS_Vocab/src/data/lessons.ts');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add import
if (!content.includes('LESSON_11_TENSES')) {
  content = content.replace(
    "import { LESSON_10_MAPUNGUBWE } from './lesson10Mapungubwe';",
    "import { LESSON_10_MAPUNGUBWE } from './lesson10Mapungubwe';\nimport { LESSON_11_TENSES } from './lesson11TensesIrregularVerbs';"
  );

  // 2. Add to LESSONS array
  content = content.replace(
    "  IMPORTED_ACADEMIC_LESSON,\n  LESSON_10_MAPUNGUBWE\n];",
    "  IMPORTED_ACADEMIC_LESSON,\n  LESSON_10_MAPUNGUBWE,\n  LESSON_11_TENSES\n];"
  );

  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('Successfully updated lessons.ts with LESSON_11_TENSES!');
} else {
  console.log('LESSON_11_TENSES already imported in lessons.ts');
}

