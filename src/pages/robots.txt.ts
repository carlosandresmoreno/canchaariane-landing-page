import type { APIRoute } from 'astro';

// Permitimos explícitamente a buscadores y rastreadores de IA (ChatGPT, Claude, Perplexity, Gemini…).
const AI_BOTS = [
  'Googlebot', 'Bingbot', 'Google-Extended', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User',
  'Applebot', 'Applebot-Extended', 'DuckDuckBot', 'CCBot', 'meta-externalagent',
];

export const GET: APIRoute = ({ site }) => {
  const body = [
    ...AI_BOTS.map((b) => `User-agent: ${b}\nAllow: /\n`),
    'User-agent: *\nAllow: /\n',
    `Sitemap: ${new URL('sitemap-index.xml', site)}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
