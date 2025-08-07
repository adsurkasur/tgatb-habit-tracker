#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Setting up Android app icon configuration...');

// Define required icon sizes for Android
const iconSizes = [
  { name: 'mdpi', size: 48 },
  { name: 'hdpi', size: 72 },
  { name: 'xhdpi', size: 96 },
  { name: 'xxhdpi', size: 144 },
  { name: 'xxxhdpi', size: 192 }
];

// Paths
const svgPath = path.join(__dirname, '..', 'public', 'icons', 'icon-512x512.svg');
const androidResPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Check if SVG exists
if (!fs.existsSync(svgPath)) {
  console.error('❌ SVG icon not found at:', svgPath);
  process.exit(1);
}

console.log('📁 SVG icon found at:', svgPath);
console.log('');
console.log('🔧 Manual Icon Generation Required');
console.log('');
console.log('To generate the Android app icons, please follow these steps:');
console.log('');
console.log('1. Open the SVG file in a graphics editor (GIMP, Photoshop, Inkscape, etc.)');
console.log(`   File location: ${svgPath}`);
console.log('');
console.log('2. Export the SVG as PNG files with the following sizes:');
console.log('');

// Create directories and show what files are needed
for (const { name, size } of iconSizes) {
  const mipmapDir = path.join(androidResPath, `mipmap-${name}`);
  
  // Ensure directory exists
  if (!fs.existsSync(mipmapDir)) {
    fs.mkdirSync(mipmapDir, { recursive: true });
    console.log(`📁 Created directory: ${mipmapDir}`);
  }
  
  console.log(`   📏 ${size}x${size}px → ${path.join(mipmapDir, 'ic_launcher.png')}`);
  console.log(`   📏 ${size}x${size}px → ${path.join(mipmapDir, 'ic_launcher_round.png')}`);
  console.log(`   📏 ${size}x${size}px → ${path.join(mipmapDir, 'ic_launcher_foreground.png')}`);
  console.log('');
}

console.log('3. Alternative: Use an online SVG to PNG converter');
console.log('   - Visit: https://svgtopng.com/ or https://convertio.co/svg-png/');
console.log('   - Upload your SVG and download PNG versions in the sizes above');
console.log('');
console.log('4. Or install ImageMagick for automatic conversion:');
console.log('   - Windows: Download from https://imagemagick.org/script/download.php');
console.log('   - macOS: brew install imagemagick');
console.log('   - Linux: sudo apt-get install imagemagick');
console.log('   - Then run: npm run generate-icons');
console.log('');
console.log('📱 After adding the PNG files, rebuild your Android app to see the new icons!');

// Create a simple npm script entry suggestion
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.scripts['generate-icons']) {
      console.log('');
      console.log('💡 Add this script to your package.json for easy icon generation:');
      console.log('   "generate-icons": "node scripts/generate-android-icons.js"');
    }
  } catch (error) {
    // Ignore package.json parsing errors
  }
}
