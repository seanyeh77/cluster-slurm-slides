<script setup>
defineProps({ chapter: String, next: String, nextNumber: [String, Number] })
</script>

<template>
  <div class="slidev-layout tb-end">
    <div class="tb-chap">{{ chapter }}</div>
    <div class="end-body"><slot /></div>
    <div v-if="next" class="end-next">
      <span class="end-lab">NEXT</span>
      <span class="end-num">{{ nextNumber }}</span>
      <span class="end-t">{{ next }}</span>
    </div>
  </div>
</template>
