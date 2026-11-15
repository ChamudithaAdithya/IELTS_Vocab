const fs = require('fs');
let content = fs.readFileSync('src/data/lessons.ts', 'utf8');

// Insert import if not present
if (!content.includes('LESSON_10_MAPUNGUBWE')) {
  content = content.replace(
    /import { IMPORTED_ACADEMIC_LESSON } from '\.\/importedVocabulary';/,
    "import { IMPORTED_ACADEMIC_LESSON } from './importedVocabulary';\nimport { LESSON_10_MAPUNGUBWE } from './lesson10Mapungubwe';"
  );
  
  content = content.replace(
    /IMPORTED_ACADEMIC_LESSON\s*\];/,
    "IMPORTED_ACADEMIC_LESSON,\n  LESSON_10_MAPUNGUBWE\n];"
  );

  fs.writeFileSync('src/data/lessons.ts', content, 'utf8');
  console.log('Successfully updated src/data/lessons.ts to include LESSON_10_MAPUNGUBWE!');
} else {
  console.log('Already includes LESSON_10_MAPUNGUBWE');
}

