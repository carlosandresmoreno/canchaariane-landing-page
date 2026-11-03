import type { APIRoute } from 'astro';
import { getClubs, stats, formatCOP, hoursSummary } from '../lib/clubs';
import { SITE, APP_URL } from '../lib/config';

/** /llms.txt — resumen en Markdown para asistentes de IA (estándar llmstxt.org). */
export const GET: APIRoute = async () => {
  const clubs = await getClubs();
  const s = stats(clubs);
  const lines = [
    `# ${SITE.name}`,
    '',
    `> Plataforma para alquilar canchas sintéticas de fútbol en ${SITE.defaultCity} (${SITE.region}, Colombia) con disponibilidad en tiempo real. ${s.clubs} clubes, ${s.courts} canchas${s.minPrice ? `, desde ${formatCOP(s.minPrice)} por hora` : ''}. Reserva en línea sin llamadas; se paga en el club.`,
    '',
    '## Cómo reservar',
    `- Entrar a ${APP_URL}/ , elegir club, cancha y hora libre.`,
    '- Confirmar con nombre, celular y correo. No requiere cuenta.',
    '- Se recibe un código de reserva; con él se consulta o cancela la reserva.',
    '- El pago se hace directamente en el club.',
    '',
    '## Clubes',
    ...clubs.map((c) => {
      const h = hoursSummary(c.hours).map((x) => `${x.days} ${x.time}`).join('; ');
      return `- [${c.name}](${SITE.url}/canchas/${c.slug}/): ${c.city}${c.address ? `, ${c.address}` : ''}. ${c.formats.join(', ')}. ${c.courts.length} ${c.courts.length === 1 ? 'cancha' : 'canchas'}${c.minPrice ? `, desde ${formatCOP(c.minPrice)}/h` : ''}${c.hasLighting ? ', con iluminación' : ''}${h ? `. Horario: ${h}` : ''}`.replace(/\.?$/, '.');
    }),
    '',
    '## Páginas',
    `- [Todas las canchas](${SITE.url}/canchas/)`,
    `- [Preguntas frecuentes](${SITE.url}/preguntas-frecuentes/)`,
    `- [Para dueños de canchas](${SITE.url}/para-clubes/)`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
