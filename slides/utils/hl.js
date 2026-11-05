export const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])

const span = (cls, t) => `<span class="t-${cls}">${esc(t)}</span>`

// Shell commands: first word is the command, --flags and -f are options,
// values after = are values, # starts a comment.
export function hlShell(src) {
  return src.split('\n').map((line) => {
    let out = ''
    let first = true
    let afterEq = false
    const re = /(#[^\n]*)|(--?[\w-]+)|(=)|("[^"]*"|'[^']*')|([^\s=]+)|(\s+)/g
    let m
    while ((m = re.exec(line))) {
      const t = m[0]
      if (m[6]) { out += t; continue }
      let cls
      if (m[1]) cls = 'cmt'
      else if (m[2]) cls = 'opt'
      else if (m[3]) cls = 'eq'
      else if (afterEq) cls = 'val'
      else if (m[4]) cls = 'val'
      else cls = first ? 'cmd' : 'arg'
      out += span(cls, t)
      afterEq = !!m[3]
      first = false
    }
    return out
  })
}

// Dockerfile: instruction keyword in teal, the rest as arguments.
export function hlDockerfile(src) {
  return src.split('\n').map((line) => {
    const m = line.match(/^(\s*)([A-Z]+)(\s+)(.*)$/)
    if (!m) return line.startsWith('#') ? span('cmt', line) : esc(line)
    return m[1] + span('dir', m[2]) + m[3] + span('arg', m[4])
  })
}

// YAML: keys in orange, values in blue, list dashes muted.
export function hlYaml(src) {
  return src.split('\n').map((line) => {
    const m = line.match(/^(\s*)(- )?([\w.-]+)(:)(\s*)(.*)$/)
    if (m) {
      return m[1] + (m[2] ? span('eq', m[2]) : '') + span('key', m[3]) + span('eq', m[4]) + m[5] + (m[6] ? span('val', m[6]) : '')
    }
    const l = line.match(/^(\s*)(- )(.*)$/)
    if (l) return l[1] + span('eq', l[2]) + span('val', l[3])
    return esc(line)
  })
}

export function hl(src, lang = 'shell') {
  if (lang === 'dockerfile') return hlDockerfile(src)
  if (lang === 'yaml') return hlYaml(src)
  return hlShell(src)
}
