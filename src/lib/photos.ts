/**
 * Fotos reales, sin tocar código:
 *   src/assets/clubes/{slug}/*.jpg|png|webp|avif  → galería del club (la 1ª en orden alfabético es la portada)
 *   src/assets/hero/*.jpg|png|webp|avif           → foto del hero de la home (reemplaza la ilustración)
 * Astro las optimiza en el build (AVIF/WebP, varios tamaños). Sube los originales sin miedo (≈2000px).
 * Tip SEO: nombra los archivos con palabras útiles, ej. "futbox-cancha-sintetica-pereira-noche.jpg".
 */
import type { ImageMetadata } from 'astro';

const clubFiles = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/clubes/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);
const heroFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/hero/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
});

export interface Photo {
  src: ImageMetadata;
  /** Texto alternativo derivado del nombre del archivo. */
  alt: string;
}

const altFromFile = (path: string) =>
  path
    .split('/')
    .pop()!
    .replace(/\.[a-z]+$/i, '')
    .replace(/^\d+[-_ ]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim();

const bySlug = new Map<string, Photo[]>();
for (const path of Object.keys(clubFiles).sort()) {
  const slug = path.split('/').at(-2)!;
  const list = bySlug.get(slug) ?? [];
  list.push({ src: clubFiles[path].default, alt: altFromFile(path) });
  bySlug.set(slug, list);
}

export function clubPhotos(slug: string, clubName: string): Photo[] {
  return (bySlug.get(slug) ?? []).map((p, i) => ({
    ...p,
    alt: p.alt.length > 3 ? p.alt : `${clubName}, foto ${i + 1}`,
  }));
}

export function heroPhoto(): Photo | null {
  const first = Object.keys(heroFiles).sort()[0];
  return first ? { src: heroFiles[first].default, alt: altFromFile(first) || 'Cancha sintética' } : null;
}
