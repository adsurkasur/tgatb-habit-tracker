// scripts/bump-ver.cjs
// Responsible for incrementing version values in package.json.
// Supports stable semantic versioning with a 4-field revision component.
//
// Version format supported:
//   - stable: major.minor.patch.revision (1.2.3.4)
//
// Usage:
//   node scripts/bump-ver.cjs <major|minor|patch|revision|help> [number]
//
// Behavior examples:
//   node scripts/bump-ver.cjs revision      => 1.0.0.4 -> 1.0.0.5
//   node scripts/bump-ver.cjs patch         => 1.0.0.5 -> 1.0.1.0
//   node scripts/bump-ver.cjs minor         => 1.0.1.0 -> 1.1.0.0
//   node scripts/bump-ver.cjs major         => 1.1.0.0 -> 2.0.0.0

const fs = require('fs');
const path = require('path');

const BUMP_TYPES = ['major', 'minor', 'patch', 'revision'];
const ALIASES = { rev: 'revision', r: 'revision', p: 'patch', m: 'minor', M: 'major' };

const pkgPath = path.resolve(__dirname, '../package.json');

const HELP_TEXT = `
bump-ver.cjs — Bumps the version in package.json.

Usage: node scripts/bump-ver.cjs <major|minor|patch|revision|help> [number]

Version format: major.minor.patch.revision (e.g., 0.4.0.1)

Aliases: M=major, m=minor, p=patch, r/rev=revision

Examples:
  node scripts/bump-ver.cjs revision         => 0.4.0.1 -> 0.4.0.2
  node scripts/bump-ver.cjs patch            => 0.4.0.2 -> 0.4.1.0
  node scripts/bump-ver.cjs minor            => 0.4.1.0 -> 0.5.0.0
  node scripts/bump-ver.cjs major            => 0.5.0.0 -> 1.0.0.0
`.trim();

// Parse command-line arguments
// Format: node scripts/bump-ver.cjs <type> [number]
// 'type' is required and can be major/minor/patch/revision/beta/alpha.
// 'number' is optional, and when supplied it sets the prerelease/revision explicitly.
let bumpType = process.argv[2];
let requestedNumber = process.argv[3] ? parseInt(process.argv[3], 10) : undefined;

// No arg => show help and exit with failure code.
if (!bumpType) {
  console.error(HELP_TEXT);
  process.exit(1);
}

// Standard help flags for convenience.
if (bumpType === '--help' || bumpType === '-h' || bumpType === 'help') {
  console.log(HELP_TEXT);
  process.exit(0);
}

// Support short aliases, e.g. 'b' for beta, 'p' for patch.
bumpType = ALIASES[bumpType] || bumpType;

if (!BUMP_TYPES.includes(bumpType)) {
  console.error('Invalid bump type: "' + bumpType + '"');
  console.error('Valid types: ' + BUMP_TYPES.join(', '));
  process.exit(1);
}

if (requestedNumber !== undefined && Number.isNaN(requestedNumber)) {
  console.error('Invalid number argument: "' + process.argv[3] + '" must be an integer');
  process.exit(1);
}

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const oldVersion = pkg.version;

  // Parse current version to components:
  // - coreVersion: numeric parts (major.minor.patch[.revision])
  // Version value decomposition:
  // - major.minor.patch.revision
  // - revision is optional (defaults to 0 when absent).
  const parts = oldVersion.split('.').map(p => parseInt(p, 10));
  let major = parts[0] || 0;
  let minor = parts[1] || 0;
  let patch = parts[2] || 0;
  let revision = parts[3] || 0;

  // Bump behavior:
  // - major/minor/patch: increment selected segment, reset lower segments.
  // - revision: increment revision numeric value (or set explicitly via second argument).
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
      revision = requestedNumber !== undefined ? requestedNumber : revision + 1;
      break;
  }

  const newVersion = `${major}.${minor}.${patch}.${revision}`;

  // Persist the bumped version into package.json so downstream tools can sync.
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

  console.log('Version bumped: ' + oldVersion + ' -> ' + newVersion);
  console.log('Run "npm run sync-ver" to propagate to build.gradle.');

} catch (error) {
  console.error('Error bumping version:', error.message);
  process.exit(1);
}
