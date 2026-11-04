// Notifica a Bing / Yandex / Seznam (protocolo IndexNow) todas las URLs del sitemap publicado.
// Bing alimenta ChatGPT Search y Copilot. Ejecutar DESPUÉS de cada despliegue:  npm run indexnow
const HOST = 'canchas.arianedevs.com';
const KEY = '524b4a78192c834d493e11e39d8a87c8'; // debe existir en https://canchas.arianedevs.com/524b4a78192c834d493e11e39d8a87c8.txt (public/524b4a78192c834d493e11e39d8a87c8.txt)

const xml = async (u) => (await fetch(u)).text();
const locs = (s) => [...s.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const index = await xml(`https://${HOST}/sitemap-index.xml`);
const urls = (await Promise.all(locs(index).map(async (sm) => locs(await xml(sm))))).flat();

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} — ${urls.length} URLs enviadas`);
if (res.status >= 400) console.log(await res.text());
