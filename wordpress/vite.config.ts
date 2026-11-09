import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Builds the theme's CSS and JS into safrozen/build/. The PHP side reads
// build/.vite/manifest.json (inc/assets.php) to register each entry.
const here = import.meta.dirname

// Blocks with their own script; the others ship a stylesheet only.
const SCRIPT_BLOCKS = ['hero', 'benefits', 'partners']
const STYLE_BLOCKS = ['story', 'featured', 'recipes', 'testimonials', 'newsletter']

export default defineConfig({
  root: resolve(here, 'src'),
  base: './',
  publicDir: false,
  build: {
    outDir: resolve(here, 'safrozen/build'),
    emptyOutDir: true,
    manifest: true,
    assetsInlineLimit: 0,
    target: 'es2022',
    rolldownOptions: {
      input: {
        main: resolve(here, 'src/js/main.ts'),
        editor: resolve(here, 'src/css/editor.css'),
        shop: resolve(here, 'src/css/shop.css'),
        info: resolve(here, 'src/js/info.ts'),
        contact: resolve(here, 'src/css/contact.css'),
        'recipes-page': resolve(here, 'src/css/recipes-page.css'),
        locator: resolve(here, 'src/js/locator.ts'),
        account: resolve(here, 'src/js/account.ts'),
        product: resolve(here, 'src/js/product.ts'),
        checkout: resolve(here, 'src/js/checkout.ts'),
        ...Object.fromEntries(SCRIPT_BLOCKS.map((b) => [b, resolve(here, `src/js/blocks/${b}.ts`)])),
        ...Object.fromEntries(STYLE_BLOCKS.map((b) => [b, resolve(here, `src/css/blocks/${b}.css`)])),
      },
    },
  },
})
