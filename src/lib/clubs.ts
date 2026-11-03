/**
 * Capa de datos: lee la API pública de la app (solo lectura) en tiempo de build.
 * Si la API falla, usa la última copia guardada en src/data/clubs.snapshot.json
 * (se actualiza con `npm run sync:clubs`). Así un build nunca rompe la landing.
 */
import snapshot from '../data/clubs.snapshot.json';
import { API_URL, HIDDEN_CLUBS } from './config';

// ---------- Tipos crudos de la API ----------
export interface ApiCourt {
  name: string;
  sport: string;
  surface: string;
  player_format: string;
  is_covered: boolean;
  has_lighting: boolean;
  price_per_hour_cents: number | null;
}
export interface ApiHours {
  weekday: number; // 0 = lunes … 6 = domingo
  opens_at: string;
  closes_at: string;
  closes_next_day: boolean;
}
export interface ApiClubDetail {
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  courts: ApiCourt[];
  business_hours: ApiHours[];
  [k: string]: unknown;
}

// ---------- Modelo normalizado para la landing ----------
export interface Court {
  name: string;
  sport: string;
  format: string; // "5x5"
  formatLabel: string; // "Fútbol 5"
  surface: string;
  covered: boolean;
  lighting: boolean;
  price: number | null; // COP por hora
}
export interface Hours {
  day: number;
  opens: string;
  closes: string;
  nextDay: boolean;
}
export interface Club {
  slug: string;
  name: string;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null; // E.164 o null si no es válido
  logoUrl: string | null;
  sports: string[];
  courts: Court[];
  formats: string[]; // ["Fútbol 5", "Fútbol 9"]
  minPrice: number | null;
  maxPrice: number | null;
  hasLighting: boolean;
  hasCovered: boolean;
  hours: Hours[];
}

// ---------- Etiquetas ----------
const SPORT_LABEL: Record<string, string> = {
  football: 'Fútbol',
  soccer: 'Fútbol',
  padel: 'Pádel',
  tennis: 'Tenis',
  basketball: 'Baloncesto',
  volleyball: 'Voleibol',
};
const SURFACE_LABEL: Record<string, string> = {
  synthetic_grass: 'Grama sintética',
  natural_grass: 'Grama natural',
  hard: 'Superficie dura',
  clay: 'Arcilla',
  concrete: 'Concreto',
};
export const DAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const DAY_LONG = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const SCHEMA_DAY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const sportLabel = (s: string) => SPORT_LABEL[s] ?? s.charAt(0).toUpperCase() + s.slice(1);
export const surfaceLabel = (s: string) => SURFACE_LABEL[s] ?? s.replace(/_/g, ' ');

function formatLabel(sport: string, format: string): string {
  const n = format.split(/x/i)[0];
  if (sport === 'football' || sport === 'soccer') return n ? `Fútbol ${n}` : 'Fútbol';
  return `${sportLabel(sport)}${n && format ? ` ${format}` : ''}`;
}

/** Normaliza teléfonos colombianos; descarta los de prueba (3333333333) o mal formados. */
export function normalizePhone(raw: string | null): string | null {
  if (!raw) return null;
  let d = raw.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('57')) d = d.slice(2);
  if (d.length !== 10) return null;
  if (/(\d)\1{6,}/.test(d)) return null; // 7+ dígitos repetidos = dato de prueba
  if (!/^(3|60)/.test(d)) return null; // celular (3xx) o fijo nuevo (60x)
  return `+57${d}`;
}

export const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    .format(n)
    .replace(/\s/g, '');

