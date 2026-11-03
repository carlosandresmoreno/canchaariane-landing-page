# Canchariane: landing SEO

Landing page de **canchas.arianedevs.com**, hecha con **Astro 7** + **Tailwind CSS 4**. Es HTML estático, pensado para:

- Aparecer en Google y en asistentes de IA (ChatGPT, Claude, Perplexity, Gemini).
- Cargar rápido en el celular.
- Llevar al usuario a la app de reservas en **cancha.arianedevs.com**.

La landing **no toca el repo de la app**. Solo **lee** la API pública (`/api/v1/clubs`) al momento del build.

```
canchas.arianedevs.com  (esta landing: SEO)
        │  botones "Reservar"
        ▼
cancha.arianedevs.com   (app Angular: el usuario busca y reserva)
```

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias (Node ≥ 22.23.4) |
| `npm run dev` | Servidor local en http://localhost:4321 |
| `npm run build` | Genera el sitio en `dist/` (lee la API en vivo) |
| `npm run preview` | Sirve `dist/` localmente |
| `npm run check` | Verificación de tipos |
| `npm run sync:clubs` | Actualiza `src/data/clubs.snapshot.json` (respaldo si la API falla) |

## Configuración (`.env`)

Copia `.env.example` a `.env`:

| Variable | Para qué |
|---|---|
| `PUBLIC_APP_URL` | URL de la app de reservas (destino de los botones) |
| `PUBLIC_API_URL` | API pública de solo lectura |
| `PUBLIC_WHATSAPP` | WhatsApp de contacto, ej. `573001234567`. **Vacío = se ocultan los botones de WhatsApp** |
| `PUBLIC_GA4_ID` | Google Analytics 4 (`G-…`). Carga diferida para no afectar la velocidad, y registra el evento `click_reservar`. **Vacío = sin analítica** |
| `HIDDEN_CLUBS` | Slugs que no deben aparecer, separados por coma (ej. clubes de prueba: `club-ariane`) |

---

## Despliegue en la EC2 (puerto interno 7010)

### Una sola vez

1. **DNS (Route 53):** crea un registro `A` para `canchas.arianedevs.com` que apunte a `100.25.87.80`.
2. **Código en el servidor:**
   ```bash
   git clone <repo-de-la-landing> ~/canchariane-landing && cd ~/canchariane-landing
   cp .env.example .env   # y edita PUBLIC_WHATSAPP / HIDDEN_CLUBS
   docker compose up -d --build
   curl -I http://127.0.0.1:7010/   # debe responder 200
   ```
3. **nginx del servidor:**
   ```bash
   sudo cp deploy/nginx-canchas.arianedevs.com.conf /etc/nginx/sites-available/canchas.arianedevs.com
   sudo ln -s /etc/nginx/sites-available/canchas.arianedevs.com /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d canchas.arianedevs.com
   ```

> El contenedor escucha en `127.0.0.1:7010`, que **solo es accesible desde el propio servidor**. **No abras el 7010 en el Security Group.** Si quedara abierto, Google podría indexar `IP:7010` como una copia duplicada de la landing.

### Cada vez que se cree o edite un club (build manual)

```bash
cd ~/canchariane-landing && git pull && docker compose up -d --build
```

El build vuelve a leer la API, regenera las páginas de los clubes, el sitemap y `llms.txt`, y reemplaza el contenedor.

> **EC2 pequeña (1 GB de RAM):** si el build se queda sin memoria, agrega 2 GB de swap
> (`sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`).

---

## Fotos (sin tocar código)

| Dónde | Efecto |
|---|---|
| `src/assets/clubes/{slug}/*.jpg` | Portada de la tarjeta del club, galería en su página (hasta 5) y fotos en su schema para Google Imágenes |
| `src/assets/hero/*.jpg` | Reemplaza la ilustración del hero en la home |

- Astro las convierte a AVIF/WebP y genera varios tamaños.
- El nombre del archivo se usa como texto `alt`, así que conviene que sea descriptivo. Instrucciones en [src/assets/clubes/LEEME.md](src/assets/clubes/LEEME.md).
- Después de agregar fotos, haz `git push` y en el servidor `git pull && docker compose up -d --build`.

## Qué se genera

