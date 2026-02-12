const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const tagName = `v${pkg.version}`;

try {
  // Step 1: Delete remote tag
  console.log(`Deleting remote tag: ${tagName}`);
  try {
    execSync(`git push origin :refs/tags/${tagName}`, { stdio: 'inherit' });
  } catch {
    console.log(`Remote tag ${tagName} not found, skipping.`);
  }

  // Step 2: Delete local tag
  console.log(`Deleting local tag: ${tagName}`);
  try {
    execSync(`git tag -d ${tagName}`, { stdio: 'inherit' });
  } catch {
    console.log(`Local tag ${tagName} not found, skipping.`);
  }

  // Step 3: Recreate and push tag
  console.log(`Creating Git tag: ${tagName}`);
  execSync(`git tag ${tagName}`, { stdio: 'inherit' });

  console.log(`Pushing Git tag: ${tagName}`);
  execSync(`git push origin ${tagName}`, { stdio: 'inherit' });

  console.log(`\u2705 Re-released tag ${tagName}. The release workflow has been triggered on GitHub.`);
} catch (error) {
  console.error(`Error during re-release: ${error.message}`);
  process.exit(1);
}