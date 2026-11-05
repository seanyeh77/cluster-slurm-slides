<script setup>
defineProps({ chapter: String, term: String, kind: String })
</script>

<template>
  <div class="slidev-layout tb-def">
    <div class="tb-chap">{{ chapter }}</div>
    <div class="def-grid">
      <div class="def-term">
        <div class="def-kind">{{ kind }}</div>
        <div class="def-word">{{ term }}</div>
      </div>
      <div class="def-body">
        <slot />
        <div v-if="$slots.example" class="def-ex">
          <div class="def-ex-label">EXAMPLE</div>
          <slot name="example" />
        </div>
      </div>
    </div>
  </div>
</template>