/** "13:00" → "1:00 p. m." */
export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  if (h === 0 && m === 0) return '12:00 a. m.';
  const suffix = h >= 12 ? 'p. m.' : 'a. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function normalize(d: ApiClubDetail): Club {
  const courts: Court[] = (d.courts ?? []).map((c) => ({
    name: c.name,
    sport: c.sport,
    format: c.player_format,
    formatLabel: formatLabel(c.sport, c.player_format),
    surface: surfaceLabel(c.surface),
    covered: c.is_covered,
    lighting: c.has_lighting,
    price: c.price_per_hour_cents ? Math.round(c.price_per_hour_cents / 100) : null,
  }));
  const prices = courts.map((c) => c.price).filter((p): p is number => p !== null && p > 0);
  const formats = [...new Set(courts.map((c) => c.formatLabel))].sort(
    (a, b) => (parseInt(a.replace(/\D/g, '')) || 0) - (parseInt(b.replace(/\D/g, '')) || 0),
  );
  return {
    slug: d.slug,
    name: d.name.replace(/\b\p{Ll}/gu, (ch, i: number) => (i === 0 ? ch.toUpperCase() : ch)),
    city: d.city?.trim() || 'Pereira',
    address: d.address?.trim() || null,
    lat: d.latitude ?? null,
    lng: d.longitude ?? null,
    phone: normalizePhone(d.phone),
    logoUrl: d.logo_url,
    sports: [...new Set(courts.map((c) => c.sport))],
    courts,
    formats,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    hasLighting: courts.some((c) => c.lighting),
    hasCovered: courts.some((c) => c.covered),
    hours: (d.business_hours ?? [])
      .map((h) => ({ day: h.weekday, opens: h.opens_at, closes: h.closes_at, nextDay: h.closes_next_day }))
      .sort((a, b) => a.day - b.day),
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000), headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} @ ${url}`);
  return (await res.json()) as T;
}

/** Descarga la lista + el detalle de cada club desde la API. Lo usa también el script de sync. */
export async function fetchClubDetails(apiUrl = API_URL): Promise<ApiClubDetail[]> {
  const list = await fetchJson<{ slug: string }[]>(`${apiUrl}/clubs`);
  return Promise.all(list.map((c) => fetchJson<ApiClubDetail>(`${apiUrl}/clubs/${encodeURIComponent(c.slug)}`)));
}

let cache: Promise<Club[]> | null = null;

/** Todos los clubes visibles, ordenados por nombre. Se calcula una sola vez por build. */
export function getClubs(): Promise<Club[]> {
  cache ??= (async () => {
    let raw: ApiClubDetail[];
    try {
      raw = await fetchClubDetails();
      console.log(`[clubs] ${raw.length} clubes leídos desde ${API_URL}`);
    } catch (err) {
      console.warn(`[clubs] API no disponible (${(err as Error).message}). Usando snapshot local.`);
      raw = snapshot as unknown as ApiClubDetail[];
    }
    return raw
      .filter((c) => c?.slug && !HIDDEN_CLUBS.includes(c.slug))
      .map(normalize)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  })();
  return cache;
}

// ---------- Utilidades de presentación ----------

/** Agrupa días consecutivos con el mismo horario: "Lun – Dom · 1:00 p. m. – 11:00 p. m." */
export function hoursSummary(hours: Hours[]): { days: string; time: string }[] {
  const groups: { from: number; to: number; key: string; h: Hours }[] = [];
  for (const h of hours) {
    const key = `${h.opens}-${h.closes}-${h.nextDay}`;
    const last = groups.at(-1);
    if (last && last.key === key && last.to === h.day - 1) last.to = h.day;
    else groups.push({ from: h.day, to: h.day, key, h });
  }
  return groups.map((g) => ({
    days: g.from === g.to ? DAY_SHORT[g.from] : `${DAY_SHORT[g.from]} – ${DAY_SHORT[g.to]}`,
    time: `${formatTime(g.h.opens)} – ${formatTime(g.h.closes)}`,
  }));
}

/** openingHoursSpecification de schema.org, partiendo los horarios que pasan de medianoche. */
export function openingHoursSchema(hours: Hours[]) {
  const out: Record<string, string>[] = [];
  for (const h of hours) {
    if (!h.nextDay) {
      out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: SCHEMA_DAY[h.day], opens: h.opens, closes: h.closes });
      continue;
    }
    out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: SCHEMA_DAY[h.day], opens: h.opens, closes: '23:59' });
    if (h.closes !== '00:00') {
      out.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: SCHEMA_DAY[(h.day + 1) % 7],
        opens: '00:00',
        closes: h.closes,
      });
    }
  }
  return out;
}

export const citySlug = (city: string) =>
  city
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Resumen global para la home: totales, precio mínimo, ciudades. */
export function stats(clubs: Club[]) {
  const prices = clubs.map((c) => c.minPrice).filter((p): p is number => p !== null);
  return {
    clubs: clubs.length,
    courts: clubs.reduce((n, c) => n + c.courts.length, 0),
    minPrice: prices.length ? Math.min(...prices) : null,
    cities: [...new Set(clubs.map((c) => c.city))],
    formats: [...new Set(clubs.flatMap((c) => c.formats))].sort(
      (a, b) => (parseInt(a.replace(/\D/g, '')) || 0) - (parseInt(b.replace(/\D/g, '')) || 0),
    ),
  };
}
