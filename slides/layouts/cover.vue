<script setup>
defineProps({ number: [String, Number], subtitle: String })
</script>

<template>
  <div class="slidev-layout tb-cover">
    <div v-if="number !== undefined" class="tb-cover-num">{{ number }}</div>
    <slot />
    <div v-if="subtitle" class="tb-cover-sub">{{ subtitle }}</div>
  </div>
</template>
