import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create simple SVG icons that can be converted to PNG
const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0f0f23"/>
  <text x="50%" y="35%" font-family="Arial, sans-serif" font-size="${size * 0.2}" font-weight="bold" text-anchor="middle" fill="white">TG</text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold" text-anchor="middle" fill="white">TB</text>
  <g stroke="#4ade80" stroke-width="${size * 0.04}" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M${size * 0.35},${size * 0.75} L${size * 0.43},${size * 0.83} L${size * 0.63},${size * 0.63}"/>
  </g>
</svg>
`;

// Generate SVG icons
sizes.forEach(size => {
  const svg = createSVG(size);
  fs.writeFileSync(path.join(__dirname, `icon-${size}x${size}.svg`), svg.trim());
});

console.log('Generated SVG icons for PWA');
console.log('Note: For production, convert these SVG files to PNG format');
console.log('You can use online tools or ImageMagick to convert them:');
console.log('Example: magick icon-192x192.svg icon-192x192.png');
