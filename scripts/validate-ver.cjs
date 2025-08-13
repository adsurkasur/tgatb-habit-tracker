// scripts/validate-ver.cjs
// Checks if the current version in package.json already exists as a git tag.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;
const tagName = `v${version}`;

try {
	// Get list of tags
	const tags = execSync('git tag', { encoding: 'utf8' });
	const tagList = tags.split('\n').map(t => t.trim());

	if (tagList.includes(tagName)) {
		console.error(`❌ Tag ${tagName} already exists. Version has not changed.`);
		process.exit(1);
	} else {
		console.log(`✅ Version ${version} is new. Proceeding with release.`);
		process.exit(0);
	}
} catch (error) {
	console.error('❌ Error validating version:', error);
	process.exit(1);
}
