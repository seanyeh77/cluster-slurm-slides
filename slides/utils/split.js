import { Comment, Fragment, h } from 'vue'

// Slidev passes a slide's markdown as one default slot. The Textbook layouts
// place the h1 separately from the rest, so split the vnodes here.
function flatten(nodes) {
  return nodes.flatMap((n) => {
    if (n.type === Comment) return []
    if (n.type === Fragment && Array.isArray(n.children)) return flatten(n.children)
    return [n]
  })
}

export function splitTitle(nodes = []) {
  const all = flatten(nodes)
  const i = all.findIndex((n) => n.type === 'h1')
  return {
    title: i >= 0 ? [all[i]] : [],
    rest: all.filter((_, k) => k !== i),
  }
}

// Render an array of vnodes in a template: <R :n="nodes" />
export const R = (props) => h(Fragment, null, props.n)
R.props = ['n']
