// Build both decks and the landing page into dist/:
//   dist/            site/ (index.html, commands.html, slides.json)
//   dist/intro/      intro.md  Introduction to Cluster
//   dist/build/      build.md  Building and Installing Slurm
// BASE is the URL path the site is served from, for example
// /cluster-slurm-slides/ on GitHub Pages; it defaults to ./ for a local preview.
import { execFileSync } from 'node:child_process'
import { cpSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = process.env.BASE || './'
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit' })

rmSync(join(root, 'dist'), { recursive: true, force: true })
run('node', ['scripts/pin-tokens.mjs'])
run('node', ['scripts/gen-commands.mjs'])
for (const deck of ['intro', 'build']) {
  const deckBase = base === './' ? './' : `${base}${deck}/`
  run('npx', ['slidev', 'build', `${deck}.md`, '--base', deckBase, '--out', `dist/${deck}`])
}
cpSync(join(root, 'site'), join(root, 'dist'), { recursive: true })
console.log('dist/ ready')
