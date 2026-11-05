<script setup>
defineProps({ chapter: String })
</script>

<template>
  <div class="slidev-layout tb-statement">
    <div class="tb-chap">{{ chapter }}</div>
    <div class="st-body"><slot /></div>
  </div>
</template>
