const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;
const commitMessage = `Re-release: v${version}`;

try {
  console.log('Staging all changes...');
  execSync('git add .', { stdio: 'inherit' });

  console.log(`Committing changes with message: "${commitMessage}"`);
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  console.log('Successfully committed changes.');
} catch (error) {
  console.error(`Error committing changes: ${error.message}`);
  process.exit(1);
}
