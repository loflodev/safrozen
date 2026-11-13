/*
 * axe (WCAG 2.2 AA + best practices) on every page at 1440 and 390, after a
 * scroll so entrances settle, plus the states a page load misses (mobile menu,
 * mini-cart, checkout errors, sign-up, FAQ open) and keyboard checks (mini-cart
 * focus trap and Escape, Tab order, skip link). JSON on stdout.
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { CHROME, H, PAGES } from './pages.mjs';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const browser = await chromium.launch({ executablePath: CHROME, args: ['--ignore-certificate-errors'] });
const res = [];
async function audit(page, label) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  res.push({ label, violations: r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length,
    nodes: v.nodes.slice(0, 4).map(n => ({ t: n.target.join(' '), s: n.failureSummary?.split('\n').slice(0, 2).join(' | ').slice(0, 220) })) })) });
}
async function ctx(w, h, mobile) { return browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile }); }
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
  const c = await ctx(w, h, mob); const page = await c.newPage();
  for (const p of PAGES) {
    if (p === '/commande/') continue;
    await page.goto(H + p, { waitUntil: 'networkidle' });
    // scroll through so reveal-on-scroll content is in its final state
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(1200);
    await audit(page, `${w} ${p}`);
  }
  // states
  await page.goto(H + '/', { waitUntil: 'networkidle' });
  if (mob) { await page.click('.nav__toggle'); await page.waitForTimeout(500); await audit(page, `${w} STATE mobile menu open`); await page.keyboard.press('Escape'); }
  await page.goto(H + '/?add-to-cart=23', { waitUntil: 'networkidle' });
  await page.goto(H + '/', { waitUntil: 'networkidle' });
  await page.click('[data-cart-open]'); await page.waitForTimeout(700); await audit(page, `${w} STATE mini-cart open`);
  // focus trap check in mini-cart
  const trap = []; for (let i = 0; i < 25; i++) { await page.keyboard.press('Tab'); trap.push(await page.evaluate(() => !!document.activeElement?.closest('dialog'))); }
  res.push({ label: `${w} KEY mini-cart focus stays inside`, value: trap.every(Boolean) });
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  res.push({ label: `${w} KEY mini-cart closes on Escape`, value: await page.evaluate(() => !document.querySelector('dialog[open]')) });
  await page.goto(H + '/commande/', { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
  await audit(page, `${w} /commande/ (with item)`);
  const next = page.locator('[data-step-actions] button:visible').last(); // Continuer (Retour comes first)
  if (await next.count()) { await next.click(); await page.waitForTimeout(800); await audit(page, `${w} STATE checkout validation errors`); }
  await page.goto(H + '/mon-compte/', { waitUntil: 'networkidle' });
  const sw = page.locator('a[href="#inscription"]').first(); if (await sw.count()) { await sw.click(); await page.waitForTimeout(900); await audit(page, `${w} STATE sign-up pane`); }
  await page.goto(H + '/faq/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true)); await audit(page, `${w} STATE faq all open`);
  // keyboard: first tab stops + focus outline
  if (!mob) {
    await page.goto(H + '/boutique/', { waitUntil: 'networkidle' });
    const stops = [];
    for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); stops.push(await page.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return `${e.tagName}.${(e.className || '').toString().split(' ')[0]} "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30)}" outline=${s.outlineStyle}/${s.outlineWidth}`; })); }
    res.push({ label: 'KEY tab order /boutique/', value: stops });
    res.push({ label: 'KEY skip link present', value: await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].slice(0, 3).map(a => a.textContent.trim() + '→' + a.getAttribute('href'))) });
  }
  await c.close();
}
await browser.close();
console.log(JSON.stringify(res, null, 1));