| Ruta | Contenido |
|---|---|
| `/` | Home: hero, cómo funciona, bento, clubes, para clubes, preguntas frecuentes |
| `/canchas/` | Listado de todos los clubes |
| `/canchas/{slug}/` | **Una página por club**, generada automáticamente desde la API |
| `/canchas-sinteticas/{ciudad}/` | Se genera sola cuando hay **2 o más ciudades** y la ciudad tiene **3 o más clubes** (evita duplicados) |
| `/preguntas-frecuentes/` | Preguntas frecuentes completas |
| `/para-clubes/` | Captación de nuevos clubes (B2B) |
| `/sitemap-index.xml`, `/robots.txt`, `/llms.txt` | SEO e IA (permite explícitamente GPTBot, ClaudeBot, PerplexityBot…) |
| `/og/*.png` | Imágenes para vistas previas en WhatsApp/Facebook/X, una por página |

**SEO en cada página:**
- Un solo `<h1>` y jerarquía `h2`/`h3`.
- `title` de 60 caracteres o menos y meta descripción.
- `canonical`, Open Graph y Twitter Card.
- JSON-LD: `Organization`, `WebSite`, `WebPage` y `BreadcrumbList`, más `SportsActivityLocation` (con horario, coordenadas y precio) en cada club, `ItemList` en los listados y `FAQPage` donde hay preguntas visibles.

**Contenedor probado:** 200 en todas las rutas, 404 propia, `/canchas` → 301 a `/canchas/` (redirección relativa, sin exponer el puerto), gzip, caché de 1 año en `/_astro/` y puerto publicado solo en `127.0.0.1:7010`.

**Resultados de Lighthouse en móvil (local):** rendimiento 98–99 · accesibilidad 100 · buenas prácticas 100 · SEO 100 · CLS 0.

---

## Checklist después de publicar

1. **Google Search Console:** verifica la propiedad de dominio `arianedevs.com` (registro TXT en Route 53) y envía `https://canchas.arianedevs.com/sitemap-index.xml`.
2. **Bing Webmaster Tools:** importa desde Search Console. Bing alimenta a ChatGPT Search y a Copilot.
3. **Google Business Profile para cada club,** con el sitio web apuntando a `https://canchas.arianedevs.com/canchas/{slug}/`. Es lo que hace aparecer los clubes en el mapa de "canchas cerca de mí".
4. Valida con el [Rich Results Test](https://search.google.com/test/rich-results) y con [opengraph.xyz](https://www.opengraph.xyz/).
5. **Recomendado (1 línea en la app):** que la app Angular deje de competir con la landing por las mismas búsquedas. En su `index.html`, `<meta name="robots" content="noindex">`, y quita su `sitemap.xml`.

## Datos a corregir en el admin de la app

La landing muestra lo que hay en la API. Datos detectados el 3/11/2026:

- **`club-ariane`:** la dirección "hamburgo manzana n" y el teléfono `300232131` (9 dígitos) parecen de prueba. Corrígelos o ocúltalo con `HIDDEN_CLUBS=club-ariane`.
- **`parque-el-oso`:** el teléfono `+573333333333` es de prueba. La landing lo descarta automáticamente y no lo publica.
- **Ningún club tiene `logo_url` ni fotos.** Las fotos reales son la mejora visual y de SEO más importante pendiente.

## Estructura

```
src/
├── lib/
│   ├── config.ts      # URLs, WhatsApp, UTM, utilidades
│   ├── clubs.ts       # lectura de la API + normalización + respaldo (snapshot)
│   ├── schema.ts      # JSON-LD schema.org
│   ├── faqs.ts        # preguntas frecuentes (basadas en cómo funciona la app de verdad)
│   └── og.ts          # generador de imágenes Open Graph (satori + sharp)
├── layouts/BaseLayout.astro   # <head> SEO completo
├── components/        # Header, Footer, ClubCard, Marquee, FaqList, MobileCta…
├── pages/             # rutas (ver tabla)
└── styles/global.css  # sistema de diseño (tokens, tipografía, botones)
```

**Diseño:**
- Fondo blanco, azul eléctrico `#0056FB` (marca) y verde cancha `#00E575` (el balón del logo), con tinta `#0B1220`.
- Títulos en **Archivo** ancha 900 en mayúsculas; texto en **Plus Jakarta Sans**. Las dos fuentes van alojadas en el propio servidor.
- La animación se desactiva sola si el usuario tiene activado `prefers-reduced-motion`.

> `npm audit` reporta una vulnerabilidad moderada en `fflate`, dependencia de `satori`. Solo se usa **en el build** para dibujar las imágenes OG con datos propios. No llega al sitio publicado.
