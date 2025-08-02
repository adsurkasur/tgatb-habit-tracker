import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create SVG icons based on the favicon design
const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

const createSVG = (size) => {
  const cornerRadius = size * 0.1875; // 6/32 from original favicon
  const checkScale = size / 32;
  
  // Checkmark path coordinates (scaled from favicon)
  const checkPath = `M${8 * checkScale},${16 * checkScale} L${12 * checkScale},${20 * checkScale} L${20 * checkScale},${12 * checkScale}`;
  
  // Notification dot (scaled from favicon)
  const dotCx = 22 * checkScale;
  const dotCy = 10 * checkScale;
  const dotR = 2 * checkScale;
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="#6750a4"/>
  <path d="${checkPath}" stroke="white" stroke-width="${2 * checkScale}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="${dotCx}" cy="${dotCy}" r="${dotR}" fill="#ef4444"/>
</svg>`;
};

// Generate SVG icons
sizes.forEach(size => {
  const svg = createSVG(size);
  fs.writeFileSync(path.join(__dirname, `icon-${size}x${size}.svg`), svg);
});

console.log('✅ Generated SVG icons based on your favicon design!');
console.log('🎨 Icons feature:');
console.log('   - Purple background (#6750a4) matching your FAB');
console.log('   - White checkmark for habit completion');
console.log('   - Red notification dot for activity indicators');
console.log('   - Rounded corners for modern app icon look');
console.log('');
console.log('📝 Next steps:');
console.log('1. Open /public/generate-icons.html in your browser for PNG generation');
console.log('2. Or convert these SVG files to PNG format:');
console.log('   Example: magick icon-192x192.svg icon-192x192.png');
console.log('3. Place PNG files in /public/icons/ directory');
console.log('4. Your PWA will automatically use the new icons!');
