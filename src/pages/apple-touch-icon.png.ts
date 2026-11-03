import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { join } from 'node:path';

export const GET: APIRoute = async () => {
  const svg = await readFile(join(process.cwd(), 'public/logo-mark.svg'));
  const png = await sharp(svg, { density: 300 })
    .resize(180, 180)
    .flatten({ background: '#ffffff' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
