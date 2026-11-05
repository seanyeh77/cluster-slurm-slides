<script setup>
import { useSlots } from 'vue'
import { R, splitTitle } from '../utils/split.js'

defineProps({ chapter: String, near: Boolean, takeaway: String })
const slots = useSlots()
const parts = () => splitTitle(slots.default?.())
</script>

<template>
  <div class="slidev-layout tb-figure" :class="{ near }">
    <div class="tb-chap">{{ chapter }}</div>
    <R v-if="!near" :n="parts().title" />
    <div class="tb-center">
      <div class="tb-group">
        <div v-if="near" class="tb-title"><R :n="parts().title" /></div>
        <div class="fig-body"><R :n="parts().rest" /></div>
        <div v-if="takeaway" class="fig-take">{{ takeaway }}</div>
      </div>
    </div>
  </div>
</template>
