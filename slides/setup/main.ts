import { defineAppSetup } from '@slidev/types'
import { applyAccent, storedAccent } from '../utils/accent'

// Use the "teaching" preset of seanyeh77/ui-design-system (styles/tokens.css),
// then the accent the viewer chose last time (ui-accent), teal by default.
export default defineAppSetup(() => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', 'teaching')
  applyAccent(storedAccent(), true)
})
