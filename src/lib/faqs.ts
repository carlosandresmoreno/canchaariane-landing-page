/**
 * Preguntas frecuentes. Redactadas como respuesta directa (formato que prefieren Google y las IA).
 * Basadas en el funcionamiento real de la app: pago en sitio, sin cuenta, código de reserva,
 * bloqueo temporal de 10 min y anticipación mínima de 30 min.
 */
import { formatCOP, stats, type Club } from './clubs';
import { SITE } from './config';

export type Faq = { q: string; a: string };

export function buildFaqs(clubs: Club[]): Faq[] {
  const s = stats(clubs);
  const city = SITE.defaultCity;
  const prices = clubs.map((c) => c.maxPrice).filter((p): p is number => p !== null);
  const max = prices.length ? Math.max(...prices) : null;
  const priceText =
    s.minPrice !== null
      ? `En Canchariane las canchas sintéticas en ${city} van desde ${formatCOP(s.minPrice)}${
          max && max !== s.minPrice ? ` hasta ${formatCOP(max)}` : ''
        } por hora. El precio depende del club, el tamaño de la cancha (${s.formats.join(', ').toLowerCase()}) y el horario. Ves el valor exacto antes de confirmar.`
      : `El precio depende del club, el tamaño de la cancha y el horario. Ves el valor exacto antes de confirmar.`;

  return [
    {
      q: `¿Cómo alquilo una cancha sintética en ${city}?`,
      a: `Entra a Canchariane, elige el club, el tipo de cancha y una hora libre, y confirma con tu nombre, celular y correo. La reserva queda lista al instante y recibes un código. No tienes que llamar ni crear una cuenta.`,
    },
    {
      q: `¿Cuánto cuesta alquilar una cancha sintética en ${city}?`,
      a: priceText,
    },
    {
      q: '¿Cómo pago la reserva?',
      a: 'Pagas directamente en el club el día del partido. Al reservar ves el total a pagar, así llegas sin sorpresas.',
    },
    {
      q: '¿Los horarios que veo están realmente libres?',
      a: 'Sí. La disponibilidad se muestra en tiempo real desde el sistema del club. Cuando eliges una hora, queda apartada para ti por 10 minutos mientras completas la reserva, así nadie más la toma.',
    },
    {
      q: '¿Con cuánta anticipación puedo reservar?',
      a: 'Puedes reservar hasta 30 minutos antes de la hora de juego, siempre que la cancha esté libre. Para fines de semana y horario nocturno conviene reservar con tiempo.',
    },
    {
      q: '¿Cómo consulto o cancelo mi reserva?',
      a: 'Con el código que recibes al reservar puedes consultar tu reserva en cualquier momento y cancelarla desde la misma página. Al cancelar, la cancha queda libre de inmediato para otra persona.',
    },
    {
      q: `¿Qué tipos de canchas hay en ${city}?`,
      a: `Hoy encuentras ${s.courts} canchas de grama sintética en ${s.clubs} ${s.clubs === 1 ? 'club' : 'clubes'}, en formatos de ${s.formats.join(', ').toLowerCase()}${
        clubs.some((c) => c.hasLighting) ? ', con iluminación para jugar de noche' : ''
      }. Cada club muestra sus canchas, horarios y precios.`,
    },
    {
      q: 'Tengo una cancha, ¿cómo la publico en Canchariane?',
      a: 'Escríbenos y activamos tu club con tus canchas, horarios y precios. Recibes reservas en línea las 24 horas, sin choques de horario, y administras todo desde un panel.',
    },
  ];
}
