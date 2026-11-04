/** Registro de guías (contenido informativo para SEO). Cada guía es una página en src/pages/guias/. */
export interface Guide {
  slug: string;
  title: string; // H1
  seoTitle: string; // ≤ 60 caracteres con la marca
  description: string;
  eyebrow: string;
  published: string; // ISO
  readMinutes: number;
}

export const GUIDES: Guide[] = [
  {
    slug: 'precio-alquiler-cancha-sintetica-pereira',
    title: '¿Cuánto cuesta alquilar una cancha sintética en Pereira?',
    seoTitle: 'Precio de Alquiler de Cancha Sintética en Pereira',
    description:
      'Precios reales por hora de las canchas sintéticas en Pereira, cuánto paga cada jugador y cómo reservar al mejor precio. Actualizado con datos de los clubes.',
    eyebrow: 'Precios',
    published: '2026-11-03',
    readMinutes: 4,
  },
  {
    slug: 'como-organizar-partido-futbol-5',
    title: 'Cómo organizar un partido de fútbol 5 con tus amigos',
    seoTitle: 'Cómo Organizar un Partido de Fútbol 5 (Guía Rápida)',
    description:
      'Paso a paso para armar el partido: cuántos jugadores necesitas, cómo reservar la cancha, cómo dividir la cuenta y qué llevar para jugar en sintética.',
    eyebrow: 'Guía práctica',
    published: '2026-11-03',
    readMinutes: 5,
  },
  {
    slug: 'futbol-5-6-7-9-diferencias',
    title: 'Fútbol 5, 6, 7 y 9: diferencias, jugadores y tamaño de cancha',
    seoTitle: 'Fútbol 5, 6, 7 y 9: Diferencias y Jugadores',
    description:
      'Cuántos jugadores hay en fútbol 5, 6, 7 y 9, el tamaño aproximado de cada cancha sintética y cuál conviene según cuántos son en tu grupo.',
    eyebrow: 'Formatos',
    published: '2026-11-03',
    readMinutes: 4,
  },
];

export const guidePath = (slug: string) => `/guias/${slug}/`;
export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug)!;
