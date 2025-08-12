const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get version from package.json to use in the commit message
const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;
const commitMessage = `Release: v${version}`;

try {
  // Check if there are any changes to be staged
  const status = execSync('git status --porcelain').toString().trim();

  // If the status is empty, there are no changes.
  if (!status) {
    console.log('No changes to commit. Skipping commit step.');
    // Exit successfully without doing anything else
    process.exit(0);
  }

  console.log('Staging all changes...');
  execSync('git add .', { stdio: 'inherit' });

  console.log(`Committing changes with message: "${commitMessage}"`);
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  console.log('✅ Successfully committed changes.');

} catch (error) {
  console.error(`Error committing changes: ${error.message}`);
  process.exit(1);
}