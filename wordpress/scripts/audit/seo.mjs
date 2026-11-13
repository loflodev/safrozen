/*
 * What a crawler sees without JS (fetched as GPTBot): title, description, robots,
 * canonical, headings, alt, Open Graph, Twitter, JSON-LD types, main text; then
 * robots.txt, sitemaps, llms.txt, AI user-agents and redirects. JSON on stdout.
 */
import * as cheerio from 'cheerio';
import { imageSize } from 'image-size';
import { H, PAGES } from './pages.mjs';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const out = { pages: [], site: {} };
for (const p of PAGES) {
  const r = await fetch(H + p, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (compatible; GPTBot/1.2)' } });
  const html = await r.text(); const $ = cheerio.load(html);
  const m = (n) => $(`meta[name="${n}"]`).attr('content') ?? null;
  const pr = (n) => $(`meta[property="${n}"]`).attr('content') ?? null;
  const ld = []; $('script[type="application/ld+json"]').each((_, e) => { try { const j = JSON.parse($(e).text()); const g = j['@graph'] ?? [j]; g.forEach(x => ld.push(x['@type'])); } catch { ld.push('INVALID'); } });
  const imgs = $('img'); const noAlt = imgs.filter((_, e) => $(e).attr('alt') === undefined).map((_, e) => $(e).attr('src')).get();
  $('script,style,noscript,svg').remove();
  const text = $('main').text().replace(/\s+/g, ' ').trim();
  const headings = $('h1,h2,h3').map((_, e) => e.tagName + ':' + $(e).text().replace(/\s+/g, ' ').trim().slice(0, 50)).get();
  out.pages.push({ p, status: r.status, title: $('title').text(), desc: m('description'), robots: m('robots'),
    canonical: $('link[rel=canonical]').attr('href') ?? null, lang: $('html').attr('lang'),
    h1: $('h1').length, headings, imgs: imgs.length, noAlt,
    og: { title: pr('og:title'), desc: pr('og:description'), image: pr('og:image'), url: pr('og:url'), type: pr('og:type'), locale: pr('og:locale'), site: pr('og:site_name') },
    tw: m('twitter:card'), ld, mainTextNoJs: text.length, mainSample: text.slice(0, 160) });
}
// og image size
for (const pg of out.pages) if (pg.og.image) { try { const b = Buffer.from(await (await fetch(pg.og.image)).arrayBuffer()); const d = imageSize(b); pg.og.imageSize = `${d.width}x${d.height}`; } catch (e) { pg.og.imageSize = 'ERR ' + e.message; } }
// site
for (const u of ['/robots.txt', '/llms.txt', '/sitemap_index.xml', '/wp-sitemap.xml', '/favicon.ico', '/wp-sitemap-users-1.xml', '/recettes/author/admin/', '/?author=1', '/feed/', '/xmlrpc.php']) {
  const r = await fetch(H + u, { redirect: 'manual' }); out.site[u] = r.status + (r.headers.get('location') ? ' → ' + r.headers.get('location') : '');
}
for (const ua of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Googlebot', 'bingbot', 'CCBot', 'Applebot']) {
  const r = await fetch(H + '/', { headers: { 'user-agent': `Mozilla/5.0 (compatible; ${ua})` } }); out.site['UA ' + ua] = r.status;
}
for (const u of [H.replace('https:', 'http:') + '/', H + '/boutique', H + '/BOUTIQUE/']) { const r = await fetch(u, { redirect: 'manual' }); out.site['redir ' + u] = r.status + ' → ' + r.headers.get('location'); }
console.log(JSON.stringify(out, null, 1));
