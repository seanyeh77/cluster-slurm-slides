import { defineAppSetup } from '@slidev/types'

// Use the "teaching" preset of seanyeh77/ui-design-system (styles/tokens.css).
export default defineAppSetup(() => {
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', 'teaching')
})
