const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;
const tagName = `v${version}`;

try {
  console.log(`Creating Git tag: ${tagName}`);
  execSync(`git tag ${tagName}`, { stdio: 'inherit' });
  console.log(`Pushing Git tag: ${tagName}`);
  execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
  console.log(`Successfully tagged and pushed ${tagName}`);
} catch (error) {
  console.error(`Error tagging or pushing: ${error.message}`);
  process.exit(1);
}
