# Plan SEO: aparecer primero en Google y en las IA

**Objetivo:** que Canchariane salga primero cuando alguien en Pereira busque "cancha sintética", "alquilar cancha", "fútbol 5 Pereira" o "canchas cerca de mí", y que ChatGPT, Gemini o Perplexity nos recomienden.

**Diagnóstico (3/11/2026):** en Pereira **no hay ningún sitio web fuerte** compitiendo por estas búsquedas. Google hoy muestra estudios universitarios y páginas de Bogotá. Hay que llegar primero.

Hay **dos tableros distintos** en Google, y hay que ganar los dos:

| Tablero | Qué es | Qué lo gana |
|---|---|---|
| **Mapa** ("canchas cerca de mí") | Los 3 negocios con pin que salen arriba | **Google Business Profile** de cada club (paso 3). Es lo más importante. |
| **Resultados web** | Los enlaces azules | La landing (ya está), las guías, la indexación y los enlaces de otros sitios |

---

## ✅ Ya hecho en el código

- HTML completo y rápido (Lighthouse en móvil: 97–99 de rendimiento y 100 en SEO).
- Títulos, descripciones y canonical en cada página.
- Datos estructurados para Google: cada club con dirección, horario, precio y coordenadas, más migas de pan, preguntas frecuentes y artículos.
- Sitemap, `robots.txt` (permite a los bots de IA) y `llms.txt`.
- Una página por club, generada automáticamente desde la API.
- **3 guías** que responden lo que la gente busca, con precios reales:
  - `/guias/precio-alquiler-cancha-sintetica-pereira/`
  - `/guias/como-organizar-partido-futbol-5/`
  - `/guias/futbol-5-6-7-9-diferencias/`
- **IndexNow** listo (`npm run indexnow`), para que Bing indexe al instante. Bing alimenta a ChatGPT Search y a Copilot.

---

## Paso 1 · Google Search Console (15 min) — HOY

1. Entra a https://search.google.com/search-console con la cuenta de Google del negocio.
2. **Agregar propiedad → "Dominio"** → escribe `arianedevs.com`. Así cubre `canchas.` y `cancha.` en una sola propiedad.
3. Google te da un registro **TXT**. Agrégalo en **Route 53 → Hosted zone arianedevs.com → Create record → tipo TXT**, nombre vacío, pegando el valor. Vuelve y dale "Verificar". Puede tardar unos minutos.
4. **Sitemaps** → agrega `https://canchas.arianedevs.com/sitemap-index.xml`.
5. **Inspección de URLs** → pega cada una de estas y dale **"Solicitar indexación"**:
   - `https://canchas.arianedevs.com/`
   - `https://canchas.arianedevs.com/canchas/`
   - `https://canchas.arianedevs.com/canchas/futbox/`
   - `https://canchas.arianedevs.com/canchas/parque-el-oso/`
   - `https://canchas.arianedevs.com/guias/precio-alquiler-cancha-sintetica-pereira/`

## Paso 2 · Bing Webmaster Tools (5 min) — HOY

1. Entra a https://www.bing.com/webmasters → **Importar desde Google Search Console** (lo verifica solo).
2. Después de cada despliegue, ejecuta en tu PC: `npm run indexnow`.

> Bing es el buscador que usan **ChatGPT Search** y **Copilot**. Estar bien en Bing = aparecer en las respuestas de ChatGPT.

## Paso 3 · Google Business Profile por club (lo que más pesa) — ESTA SEMANA

Cada club debe tener su ficha en https://business.google.com. **Lo ideal es que la cree el dueño del club** (es su negocio y su dirección); si ya existe, que la reclame.

En cada ficha:

