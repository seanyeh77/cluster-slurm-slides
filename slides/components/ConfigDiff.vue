<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { hl } from '../utils/hl.js'

// rows: [['' | 'del' | 'add', 'line']]. Click 1 marks removed lines red and
// shows added lines green; click 2 settles on the final version.
const props = defineProps({ file: String, rows: { type: Array, required: true }, lang: { type: String, default: 'yaml' } })
const { $clicks } = useSlideContext()
const step = computed(() => Math.min($clicks.value, 2))
const lines = computed(() => props.rows.map(([k, t]) => [k, hl(t, props.lang)[0]]))
</script>

<template>
  <div class="diff-wrap">
    <div v-if="file" class="diff-file">{{ file }}</div>
    <pre class="diff" :class="'s' + step"><span v-for="([k, t], i) in lines" :key="i" class="ln" :class="k"><span class="sg">{{ step === 1 ? (k === 'del' ? '-' : k === 'add' ? '+' : ' ') : ' ' }}</span><span v-html="t || ' '" /></span></pre>
  </div>
</template>
