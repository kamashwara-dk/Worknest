/**
 * Generates icon-192.png and icon-512.png for the WorkNest PWA.
 * Uses sharp to render the SVG onto a solid #0A1828 background
 * so there are no transparent pixels (which Android fills green).
 *
 * Run: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

async function generateIcon(size) {
  // Build the SVG inline with explicit size, solid background, and the W logo
  // centered with padding so it looks good as a rounded-square app icon.
  const padding = Math.round(size * 0.18); // 18% padding on each side
  const logoSize = size - padding * 2;
  const cornerRadius = Math.round(size * 0.22); // rounded corners for the logo rect

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Solid dark background — no transparency -->
  <rect width="${size}" height="${size}" fill="#0A1828"/>

  <!-- Teal rounded-square logo mark -->
  <rect
    x="${padding}" y="${padding}"
    width="${logoSize}" height="${logoSize}"
    rx="${cornerRadius}" ry="${cornerRadius}"
    fill="#178582"
  />

  <!-- Subtle inner gradient overlay for depth -->
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1EAAA7" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#0D5250" stop-opacity="0.6"/>
    </linearGradient>
  </defs>
  <rect
    x="${padding}" y="${padding}"
    width="${logoSize}" height="${logoSize}"
    rx="${cornerRadius}" ry="${cornerRadius}"
    fill="url(#g)"
  />

  <!-- Bold "W" centred in the logo mark -->
  <text
    x="${size / 2}"
    y="${size / 2 + logoSize * 0.14}"
    font-family="Arial Black, Arial, sans-serif"
    font-size="${Math.round(logoSize * 0.62)}"
    font-weight="900"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
  >W</text>
</svg>`.trim();

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .flatten({ background: '#0A1828' })   // merge alpha onto dark bg — no green
    .png({ compressionLevel: 9 })
    .toFile(resolve(publicDir, `icon-${size}.png`));

  console.log(`✅ icon-${size}.png  (${size}×${size}, solid background)`);
}

await generateIcon(192);
await generateIcon(512);

console.log('\n🎉 PWA icons ready — no transparent pixels.');
