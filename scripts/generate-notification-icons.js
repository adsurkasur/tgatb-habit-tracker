const path = require('path');
const sharp = require('sharp');

const input = path.join(__dirname, '..', 'public', 'icons', 'icon-notification.svg');
const outDir = path.join(__dirname, '..', 'public', 'icons');
const sizes = [72, 96, 144, 192];

(async () => {
  for (const s of sizes) {
    const out = path.join(outDir, `icon-${s}x${s}-notification.png`);
    await sharp(input).resize(s, s).png().toFile(out);
    console.log(`Generated ${out}`);
  }
})();
