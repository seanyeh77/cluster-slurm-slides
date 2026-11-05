<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useIsSlideActive, useNav, useSlideContext } from '@slidev/client'
import { esc, hlShell } from '../utils/hl.js'

// cmds: [{ c: 'command', o: 'output html' }]. Each click types the next command.
// keep: how many finished commands stay above the one being typed.
// all: show every command at once, no typing (for checkpoint slides).
// dir: working directory shown in the title bar. A command may set its own
// dir (where it runs) and to (where it leaves you, for cd).
const props = defineProps({
  cmds: { type: Array, required: true },
  keep: { type: Number, default: 2 },
  prompt: { type: String, default: '$ ' },
  start: { type: Number, default: 0 },
  all: Boolean,
  big: Boolean,
  dir: { type: String, default: '' },
})
const { $clicks } = useSlideContext()
const active = useIsSlideActive()
const html = ref('')
const title = ref('')
// Directory at step i: the latest dir or to set at or before command i.
function dirAt(i, done) {
  let d = props.dir
  for (let k = 0; k <= i && k < props.cmds.length; k++) {
    const x = props.cmds[k]
    if (x.dir) d = x.dir
    if (x.to && (k < i || done)) d = x.to
  }
  return d
}
let run = 0
const reduced = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms))
const caret = '<span class="caret"></span>'
// Each command may carry its own prompt (p), e.g. inside a container.
const pOf = (i) => props.cmds[i]?.p ?? props.prompt
const pAfter = (i) => props.cmds[i]?.after ?? (props.cmds[i + 1] ? pOf(i + 1) : pOf(i))
const pr = (p) => `<span class="pr">${esc(p)}</span>`
// Finished command lines show a copy icon while the pointer is over that line,
// for students following along on their own screen. Never in presenter or
// print mode.
const { isPresenter, isPrintMode } = useNav()
const ICON_COPY = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12"/><path d="M5 15V3h12"/></svg>'
const ICON_DONE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12l5 5L20 6"/></svg>'
const copyBtn = (i) => `<button type="button" tabindex="-1" class="tcp" data-i="${i}" aria-label="Copy">${ICON_COPY}</button>`
const line = (x, i) => `<span class="cl">${pr(pOf(i))}${hlShell(x.c)[0]}${copyBtn(i)}</span>${x.o ? `<span class="out">${x.o}</span>\n` : ''}`

async function show(step, animate) {
  const id = ++run
  const nn = step + props.start
  title.value = props.all ? dirAt(props.cmds.length - 1, true) : nn === 0 ? dirAt(0, false) : dirAt(Math.min(nn, props.cmds.length) - 1, !animate)
  if (props.all) {
    html.value = props.cmds.map(line).join('') + pr(pAfter(props.cmds.length - 1)) + caret
    return
  }
  const n = step + props.start
  const from = Math.max(0, n - props.keep)
  const before = props.cmds.slice(from, Math.max(0, n - 1)).map((x, k) => line(x, from + k)).join('')
  if (n === 0) { html.value = pr(pOf(0)) + caret; return }
  const i = Math.min(n, props.cmds.length) - 1
  const cur = props.cmds[i]
  if (!animate) { html.value = before + line(cur, i) + pr(pAfter(i)) + caret; return }
  // 15 ms per character, but long commands finish within about 0.8 s.
  const len = cur.c.length
  const stepChars = Math.max(1, Math.ceil(len / 55))
  for (let k = 0; k <= len + stepChars - 1; k += stepChars) {
    if (id !== run) return
    html.value = before + pr(pOf(i)) + (hlShell(cur.c.slice(0, Math.min(k, len)))[0] || '') + caret
    await wait(15)
  }
  await wait(150)
  if (id !== run) return
  html.value = before + line(cur, i) + pr(pAfter(i)) + caret
  title.value = dirAt(i, true)
}

// Fit the longest line of any step into the box: shrink the font instead of
// letting text run past the frame. Geist Mono advances 0.6em per character.
const root = ref(null)
const size = ref(props.big ? 44 : 29)
const plain = (s) => s.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, 'x')
const longest = () => Math.max(
  ...props.cmds.map((x, i) => pOf(i).length + x.c.length + 2),
  ...props.cmds.flatMap((x) => (x.o ? plain(x.o).split('\n').map((l) => l.length) : [0])),
)
function fit() {
  const el = root.value
  if (!el) return
  const pad = props.big ? 84 : 68
  const base = props.big ? 44 : 29
  size.value = Math.min(base, Math.floor(((el.clientWidth - pad) / (longest() * 0.62)) * 10) / 10)
}
let ro = null
onMounted(() => {
  show($clicks.value, false)
  fit()
  ro = new ResizeObserver(fit)
  ro.observe(root.value)
})
onUnmounted(() => ro?.disconnect())
async function copy(e) {
  const b = e.target.closest?.('.tcp')
  if (!b) return
  e.stopPropagation()
  // Hand focus back to the slide so arrow keys and space keep navigating.
  b.blur()
  const text = props.cmds[Number(b.dataset.i)]?.c ?? ''
  try { await navigator.clipboard.writeText(text) } catch {
    const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove()
  }
  document.activeElement?.blur?.()
  window.getSelection()?.removeAllRanges()
  b.innerHTML = ICON_DONE
  b.classList.add('done')
  setTimeout(() => { b.innerHTML = ICON_COPY; b.classList.remove('done') }, 1200)
}
watch($clicks, (n, o) => show(n, active.value && n === o + 1))
</script>

<template>
  <div ref="root" class="term" :class="{ big, 'no-copy': isPresenter || isPrintMode }">
    <div class="term-bar"><i /><i /><i /><span v-if="title" class="term-dir">{{ title }}</span></div>
    <pre class="term-body" :style="{ fontSize: size + 'px' }" @mousedown="(e) => e.target.closest?.('.tcp') && e.preventDefault()" @click="copy" v-html="html" />
  </div>
</template>
