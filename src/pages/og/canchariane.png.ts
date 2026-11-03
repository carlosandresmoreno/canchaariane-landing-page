import type { APIRoute } from 'astro';
import { renderOg, pngResponse } from '../../lib/og';
import { getClubs, stats, formatCOP } from '../../lib/clubs';

export const GET: APIRoute = async () => {
  const s = stats(await getClubs());
  return pngResponse(
    await renderOg({
      kicker: 'Pereira · Risaralda',
      title: 'Alquila tu cancha en segundos',
      highlight: 'cancha',
      chips: ['Horarios en tiempo real', 'Sin llamadas', ...(s.minPrice ? [`Desde ${formatCOP(s.minPrice)}/h`] : [])],
      bigStat: { value: String(s.clubs), label: s.clubs === 1 ? 'club activo' : 'clubes activos' },
    }),
  );
};
