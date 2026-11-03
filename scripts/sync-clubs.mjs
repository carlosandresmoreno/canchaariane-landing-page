// Descarga los clubes de la API y guarda una copia local (respaldo si la API falla en un build).
// Uso: npm run sync:clubs
import { writeFile } from 'node:fs/promises';

const API = (process.env.PUBLIC_API_URL || 'https://cancha.arianedevs.com/api/v1').replace(/\/$/, '');
const get = async (u) => {
  const r = await fetch(u, { signal: AbortSignal.timeout(10_000) });
  if (!r.ok) throw new Error(`${r.status} @ ${u}`);
  return r.json();
};

const list = await get(`${API}/clubs`);
const details = await Promise.all(list.map((c) => get(`${API}/clubs/${encodeURIComponent(c.slug)}`)));
await writeFile(new URL('../src/data/clubs.snapshot.json', import.meta.url), JSON.stringify(details, null, 2) + '\n');
console.log(`Snapshot actualizado: ${details.length} clubes (${details.map((d) => d.slug).join(', ')})`);
