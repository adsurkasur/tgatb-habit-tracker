#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Generating Android app icons from SVG...');

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

// Function to convert SVG to PNG using Sharp
async function convertSvgToPng(inputSvg, outputPng, size) {
  try {
    const sharp = require('sharp');
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPng);
    console.log(`✅ Generated ${size}x${size} icon: ${path.basename(outputPng)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate ${size}x${size} icon:`, error.message);
    return false;
  }
}

// Main function to generate all icons
async function generateIcons() {
  let success = true;
  
  for (const { name, size } of iconSizes) {
    const mipmapDir = path.join(androidResPath, `mipmap-${name}`);
    
    // Ensure directory exists
    if (!fs.existsSync(mipmapDir)) {
      fs.mkdirSync(mipmapDir, { recursive: true });
    }
    
    // Generate main icon
    const iconPath = path.join(mipmapDir, 'ic_launcher.png');
    if (!(await convertSvgToPng(svgPath, iconPath, size))) {
      success = false;
      break;
    }
    
    // Generate round icon (same image for now)
    const roundIconPath = path.join(mipmapDir, 'ic_launcher_round.png');
    if (!(await convertSvgToPng(svgPath, roundIconPath, size))) {
      success = false;
      break;
    }
    
    // Generate foreground icon for adaptive icons
    const foregroundIconPath = path.join(mipmapDir, 'ic_launcher_foreground.png');
    if (!(await convertSvgToPng(svgPath, foregroundIconPath, size))) {
      success = false;
      break;
    }
  }

  if (success) {
    console.log('🎉 All Android icons generated successfully!');
    console.log('📱 Icons have been placed in android/app/src/main/res/mipmap-* directories');
    console.log('🔧 Make sure to rebuild your Android app to see the new icons');
  } else {
    console.error('❌ Icon generation failed. Please check the error messages above.');
    process.exit(1);
  }
}

// Run the icon generation
generateIcons().catch(error => {
  console.error('❌ Unexpected error:', error.message);
  console.log('💡 Make sure Sharp is installed: npm install sharp --save-dev');
  process.exit(1);
});
