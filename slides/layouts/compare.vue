<script setup>
import { useSlideContext } from '@slidev/client'

defineProps({ chapter: String, near: Boolean, left: String, right: String, rows: Array, reveal: Boolean })
const { $clicks } = useSlideContext()
</script>

<template>
  <div class="slidev-layout tb-compare" :class="{ near }">
    <div class="tb-chap">{{ chapter }}</div>
    <slot v-if="!near" />
    <div class="tb-center">
      <div class="tb-group">
        <div v-if="near" class="tb-title"><slot /></div>
        <div class="cmp">
          <div class="cmp-h" />
          <div class="cmp-h a">{{ left }}</div>
          <div class="cmp-h b">{{ right }}</div>
          <template v-for="(r, i) in rows" :key="i">
            <div class="cmp-k" :class="{ off: reveal && $clicks <= i }">{{ r[0] }}</div>
            <div class="cmp-v" :class="{ off: reveal && $clicks <= i }" v-html="r[1]" />
            <div class="cmp-v" :class="{ off: reveal && $clicks <= i }" v-html="r[2]" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
