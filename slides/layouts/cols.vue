<script setup>
import { useSlideContext } from '@slidev/client'

defineProps({ chapter: String, near: Boolean, cards: Array, reveal: Boolean })
const { $clicks } = useSlideContext()
</script>

<template>
  <div class="slidev-layout tb-cols" :class="{ near }">
    <div class="tb-chap">{{ chapter }}</div>
    <slot v-if="!near" />
    <div class="tb-center">
      <div class="tb-group">
        <div v-if="near" class="tb-title"><slot /></div>
        <div class="cols-grid" :style="{ gridTemplateColumns: `repeat(${cards.length}, 1fr)` }">
          <div v-for="(c, i) in cards" :key="i" class="col-card" :class="{ off: reveal && $clicks <= i }">
            <div class="col-label">{{ c.label }}</div>
            <div class="col-title" :class="{ mono: c.code }">{{ c.title }}</div>
            <div class="col-text" v-html="c.text" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
