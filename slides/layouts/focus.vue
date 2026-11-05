<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// Focus layout: one item at a time, large. The full list sits on the left as a
// vertical index; click n brings item n into the main panel.
// items: [{ label?, title, code?, text }]
const props = defineProps({ chapter: String, items: { type: Array, required: true }, numbered: Boolean })
const { $clicks } = useSlideContext()
const cur = computed(() => Math.min($clicks.value, props.items.length - 1))
const item = computed(() => props.items[cur.value])
</script>

<template>
  <div class="slidev-layout tb-focus">
    <div class="tb-chap">{{ chapter }}</div>
    <slot />
    <div class="fc">
      <ol class="fc-index">
        <li v-for="(it, i) in items" :key="i" :class="{ on: i === cur, done: i < cur }">
          <span class="fc-n">{{ numbered ? i + 1 : String(i + 1).padStart(2, '0') }}</span>
          <span class="fc-t">{{ it.title }}</span>
        </li>
      </ol>
      <Transition name="fc-swap" mode="out-in">
        <div :key="cur" class="fc-main">
          <div v-if="item.label" class="fc-label">{{ item.label }}</div>
          <div class="fc-title">{{ item.title }}</div>
          <code v-if="item.code" class="fc-code">{{ item.code }}</code>
          <div class="fc-text" v-html="item.text" />
        </div>
      </Transition>
    </div>
  </div>
</template>
