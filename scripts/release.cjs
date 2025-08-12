const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// This part stays the same
const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const tagName = `v${pkg.version}`;

// The prefix for your project tag
const finalTagName = `tgatb-${tagName}`;

try {
  // Step 1: Create the Git tag
  console.log(`Creating Git tag: ${finalTagName}`);
  execSync(`git tag ${finalTagName}`, { stdio: 'inherit' });

  // Step 2: Push the Git tag to trigger the GitHub Action
  console.log(`Pushing Git tag: ${finalTagName}`);
  execSync(`git push origin ${finalTagName}`, { stdio: 'inherit' });

  console.log(`✅ Successfully pushed tag ${finalTagName}. The release workflow has been triggered on GitHub.`);

} catch (error) {
  console.error(`Error tagging or pushing: ${error.message}`);
  process.exit(1);
}