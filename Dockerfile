# ---------- Etapa 1: build estático con Astro ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Variables públicas que se "hornean" en el HTML (ver .env.example)
ARG PUBLIC_APP_URL=https://cancha.arianedevs.com
ARG PUBLIC_API_URL=https://cancha.arianedevs.com/api/v1
ARG PUBLIC_WHATSAPP=
ARG PUBLIC_GA4_ID=
ARG HIDDEN_CLUBS=
ENV PUBLIC_APP_URL=$PUBLIC_APP_URL \
    PUBLIC_API_URL=$PUBLIC_API_URL \
    PUBLIC_WHATSAPP=$PUBLIC_WHATSAPP \
    PUBLIC_GA4_ID=$PUBLIC_GA4_ID \
    HIDDEN_CLUBS=$HIDDEN_CLUBS \
    ASTRO_TELEMETRY_DISABLED=1

RUN npm run build

# ---------- Etapa 2: servir HTML con nginx (≈20 MB) ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
