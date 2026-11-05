<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $page, $nav, $slidev, $frontmatter } = useSlideContext()
const pct = computed(() => ($page.value / $nav.value.total) * 100)
const onCover = computed(() => $frontmatter.value?.layout === 'cover')
</script>

<template>
  <div class="tb-progress" aria-hidden="true"><i :style="{ width: pct + '%' }" /></div>
  <div v-if="$frontmatter.ltag" class="ltag">{{ $frontmatter.ltag }}</div>
  <div class="tb-foot" :class="{ 'on-cover': onCover }">
    <span>{{ $slidev.configs.title }}</span>
    <span class="tb-page">{{ $page }} / {{ $nav.total }}</span>
  </div>
</template>
