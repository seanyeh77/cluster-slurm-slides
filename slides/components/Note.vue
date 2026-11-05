<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// One margin note per click step; the last one stays after the final click.
const props = defineProps({ notes: { type: Array, required: true } })
const { $clicks } = useSlideContext()
const text = computed(() => props.notes[Math.min($clicks.value, props.notes.length - 1)])
</script>

<template>
  <Transition name="tb-fade" mode="out-in">
    <p :key="text" class="tb-note-text" v-html="text" />
  </Transition>
</template>
