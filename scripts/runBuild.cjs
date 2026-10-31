const { execSync } = require('child_process');

try {
  const out = execSync('npm run build', {
    cwd: 'd:/IELTS WEB/IELTS_Vocab',
    encoding: 'utf8'
  });
  console.log(out);
} catch (err) {
  console.error('Build Error:');
  console.error(err.stdout || err.message);
  process.exit(1);
}

