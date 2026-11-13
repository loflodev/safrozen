/*
 * The site and pages every audit script walks. AUDIT_URL points them at
 * another host (AUDIT_URL=https://safrozen.com node seo.mjs); CHROME_PATH at a
 * Chromium other than Playwright's own (Local's self-signed certificate is
 * accepted either way).
 */
export const H = (process.env.AUDIT_URL ?? 'https://safrozen.local').replace(/\/$/, '');
export const CHROME = process.env.CHROME_PATH || undefined;
export const PAGES = ['/', '/boutique/', '/produit/legim-au-lalo/', '/produit/pack-decouverte/', '/panier/', '/commande/',
 '/mon-compte/', '/suivi/', '/recettes/', '/recettes/mijote-de-lalo-aux-crevettes/', '/contact/', '/points-de-vente/',
 '/notre-histoire/', '/faq/', '/cgv/', '/confidentialite/', '/categorie/au-lalo/', '/page-inexistante-404/'];
