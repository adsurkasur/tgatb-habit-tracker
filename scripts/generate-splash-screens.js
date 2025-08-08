import sharp from 'sharp';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPLASH_SIZES = [
  // Portrait orientations
  { width: 320, height: 568, folder: 'drawable-port-mdpi' },
  { width: 480, height: 854, folder: 'drawable-port-hdpi' },
  { width: 640, height: 1136, folder: 'drawable-port-xhdpi' },
  { width: 960, height: 1704, folder: 'drawable-port-xxhdpi' },
  { width: 1280, height: 2272, folder: 'drawable-port-xxxhdpi' },
  
  // Landscape orientations
  { width: 568, height: 320, folder: 'drawable-land-mdpi' },
  { width: 854, height: 480, folder: 'drawable-land-hdpi' },
  { width: 1136, height: 640, folder: 'drawable-land-xhdpi' },
  { width: 1704, height: 960, folder: 'drawable-land-xxhdpi' },
  { width: 2272, height: 1280, folder: 'drawable-land-xxxhdpi' },
  
  // Default drawable
  { width: 640, height: 1136, folder: 'drawable' }
];

const PURPLE_THEME_COLOR = '#6750a4';
const LOGO_SIZE_RATIO = 0.3; // Logo takes 30% of screen width

async function generateSplashScreens() {
  const sourceIcon = path.join(__dirname, '..', 'public', 'favicon.svg');
  const androidResPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
  
  if (!existsSync(sourceIcon)) {
    console.error('Source icon not found:', sourceIcon);
    return;
  }
  
  console.log('🎨 Generating splash screens...');
  
  for (const size of SPLASH_SIZES) {
    const outputDir = path.join(androidResPath, size.folder);
    const outputPath = path.join(outputDir, 'splash.png');
    
    // Create directory if it doesn't exist
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // Calculate logo size
    const logoSize = Math.min(size.width, size.height) * LOGO_SIZE_RATIO;
    
    try {
      // Create background
      const background = sharp({
        create: {
          width: size.width,
          height: size.height,
          channels: 4,
          background: PURPLE_THEME_COLOR
        }
      });
      
      // Convert SVG to PNG for the logo
      const logo = await sharp(sourceIcon)
        .resize(Math.round(logoSize), Math.round(logoSize))
        .png()
        .toBuffer();
      
      // Composite logo onto background
      await background
        .composite([{
          input: logo,
          gravity: 'center'
        }])
        .png()
        .toFile(outputPath);
        
      console.log(`✅ Generated: ${size.folder}/splash.png (${size.width}x${size.height})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size.folder}/splash.png:`, error.message);
    }
  }
  
  console.log('🎉 Splash screen generation complete!');
}

// Execute the function
generateSplashScreens().catch(console.error);

export { generateSplashScreens };
