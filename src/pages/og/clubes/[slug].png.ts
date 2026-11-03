import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOg, pngResponse } from '../../../lib/og';
import { getClubs, formatCOP, type Club } from '../../../lib/clubs';

export const getStaticPaths = (async () =>
  (await getClubs()).map((club) => ({ params: { slug: club.slug }, props: { club } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const club = (props as { club: Club }).club;
  return pngResponse(
    await renderOg({
      kicker: `Cancha sintética · ${club.city}`,
      title: club.name,
      chips: [
        ...club.formats.slice(0, 2),
        ...(club.hasLighting ? ['Iluminación'] : []),
        ...(club.hasCovered ? ['Techada'] : []),
      ],
      bigStat: club.minPrice ? { value: formatCOP(club.minPrice).replace(/\s/g, ''), label: 'desde / hora' } : undefined,
    }),
  );
};
