# Fotos de clubes

Crea una carpeta con el **slug** del club (el mismo de la URL) y pon ahí las fotos:

```
src/assets/clubes/futbox/01-futbox-cancha-sintetica-pereira.jpg   ← portada (la primera en orden)
src/assets/clubes/futbox/02-futbox-iluminacion-nocturna.jpg
src/assets/clubes/parque-el-oso/01-parque-el-oso-cancha-futbol-5.jpg
```

- Formatos: jpg, png, webp o avif. Tamaño ideal: unos 2000 px de ancho. Astro las optimiza solo.
- El nombre del archivo se usa como texto alternativo (alt): sin el número inicial y con los guiones convertidos en espacios.
  Usa palabras descriptivas porque ayudan al SEO en Google Imágenes.
- Se muestran hasta 5 fotos en la galería del club. La primera es la portada de la tarjeta.
- Después: `docker compose up -d --build` en el servidor.

Foto de la home: ponla en `src/assets/hero/` (una sola; reemplaza la ilustración de la cancha).
