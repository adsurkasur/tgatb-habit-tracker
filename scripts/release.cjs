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

  // Create and publish a GitHub Release using GitHub CLI
  const releaseTitle = `tgatb-${tagName}`;
  const releaseNotes = `Automated release for ${releaseTitle}`;
  console.log(`Creating GitHub Release: ${releaseTitle}`);
  execSync(`gh release create ${tagName} --title "${releaseTitle}" --notes "${releaseNotes}" --latest`, { stdio: 'inherit' });
  console.log(`Successfully created GitHub Release: ${releaseTitle}`);
} catch (error) {
  console.error(`Error tagging, pushing, or creating release: ${error.message}`);
  process.exit(1);
}
