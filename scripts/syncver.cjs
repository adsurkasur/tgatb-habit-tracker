// scripts/syncver.cjs
// Syncs Android versionName and versionCode in build.gradle with package.json

const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');
const gradlePath = path.resolve(__dirname, '../android/app/build.gradle');

function getVersionCode(version) {
  // Convert x.y.z to xyyzz (e.g., 0.2.6 -> 206)
  const parts = version.split('.').map(Number);
  let code = 0;
  if (parts.length === 3) {
    code = parts[0] * 10000 + parts[1] * 100 + parts[2];
  } else if (parts.length === 2) {
    code = parts[0] * 10000 + parts[1] * 100;
  } else if (parts.length === 1) {
    code = parts[0] * 10000;
  }
  return code;
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const versionName = pkg.version;
const versionCode = getVersionCode(versionName);

let gradle = fs.readFileSync(gradlePath, 'utf8');

// Replace versionName and versionCode in build.gradle
const gradleNew = gradle
  .replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`)
  .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);

if (gradle !== gradleNew) {
  fs.writeFileSync(gradlePath, gradleNew, 'utf8');
  console.log(`Updated build.gradle: versionName=${versionName}, versionCode=${versionCode}`);
} else {
  console.log('No changes needed: build.gradle is already up to date.');
}
