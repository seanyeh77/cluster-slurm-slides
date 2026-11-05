// Refresh styles/tokens.css from the published design system.
// The deck uses its "teaching" preset (data-theme="teaching", set in setup/main.ts).
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const url = 'https://seanyeh77.github.io/ui-design-system/dist/tokens.css'
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'styles', 'tokens.css')
const res = await fetch(url)
if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
const css = await res.text()
if (!css.includes('[data-theme="teaching"]')) throw new Error('tokens.css has no teaching preset')
writeFileSync(out, css)
console.log('styles/tokens.css updated from', url)
