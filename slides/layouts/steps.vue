<script setup>
import { useSlideContext } from '@slidev/client'

defineProps({ chapter: String, near: Boolean, steps: Array })
const { $clicks } = useSlideContext()
</script>

<template>
  <div class="slidev-layout tb-steps" :class="{ near }">
    <div class="tb-chap">{{ chapter }}</div>
    <slot v-if="!near" />
    <div class="tb-center">
      <div class="tb-group">
        <div v-if="near" class="tb-title"><slot /></div>
        <div class="steps-row" :style="{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }">
          <div v-for="(s, i) in steps" :key="i" class="step" :class="{ off: $clicks < i, cur: $clicks === i }">
            <div class="step-n">{{ i + 1 }}</div>
            <div class="step-title">{{ s.title }}</div>
            <code v-if="s.code" class="step-code">{{ s.code }}</code>
            <div class="step-text">{{ s.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
