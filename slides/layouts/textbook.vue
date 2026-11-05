<script setup>
import { useSlots } from 'vue'
import { R, splitTitle } from '../utils/split.js'

defineProps({
  chapter: String,
  noteLabel: { type: String, default: 'NOTE' },
  // near: the title sits right above the content instead of top-left
  near: Boolean,
})
const slots = useSlots()
const parts = () => splitTitle(slots.default?.())
</script>

<template>
  <div class="slidev-layout textbook" :class="{ 'has-note': !!$slots.note, near }">
    <div class="tb-chap">{{ chapter }}</div>
    <div v-if="!near" class="tb-head"><R :n="parts().title" /></div>
    <div class="tb-main">
      <div v-if="near" class="tb-group">
        <div class="tb-head"><R :n="parts().title" /></div>
        <R :n="parts().rest" />
      </div>
      <R v-else :n="parts().rest" />
    </div>
    <aside v-if="$slots.note" class="tb-note">
      <div class="tb-note-label">{{ noteLabel }}</div>
      <slot name="note" />
    </aside>
  </div>
</template>
