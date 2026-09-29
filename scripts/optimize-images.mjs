/**
 * One-shot image optimizer: converts project screenshots to WebP (quality 80).
 * Usage: node scripts/optimize-images.mjs
 * Keep WebP filenames in sync with the `image` fields in components/Projects.tsx.
 */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'projects');
const QUALITY = 80;
const EXCLUDE = new Set(['umair.jpg']);

const files = await readdir(DIR);
let savedBefore = 0;
let savedAfter = 0;

for (const file of files) {
  if (EXCLUDE.has(file)) continue;
  const ext = path.extname(file).toLowerCase();
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') continue;

  const input = path.join(DIR, file);
  const output = path.join(DIR, `${path.basename(file, ext)}.webp`);

  const before = (await stat(input)).size;
  await sharp(input).webp({ quality: QUALITY }).toFile(output);
  const after = (await stat(output)).size;

  savedBefore += before;
  savedAfter += after;
  const ratio = ((1 - after / before) * 100).toFixed(1);
  console.log(`${file} -> ${path.basename(output)}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (-${ratio}%)`);
}

console.log(`\nTotal: ${(savedBefore / 1024 / 1024).toFixed(2)}MB -> ${(savedAfter / 1024 / 1024).toFixed(2)}MB`);
