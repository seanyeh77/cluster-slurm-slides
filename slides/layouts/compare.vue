<script setup>
import { useSlideContext } from '@slidev/client'

defineProps({ chapter: String, near: Boolean, corner: { type: String, default: '項目' }, left: String, right: String, rows: Array, reveal: Boolean })
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
          <div class="cmp-h corner">{{ corner }}</div>
          <div class="cmp-h a">{{ left }}</div>
          <div class="cmp-h b">{{ right }}</div>
          <template v-for="(r, i) in rows" :key="i">
            <div class="cmp-k" :class="{ z: i % 2 === 1 }">{{ r[0] }}</div>
            <template v-if="r.length === 2">
              <div class="cmp-v same" :class="{ off: reveal && $clicks <= i, z: i % 2 === 1 }" v-html="r[1]" />
            </template>
            <template v-else>
              <div class="cmp-v" :class="{ off: reveal && $clicks <= i, z: i % 2 === 1 }" v-html="r[1]" />
              <div class="cmp-v" :class="{ off: reveal && $clicks <= i, z: i % 2 === 1 }" v-html="r[2]" />
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