| Campo | Qué poner |
|---|---|
| Nombre | El nombre real del club, **sin agregar palabras clave** (Google suspende las fichas por eso) |
| Categoría principal | **Complejo deportivo** (o "Cancha de fútbol") |
| Categorías extra | Campo de fútbol, Instalación deportiva |
| Sitio web | `https://canchas.arianedevs.com/canchas/{slug}/`, ej. `.../canchas/futbox/` |
| Enlace de reservas | `https://cancha.arianedevs.com/c/{slug}?utm_source=google&utm_medium=gbp` |
| Horario | El mismo que está en la app (deben coincidir) |
| Fotos | **Mínimo 10**: la cancha de día y de noche, la entrada, los camerinos y la fachada |
| Descripción | Qué canchas tiene, formatos, iluminación y que se reserva en línea |

**Lo que más sube la ficha en el mapa: las reseñas.** Pídanle a cada grupo que juega que deje una reseña. Por ejemplo, el club puede tener un QR en la cancha y mandar el enlace de reseña por WhatsApp después del partido. Respondan siempre las reseñas.

## Paso 4 · Fotos reales en la landing — ESTA SEMANA

Ponlas en `src/assets/clubes/{slug}/` (instrucciones en `src/assets/clubes/LEEME.md`) y vuelve a desplegar. Las fotos:
- Mejoran cuántos hacen clic en el resultado.
- Hacen aparecer el sitio en Google Imágenes.
- Llenan el campo `image` de los datos estructurados de cada club.

Nombra los archivos así: `futbox-cancha-sintetica-pereira-noche.jpg`.

## Paso 5 · Enlaces desde otros sitios — ESTE MES

Google confía más en un sitio cuando otros sitios lo enlazan. Por orden de facilidad:

1. **Instagram, Facebook y TikTok** de Canchariane y de cada club, con el enlace a la landing en la bio.
2. Que **cada club ponga el enlace** `canchas.arianedevs.com/canchas/{slug}/` en su Instagram y su WhatsApp Business.
3. **Directorios:** Páginas Amarillas Colombia, Foursquare, Apple Maps (Apple Business Connect) y Bing Places (se importa desde Google Business).
4. **Medios locales:** una nota en El Diario (Pereira) o Risaralda Hoy sobre "reservar canchas en línea en Pereira".
5. **Ligas y torneos amateur** de Pereira: ofrecerles reservas para sus fechas, a cambio de un enlace en su página.

## Paso 6 · En el servidor (2 min)

En el bloque `server { listen 443 ... }` del archivo `/etc/nginx/sites-available/canchas.arianedevs.com` (el que creó certbot), agrega:

```nginx
add_header Strict-Transport-Security "max-age=31536000" always;
```

Luego `sudo nginx -t && sudo systemctl reload nginx`.

## Paso 7 · Que la app no compita con la landing (opcional, 1 línea en el otro repo)

Hoy `cancha.arianedevs.com` tiene el mismo título que la landing ("Alquilar Canchas Sintéticas en Pereira") y compite con ella. Lo ideal es poner en el `index.html` de la app:

```html
<meta name="robots" content="noindex">
```

y quitar su `sitemap.xml`. La app sigue funcionando igual; solo deja de pelear en Google con la landing.

---

## Cómo medir (desde la semana 2)

- **Search Console → Rendimiento:** impresiones y clics para "canchas sintéticas pereira", "alquiler cancha pereira" y "futbol 5 pereira". Lo esperable es ver impresiones en 1 a 3 semanas y primeras posiciones en 1 a 3 meses.
- **Google Business Profile → Rendimiento:** vistas en el mapa, llamadas y clics en "Reservar".
- **GA4** (si configuran `PUBLIC_GA4_ID`): el evento `click_reservar` indica cuántas personas pasaron de la landing a la app.

## Contenido nuevo (cada mes)

Una guía nueva al mes mantiene el sitio vivo. Ideas con búsquedas reales:

- "Torneos de fútbol amateur en Pereira {año}" (si organizan o conocen alguno)
- "Canchas sintéticas para empresas en Pereira" (integraciones corporativas)
- "Fútbol 5 de noche en Pereira: canchas con iluminación"
- Cuando haya clubes en **Dosquebradas** o **Santa Rosa de Cabal**, la página por ciudad se genera sola.

Para agregar una guía: añádela en `src/lib/guides.ts` y crea su página en `src/pages/guias/`.
