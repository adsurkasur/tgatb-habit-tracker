// scripts/syncver.cjs
// Syncs Android versionName and versionCode in build.gradle with package.json.
// This script reads the version from package.json, converts it to a numerical
// versionCode, and updates the android/app/build.gradle file accordingly.

const fs = require('fs');
const path = require('path');

// Define paths to the relevant files.
const pkgPath = path.resolve(__dirname, '../package.json');
const gradlePath = path.resolve(__dirname, '../android/app/build.gradle');

/**
 * Converts a version string into a numerical versionCode suitable for the
 * Google Play Store.
 *
 * Supports both 3-part semver ("1.2.3") and 4-part versions ("1.2.3.4").
 *
 * The scheme is: xx yy zz nnn (legacy stable mapping, 9 digits)
 * - xx: Major version (0-99)
 * - yy: Minor version (0-99)
 * - zz: Patch version (0-99)
 * - nnn: Revision number (0-999)
 *
 * Examples:
 * - "0.1.0"         -> 000100000
 * - "0.4.0.0"       -> 000400000
 * - "0.4.0.1"       -> 000400001
 * - "0.3.2"         -> 000302000
 * - "1.0.0.3"       -> 010000003
 * - "2.0.0.5"       -> 020000005
 *
 * @param {string} version - The version string from package.json.
 * @returns {number} The calculated integer versionCode.
 */
function getVersionCode(version) {
  // Stable-only version upload policy.
  // Equivalent 4-field mapping: major.minor.patch.revision.
  let revision = 0;

  // Parse the core version values (major.minor.patch[.revision]).
  const coreVersion = version.split('-')[0]; // ignore any prerelease suffix
  const parts = coreVersion.split('.').map(part => parseInt(part, 10));
  const major = parts[0] || 0;
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;

  // If a 4th element exists (0.4.0.1), that is the revision for stable builds.
  if (parts.length >= 4) {
    revision = parts[3] || 0;
  }

  // Pad components to fixed width for xx yy zz nnn scheme.
  const paddedMajor = String(major).padStart(2, '0');
  const paddedMinor = String(minor).padStart(2, '0');
  const paddedPatch = String(patch).padStart(2, '0');
  const paddedRevision = String(revision).padStart(3, '0');

  // Form the final version code as xx yy zz nnn.
  // Example: 1.0.0.3 -> 01 00 00 003 = 01000003 (8 digits?)
  // Actually this output may be 9-digit for major >= 10, but it's the requested stable schema.
  const versionCodeString = `${paddedMajor}${paddedMinor}${paddedPatch}${paddedRevision}`;

  // Convert the string to an integer and return it.
  return parseInt(versionCodeString, 10);
}

try {
  // Read and parse package.json to get the version name.
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const versionName = pkg.version;

  // Calculate the corresponding version code.
  const versionCode = getVersionCode(versionName);

  // Read the content of the build.gradle file.
  let gradle = fs.readFileSync(gradlePath, 'utf8');

  // Use regular expressions to replace the existing versionName and versionCode.
  // This is more robust than simple string replacement.
  const gradleNew = gradle
    .replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`)
    .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);

  // Only write to the file if changes were actually made.
  if (gradle !== gradleNew) {
    fs.writeFileSync(gradlePath, gradleNew, 'utf8');
    console.log(`✅ Updated build.gradle: versionName=${versionName}, versionCode=${versionCode}`);
  } else {
    console.log('👍 No changes needed: build.gradle is already up to date.');
  }
} catch (error) {
  console.error('❌ Error syncing version:', error);
  process.exit(1); // Exit with an error code
}
