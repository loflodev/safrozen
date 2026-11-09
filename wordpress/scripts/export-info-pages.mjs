// Writes the information pages of the React app (src/shop/pages.ts) to info-pages.json,
// which import-info-pages.php turns into WordPress pages. pages.ts stays the one source
// of the text. Run: pnpm wp:pages (Node 23+ reads the TypeScript directly).
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const here = import.meta.dirname
const { INFO_PAGES } = await import(resolve(here, '../../src/shop/pages.ts'))
const out = resolve(here, 'info-pages.json')
writeFileSync(out, JSON.stringify(INFO_PAGES, null, 2) + '\n')
console.log(`written: ${out} (${INFO_PAGES.length} pages)`)
