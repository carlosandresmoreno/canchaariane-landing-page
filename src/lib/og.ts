/**
 * Generador de imágenes Open Graph (1200×630 PNG) en tiempo de build.
 * satori convierte el texto en trazos vectoriales → no depende de fuentes del servidor.
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { join } from 'node:path';

const require = createRequire(join(process.cwd(), 'package.json'));
const font = (p: string) => readFile(require.resolve(p));

let fontsP: Promise<{ name: string; data: Buffer; weight: 500 | 600 | 700 | 800 | 900; style: 'normal' }[]> | null =
  null;
const fonts = () =>
  (fontsP ??= Promise.all([
    font('@fontsource/archivo/files/archivo-latin-900-normal.woff').then((data) => ({
      name: 'Archivo',
      data,
      weight: 900 as const,
      style: 'normal' as const,
    })),
    font('@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff').then((data) => ({
      name: 'Jakarta',
      data,
      weight: 600 as const,
      style: 'normal' as const,
    })),
    font('@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff').then((data) => ({
      name: 'Jakarta',
      data,
      weight: 700 as const,
      style: 'normal' as const,
    })),
  ]));

let logoP: Promise<string> | null = null;
const logo = () =>
  (logoP ??= readFile(join(process.cwd(), 'public/logo-mark.svg')).then(
    (b) => `data:image/svg+xml;base64,${b.toString('base64')}`,
  ));

const PITCH_SVG = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 630" fill="none" stroke="white" stroke-opacity=".35" stroke-width="4">
    <rect x="40" y="40" width="340" height="550" rx="18"/>
    <line x1="40" y1="315" x2="380" y2="315"/>
    <circle cx="210" cy="315" r="70"/>
    <circle cx="210" cy="315" r="6" fill="white" fill-opacity=".5"/>
    <rect x="115" y="40" width="190" height="100"/>
    <rect x="115" y="490" width="190" height="100"/>
  </svg>`,
).toString('base64')}`;

type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): El => ({
  type,
  props: { style: { display: 'flex', ...style }, children, ...extra },
});

export interface OgInput {
  kicker: string; // "PEREIRA · RISARALDA"
  title: string; // "Alquila tu cancha"
  highlight?: string; // palabra del título resaltada en verde
  chips?: string[];
  bigStat?: { value: string; label: string };
}

export async function renderOg(input: OgInput): Promise<Buffer> {
  const [f, logoSrc] = await Promise.all([fonts(), logo()]);
  const words = input.title.toUpperCase().split(' ');
  const hl = input.highlight?.toUpperCase();

  const tree = h(
    'div',
    { width: 1200, height: 630, background: '#ffffff', fontFamily: 'Jakarta', position: 'relative' },
    [
      // Panel derecho azul con cancha
      h(
        'div',
        {
          position: 'absolute',
          right: 0,
          top: 0,
          width: 420,
          height: 630,
          background: 'linear-gradient(160deg, #0066FF 0%, #0047D6 55%, #06102E 100%)',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
        [
          h('img', { position: 'absolute', inset: 0, width: 420, height: 630 }, undefined, {
            src: PITCH_SVG,
            width: 420,
            height: 630,
          }),
          ...(input.bigStat
            ? [
                h(
                  'div',
                  { fontFamily: 'Archivo', fontWeight: 900, fontSize: input.bigStat.value.length > 4 ? 76 : 120, color: '#00E575', lineHeight: 1, letterSpacing: -3 },
                  input.bigStat.value,
                ),
                h(
                  'div',
                  { fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 10, letterSpacing: 3, textTransform: 'uppercase' },
                  input.bigStat.label,
                ),
              ]
            : []),
        ],
      ),
      // Columna izquierda
      h('div', { flexDirection: 'column', padding: '56px 0 56px 64px', width: 690, height: 630, boxSizing: 'content-box' }, [
        h('div', { alignItems: 'center', gap: 16 }, [
          h('img', { width: 64, height: 64 }, undefined, { src: logoSrc, width: 64, height: 64 }),
          h('div', { fontFamily: 'Archivo', fontWeight: 900, fontSize: 30, color: '#0B1220', letterSpacing: -0.5 }, 'CANCHARIANE'),
        ]),
        h(
          'div',
          { marginTop: 54, fontSize: 22, fontWeight: 700, color: '#0056FB', letterSpacing: 4, textTransform: 'uppercase' },
          input.kicker,
        ),
        h(
          'div',
          {
            marginTop: 14,
            width: 660,
            flexWrap: 'wrap',
            fontFamily: 'Archivo',
            fontWeight: 900,
            fontSize: words.join(' ').length > 26 ? 66 : 82,
            lineHeight: 0.98,
            color: '#0B1220',
            letterSpacing: -2,
            columnGap: 18,
          },
          words.map((w) =>
            h(
              'span',
              w === hl
                ? { background: '#00E575', padding: '0 10px', marginLeft: -4 }
                : {},
              w,
            ),
          ),
        ),
        h(
          'div',
          { position: 'absolute', left: 64, bottom: 56, width: 660, gap: 12, flexWrap: 'wrap' },
          (input.chips ?? []).map((c) =>
            h(
              'div',
              {
                fontSize: 22,
                fontWeight: 700,
                color: '#0B1220',
                border: '2px solid #E6E8EE',
                borderRadius: 999,
                padding: '10px 22px',
              },
              c,
            ),
          ),
        ),
      ]),
    ],
  );

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: f });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
}

export const pngResponse = (buf: Buffer) =>
  new Response(new Uint8Array(buf), { headers: { 'Content-Type': 'image/png' } });
