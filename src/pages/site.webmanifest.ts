import type { APIRoute } from 'astro';
import { SITE } from '../lib/config';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: `${SITE.name} — Canchas sintéticas en ${SITE.defaultCity}`,
      short_name: SITE.name,
      lang: SITE.lang,
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: SITE.themeColor,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
