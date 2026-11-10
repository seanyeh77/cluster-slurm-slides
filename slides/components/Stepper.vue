<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// Step-by-step diagram frame. Click n shows step n + 1.
// The slot receives { s } (1-based current step) so the SVG can fade parts in.
// steps: total steps; captions: one line per step; width: SVG width in px.
const props = defineProps({
  steps: { type: Number, default: 1 },
  captions: { type: Array, default: () => [] },
  width: { type: Number, default: 1400 },
})
const { $clicks } = useSlideContext()
const s = computed(() => Math.min($clicks.value, props.steps - 1) + 1)
const caption = computed(() => props.captions[s.value - 1] ?? '')
</script>

<template>
  <div class="sd" :style="{ width: Math.max(width, 1400) + 'px', '--svg-w': width + 'px' }">
    <slot :s="s" />
    <div v-if="steps > 1 || captions.length" class="sd-foot">
      <p class="sd-cap">{{ caption }}</p>
      <span v-if="steps > 1" class="sd-count">Step {{ s }} of {{ steps }}</span>
    </div>
  </div>
</template>
