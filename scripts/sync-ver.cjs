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
 * The scheme is: xxyyzzSnn
 * - xx: Major version (0-99)
 * - yy: Minor version (0-99)
 * - zz: Patch version (0-99)
 * - S:  Stage (0=alpha, 1=beta, 9=stable/final)
 * - nn: Revision number (0-99) — from pre-release tag OR 4th version segment
 *
 * Examples:
 * - "0.1.0"         -> 100900   (stable, revision 0)
 * - "0.4.0.0"       -> 400900   (stable, revision 0)
 * - "0.4.0.1"       -> 400901   (stable, revision 1)
 * - "0.3.2-beta.1"  -> 302101   (beta, revision 1)
 * - "0.3.2-beta.2"  -> 302102   (beta, revision 2)
 * - "0.3.2"         -> 302900   (stable, revision 0)
 * - "12.34.56"      -> 123456900
 *
 * @param {string} version - The version string from package.json.
 * @returns {number} The calculated integer versionCode.
 */
function getVersionCode(version) {
  // Default values for a stable release.
  let stage = 9; // 9 for "stable"
  let revision = 0;

  // Split the version string into the core version part and a potential pre-release tag.
  // e.g., "0.3.2-beta.1" -> ["0.3.2", "beta.1"]
  const [coreVersion, preReleaseTag] = version.split('-');

  // Parse version parts — supports 3-part (x.y.z) and 4-part (x.y.z.r) versions.
  const parts = coreVersion.split('.').map(part => parseInt(part, 10));
  const major = parts[0] || 0;
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;

  // If 4th segment exists (e.g., "0.4.0.1"), use it as the revision number.
  if (parts.length >= 4) {
    revision = parts[3] || 0;
  }

  // Check if a pre-release tag exists and adjust the stage and revision accordingly.
  // Pre-release tag takes precedence over 4th segment for stage and revision.
  if (preReleaseTag) {
    const [stageName, revisionStr] = preReleaseTag.split('.');
    revision = parseInt(revisionStr, 10);

    // Assign a numerical value based on the stage name.
    if (stageName === 'beta') {
      stage = 1;
    } else if (stageName === 'alpha') {
      stage = 0;
    }
  }

  // Pad each component to ensure a consistent length.
  // This is crucial for the final number to be calculated correctly.
  const paddedMajor = String(major).padStart(2, '0');
  const paddedMinor = String(minor).padStart(2, '0');
  const paddedPatch = String(patch).padStart(2, '0');
  const paddedRevision = String(revision).padStart(2, '0');

  // Concatenate the padded parts to form the final version code string.
  const versionCodeString = `${paddedMajor}${paddedMinor}${paddedPatch}${stage}${paddedRevision}`;

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
