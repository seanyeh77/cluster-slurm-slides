<script setup>
defineProps({ chapter: String, cols: { type: Number, default: 1 } })
</script>

<template>
  <div class="slidev-layout tb-ref">
    <div class="tb-chap">{{ chapter }}</div>
    <div class="ref-grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }"><slot /></div>
  </div>
</template>
