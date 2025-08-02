// This script creates basic PNG icons from canvas for PWA support
// Run this in a browser console or use it as a reference

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

function createIcon(size) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = size;
  canvas.height = size;
  
  // Background
  ctx.fillStyle = '#0f0f23';
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TG', size / 2, size * 0.35);
  
  ctx.font = `bold ${size * 0.15}px Arial`;
  ctx.fillText('TB', size / 2, size * 0.65);
  
  // Checkmark
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = size * 0.04;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(size * 0.35, size * 0.75);
  ctx.lineTo(size * 0.43, size * 0.83);
  ctx.lineTo(size * 0.63, size * 0.63);
  ctx.stroke();
  
  return canvas.toDataURL('image/png');
}

// To use this script:
// 1. Open your browser console
// 2. Paste this code
// 3. Run: sizes.forEach(size => { const dataUrl = createIcon(size); console.log(\`Icon ${size}x${size}:\`, dataUrl); });
// 4. Save each data URL as a PNG file

console.log('Icon generation script loaded. Use the createIcon(size) function to generate icons.');
