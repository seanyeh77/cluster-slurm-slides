<script setup>
// Backfill on a node by time chart: A runs, B waits for 4 nodes, C fills the
// idle gap, D queues after B. Hours are 140 px wide.
defineProps({ captions: Array })
const X = (h) => 170 + h * 140
const Y = (r) => r * 92
const rows = ['node01', 'node02', 'node03', 'node04']
</script>

<template>
  <Stepper :steps="4" :captions="captions" :width="1308" v-slot="{ s }">
    <svg viewBox="-4 -4 1308 432" role="img" aria-label="Backfill scheduling">
      <text v-for="(r, i) in rows" :key="r" x="0" :y="Y(i) + 48" class="m">{{ r }}</text>
      <path :d="`M170 0V${Y(4) - 12}H${X(8)}`" class="ln" />
      <g v-for="h in [0, 1, 2, 3, 4, 5, 6, 7, 8]" :key="h">
        <path :d="`M${X(h)} ${Y(4) - 12}V${Y(4) - 2}`" class="ln" />
        <text :x="X(h)" :y="Y(4) + 24" text-anchor="middle">{{ h }}h</text>
      </g>

      <rect :x="X(0)" :y="Y(0) + 6" :width="X(3) - X(0)" height="172" class="svc" />
      <text :x="(X(0) + X(3)) / 2" :y="Y(0) + 100" text-anchor="middle" class="b">Job A</text>

      <g class="f" :class="{ off: s >= 3 }">
        <rect :x="X(0)" :y="Y(2) + 6" :width="X(3) - X(0)" height="172" class="idle" />
        <text :x="(X(0) + X(3)) / 2" :y="Y(2) + 100" text-anchor="middle" class="mut">Idle</text>
      </g>
      <g class="f" :class="{ off: s < 2 }">
        <rect :x="X(3)" :y="Y(0) + 6" :width="X(6) - X(3)" height="356" class="bar" />
        <text :x="(X(3) + X(6)) / 2" :y="Y(2) - 2" text-anchor="middle" class="b">Job B</text>
      </g>
      <g class="f" :class="{ off: s < 3 }">
        <rect :x="X(0)" :y="Y(2) + 6" :width="X(2) - X(0)" height="172" class="svc" :class="{ hl: s === 3 }" />
        <text :x="(X(0) + X(2)) / 2" :y="Y(2) + 100" text-anchor="middle" class="b">Job C</text>
      </g>
      <g class="f" :class="{ off: s < 4 }">
        <rect :x="X(6)" :y="Y(0) + 6" :width="X(8) - X(6)" height="172" class="node" />
        <text :x="(X(6) + X(8)) / 2" :y="Y(0) + 100" text-anchor="middle" class="b">Job D</text>
      </g>
    </svg>
  </Stepper>
</template>
