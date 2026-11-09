// Writes the store list of the React app (src/shop/stores.ts) to stores.json,
// which import-stores.php turns into "Points de vente" posts. stores.ts stays the
// one source of the list. Run: pnpm wp:stores (Node 23+ reads the TypeScript directly).
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const here = import.meta.dirname
const { STORES } = await import(resolve(here, '../../src/shop/stores.ts'))
const out = resolve(here, 'stores.json')
writeFileSync(out, JSON.stringify(STORES, null, 2) + '\n')
console.log(`written: ${out} (${STORES.length} stores)`)
