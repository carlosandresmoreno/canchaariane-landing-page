/**
 * Datos estructurados schema.org (JSON-LD).
 * Todo lo que se declara aquí también es VISIBLE en la página: Google penaliza lo contrario.
 */
import { SITE, appLink } from './config';
import { openingHoursSchema, formatCOP, type Club } from './clubs';

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

export type Crumb = { name: string; path: string };

export const abs = (path: string) => new URL(path, SITE.url + '/').toString();
export const clubPath = (slug: string) => `/canchas/${slug}/`;

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    logo: { '@type': 'ImageObject', url: abs('/logo-512.png'), width: 512, height: 512 },
    description: SITE.description,
    areaServed: { '@type': 'AdministrativeArea', name: `${SITE.region}, Colombia` },
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE.url}/`,
    name: SITE.name,
    inLanguage: SITE.lang,
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbSchema(items: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

export function clubSchema(club: Club, photoUrls: string[] = []) {
  const id = `${abs(clubPath(club.slug))}#club`;
  const price =
    club.minPrice !== null
      ? club.maxPrice !== null && club.maxPrice !== club.minPrice
        ? `${formatCOP(club.minPrice)} – ${formatCOP(club.maxPrice)} por hora`
        : `${formatCOP(club.minPrice)} por hora`
      : undefined;

  return {
    '@type': 'SportsActivityLocation',
    '@id': id,
    name: club.name,
    url: abs(clubPath(club.slug)),
    description: `Canchas sintéticas de ${club.formats.join(', ').toLowerCase() || 'fútbol'} en ${club.city}. Reserva en línea con horarios en tiempo real.`,
    image: photoUrls.length ? photoUrls : abs(`/og/clubes/${club.slug}.png`),
    ...(club.logoUrl ? { logo: club.logoUrl } : {}),
    ...(club.phone ? { telephone: club.phone } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(club.address ? { streetAddress: club.address.split(',')[0].trim() } : {}),
      addressLocality: club.city,
      addressRegion: club.region,
      addressCountry: SITE.country,
    },
    ...(club.lat !== null && club.lng !== null
      ? {
          geo: { '@type': 'GeoCoordinates', latitude: club.lat, longitude: club.lng },
          hasMap: `https://www.google.com/maps/search/?api=1&query=${club.lat},${club.lng}`,
        }
      : {}),
    ...(club.hours.length ? { openingHoursSpecification: openingHoursSchema(club.hours) } : {}),
    ...(price ? { priceRange: price } : {}),
    currenciesAccepted: 'COP',
    amenityFeature: [
      ...(club.hasLighting ? [{ '@type': 'LocationFeatureSpecification', name: 'Iluminación nocturna', value: true }] : []),
      ...(club.hasCovered ? [{ '@type': 'LocationFeatureSpecification', name: 'Cancha techada', value: true }] : []),
      { '@type': 'LocationFeatureSpecification', name: 'Grama sintética', value: true },
    ],
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: appLink(`/c/${club.slug}`, { campaign: 'schema', content: club.slug }),
        actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
      },
      result: { '@type': 'Reservation', name: `Reserva de cancha en ${club.name}` },
    },
    isPartOf: { '@id': WEBSITE_ID },
  };
}

export function clubListSchema(clubs: Club[], name: string) {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: clubs.length,
    itemListElement: clubs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(clubPath(c.slug)),
      name: c.name,
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function webPageSchema(opts: { path: string; name: string; description: string; about?: string }) {
  return {
    '@type': 'WebPage',
    '@id': `${abs(opts.path)}#webpage`,
    url: abs(opts.path),
    name: opts.name,
    description: opts.description,
    inLanguage: SITE.lang,
    isPartOf: { '@id': WEBSITE_ID },
    ...(opts.about ? { about: { '@id': opts.about } } : {}),
  };
}

export function articleSchema(opts: { path: string; title: string; description: string; published: string; modified: string; image?: string }) {
  return {
    '@type': 'Article',
    '@id': `${abs(opts.path)}#article`,
    headline: opts.title,
    description: opts.description,
    url: abs(opts.path),
    mainEntityOfPage: abs(opts.path),
    datePublished: opts.published,
    dateModified: opts.modified,
    inLanguage: SITE.lang,
    image: abs(opts.image ?? SITE.ogImage),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
}
