<script setup>
defineProps({ label: String, value: String, variant: { type: String, default: '' }, mono: Boolean, wide: Boolean })
</script>

<template>
  <div class="tile" :class="[variant, { wide }]">
    <div class="tile-label">{{ label }}</div>
    <div class="tile-value" :class="{ mono }">{{ value }}</div>
    <div class="tile-desc"><slot /></div>
  </div>
</template>
