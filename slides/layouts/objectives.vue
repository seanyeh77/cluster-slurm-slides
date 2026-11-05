<script setup>
defineProps({ chapter: String })
</script>

<template>
  <div class="slidev-layout tb-obj">
    <div class="tb-chap">{{ chapter }}</div>
    <slot />
  </div>
</template>
