const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// This part reads the version from package.json
const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// This creates the correct, simple tag name (e.g., "v0.3.2")
const tagName = `v${pkg.version}`;

try {
  // Step 1: Create the Git tag
  console.log(`Creating Git tag: ${tagName}`);
  execSync(`git tag ${tagName}`, { stdio: 'inherit' });

  // Step 2: Push the Git tag to trigger the GitHub Action
  console.log(`Pushing Git tag: ${tagName}`);
  execSync(`git push origin ${tagName}`, { stdio: 'inherit' });

  console.log(`✅ Successfully pushed tag ${tagName}. The release workflow has been triggered on GitHub.`);

} catch (error) {
  console.error(`Error tagging or pushing: ${error.message}`);
  process.exit(1);
}