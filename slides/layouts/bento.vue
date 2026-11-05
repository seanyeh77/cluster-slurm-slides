<script setup>
defineProps({ chapter: String, big: Boolean })
</script>

<template>
  <div class="slidev-layout bento" :class="{ big }">
    <div class="tb-chap">{{ chapter }}</div>
    <div class="bento-grid"><slot /></div>
  </div>
</template>
