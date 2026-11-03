/**
 * Configuración central de la landing.
 * Lo editable sin tocar código va en variables de entorno (.env / docker-compose).
 */
const env = import.meta.env;

export const SITE = {
  name: 'Canchariane',
  url: 'https://canchas.arianedevs.com',
  locale: 'es_CO',
  lang: 'es-CO',
  region: 'Risaralda',
  country: 'CO',
  defaultCity: 'Pereira',
  description:
    'Alquila canchas sintéticas de fútbol en Pereira. Mira horarios libres en tiempo real y reserva al instante, sin llamadas.',
  ogImage: '/og/canchariane.png',
  themeColor: '#0056FB',
} as const;

export const APP_URL = (env.PUBLIC_APP_URL || 'https://cancha.arianedevs.com').replace(/\/$/, '');
export const API_URL = (env.PUBLIC_API_URL || `${APP_URL}/api/v1`).replace(/\/$/, '');
/** Google Analytics 4 (ej. G-XXXXXXX). Vacío = sin analítica. */
export const GA4_ID = (env.PUBLIC_GA4_ID || '').trim();
export const WHATSAPP = (env.PUBLIC_WHATSAPP || '').replace(/\D/g, '');
export const HIDDEN_CLUBS = (process.env.HIDDEN_CLUBS || env.HIDDEN_CLUBS || '')
  .split(',')
  .map((s: string) => s.trim())
  .filter(Boolean);

/** Mínimo de clubes en una ciudad para generar su página propia (evita páginas "delgadas"). */
export const MIN_CLUBS_FOR_CITY_PAGE = 3;

type Utm = { campaign: string; content?: string };

/** Enlace a la app de reservas con UTM para medir qué trae la landing. */
export function appLink(path = '/', utm: Utm = { campaign: 'cta' }): string {
  const url = new URL(path, APP_URL + '/');
  url.searchParams.set('utm_source', 'landing');
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_campaign', utm.campaign);
  if (utm.content) url.searchParams.set('utm_content', utm.content);
  return url.toString();
}

export function whatsappLink(text = 'Hola, quiero información sobre Canchariane'): string | null {
  if (!WHATSAPP) return null;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

const HTML_ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESC[c]);
