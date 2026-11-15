const fs = require('fs');
const path = require('path');

function searchFiles(dir, pattern) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== '.git' && f.name !== 'dist') {
      searchFiles(full, pattern);
    } else if (f.isFile() && (f.name.endsWith('.tsx') || f.name.endsWith('.ts'))) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('.category') || content.includes('category ===') || content.includes('categories')) {
        console.log('Match in:', full);
      }
    }
  }
}

searchFiles('src', '.category');

