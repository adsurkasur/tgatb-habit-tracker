// scripts/bump-ver.cjs
// Bumps the version in package.json based on the provided argument.
// Usage: node scripts/bump-ver.cjs <major|minor|patch|revision>
//
// Version format: major.minor.patch.revision (e.g., 0.4.0.1)
//
// Examples:
//   node scripts/bump-ver.cjs revision  =>  0.4.0.1 -> 0.4.0.2
//   node scripts/bump-ver.cjs patch     =>  0.4.0.2 -> 0.4.1.0
//   node scripts/bump-ver.cjs minor     =>  0.4.1.0 -> 0.5.0.0
//   node scripts/bump-ver.cjs major     =>  0.5.0.0 -> 1.0.0.0

const fs = require('fs');
const path = require('path');

const BUMP_TYPES = ['major', 'minor', 'patch', 'revision'];
const ALIASES = { rev: 'revision', r: 'revision', p: 'patch', m: 'minor', M: 'major' };

const pkgPath = path.resolve(__dirname, '../package.json');

// Parse argument
let bumpType = process.argv[2];

if (!bumpType) {
  console.error('Usage: node scripts/bump-ver.cjs <major|minor|patch|revision>');
  console.error('  Aliases: M=major, m=minor, p=patch, r/rev=revision');
  process.exit(1);
}

// Resolve aliases
bumpType = ALIASES[bumpType] || bumpType;

if (!BUMP_TYPES.includes(bumpType)) {
  console.error('Invalid bump type: "' + bumpType + '"');
  console.error('Valid types: ' + BUMP_TYPES.join(', '));
  process.exit(1);
}

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const oldVersion = pkg.version;

  // Parse current version (supports 3-part and 4-part)
  const parts = oldVersion.split('-')[0].split('.').map(p => parseInt(p, 10));
  let major = parts[0] || 0;
  let minor = parts[1] || 0;
  let patch = parts[2] || 0;
  let revision = parts[3] || 0;

  // Bump the requested segment and reset everything below it
  switch (bumpType) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      revision = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      revision = 0;
      break;
    case 'patch':
      patch++;
      revision = 0;
      break;
    case 'revision':
      revision++;
      break;
  }

  const newVersion = major + '.' + minor + '.' + patch + '.' + revision;
  pkg.version = newVersion;

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

  console.log('Version bumped: ' + oldVersion + ' -> ' + newVersion);
  console.log('Run "npm run sync-ver" to propagate to build.gradle.');

} catch (error) {
  console.error('Error bumping version:', error.message);
  process.exit(1);
}
