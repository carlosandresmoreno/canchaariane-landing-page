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

/**
 * Mínimo de clubes en una ciudad para generar su página propia. Con 1 basta: la página de ciudad
 * lleva texto propio (precios, formatos, preguntas) para no quedar "delgada", y llegar primero
 * a "canchas en {ciudad}" en una ciudad nueva vale más que esperar a tener 3 clubes.
 */
export const MIN_CLUBS_FOR_CITY_PAGE = 1;

/**
 * Departamento de cada ciudad, para la dirección de los datos estructurados.
 * Las claves van sin tildes y en minúscula (ver regionFor). Agrega aquí cada ciudad nueva;
 * si no está, se usa SITE.region y el build avisa en consola.
 */
const CITY_REGION: Record<string, string> = {
  // Risaralda
  pereira: 'Risaralda',
  dosquebradas: 'Risaralda',
  'santa rosa de cabal': 'Risaralda',
  'santa rosa': 'Risaralda',
  'la virginia': 'Risaralda',
  'la celia': 'Risaralda',
  marsella: 'Risaralda',
  // Caldas
  manizales: 'Caldas',
  villamaria: 'Caldas',
  chinchina: 'Caldas',
  // Quindío
  armenia: 'Quindío',
  calarca: 'Quindío',
  montenegro: 'Quindío',
  'la tebaida': 'Quindío',
  circasia: 'Quindío',
  // Valle del Cauca
  cartago: 'Valle del Cauca',
  cali: 'Valle del Cauca',
  // Grandes ciudades
  bogota: 'Bogotá D. C.',
  medellin: 'Antioquia',
};

const cityKey = (city: string) =>
  city.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const warned = new Set<string>();
/** Departamento de una ciudad. `fromApi` tiene prioridad si la API llega a enviarlo. */
export function regionFor(city: string, fromApi?: string | null): string {
  if (fromApi?.trim()) return fromApi.trim();
  const region = CITY_REGION[cityKey(city)];
  if (region) return region;
  if (!warned.has(city)) {
    warned.add(city);
    console.warn(`[clubs] Ciudad sin departamento en CITY_REGION: "${city}". Se usa ${SITE.region}.`);
  }
  return SITE.region;
}

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
