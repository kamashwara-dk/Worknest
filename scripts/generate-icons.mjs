/**
 * Generates icon-192.png and icon-512.png from worknest-icon.svg using sharp.
 * Run: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

// Read the SVG
const svgPath = resolve(publicDir, 'worknest-icon.svg');
const svgContent = readFileSync(svgPath, 'utf8');

// The SVG is 32×32 — we need to scale it up cleanly.
// Replace width/height so sharp renders at the target size.
async function generateIcon(size) {
  const scaledSvg = svgContent
    .replace(/width="32"/, `width="${size}"`)
    .replace(/height="32"/, `height="${size}"`)
    .replace(/viewBox="0 0 32 32"/, `viewBox="0 0 32 32"`); // keep viewBox

  const buffer = Buffer.from(scaledSvg);

  await sharp(buffer, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(resolve(publicDir, `icon-${size}.png`));

  console.log(`✅ icon-${size}.png generated (${size}×${size})`);
}

await generateIcon(192);
await generateIcon(512);

console.log('\n🎉 PWA icons ready in public/');
