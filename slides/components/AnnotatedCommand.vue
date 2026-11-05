<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// parts: [{ t: 'token', label?: 'what it means', h?: line length in px }]
// Each click underlines the next labelled token and drops its label below.
const props = defineProps({ parts: { type: Array, required: true }, size: { type: Number, default: 36 } })
const { $clicks } = useSlideContext()
const shown = computed(() => {
  let k = 0
  return props.parts.map((p) => (p.label ? ++k <= $clicks.value : false))
})
const cls = (t, i) => (i === 0 ? 't-cmd' : t.startsWith('-') ? 't-opt' : 't-arg')
</script>

<template>
  <div class="ann">
    <div class="ann-line" :style="{ fontSize: size + 'px' }">
      <template v-for="(p, i) in parts" :key="i">
        <span v-if="p.label" class="ann-tok" :class="{ on: shown[i] }">
          <span :class="cls(p.t, i)">{{ p.t }}</span>
          <span class="ann-lab" :style="{ '--h': (p.h ?? 40) + 'px' }"><i /><span>{{ p.label }}</span></span>
        </span>
        <span v-else :class="cls(p.t, i)">{{ p.t }}</span>
        <span v-if="i < parts.length - 1">&nbsp;</span>
      </template>
    </div>
  </div>
</template>
