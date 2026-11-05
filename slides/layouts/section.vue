<script setup>
defineProps({ number: [String, Number], chapter: String })
</script>

<template>
  <div class="slidev-layout tb-section">
    <div class="tb-chap">{{ chapter }}</div>
    <div class="sec-num">{{ number }}</div>
    <div class="sec-body"><slot /></div>
  </div>
</template>
