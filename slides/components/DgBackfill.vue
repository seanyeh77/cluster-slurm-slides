<script setup>
// Backfill on a node by time chart: A runs, B waits for 4 nodes, C fills the
// idle gap, D queues after B. Step 5 is the contrast case without backfill:
// C waits behind B and node03, node04 stay idle. Hours are 140 px wide.
defineProps({ captions: Array })
const X = (h) => 170 + h * 140
const Y = (r) => r * 92
const rows = ['node01', 'node02', 'node03', 'node04']
// Time axis sits just below the job boxes, which end at y = 362.
const AX = 368
</script>

<template>
  <Stepper :steps="5" :captions="captions" :width="1324" v-slot="{ s }">
    <svg viewBox="-4 -4 1324 418" role="img" aria-label="Backfill scheduling">
      <text v-for="(r, i) in rows" :key="r" x="0" :y="Y(i) + 48" class="m">{{ r }}</text>
      <path :d="`M170 0V${AX}H${X(8)}`" class="ln" />
      <g v-for="h in [0, 1, 2, 3, 4, 5, 6, 7, 8]" :key="h">
        <path :d="`M${X(h)} ${AX}V${AX + 10}`" class="ln" />
        <text :x="X(h)" :y="AX + 40" text-anchor="middle">{{ h }}h</text>
      </g>

      <rect :x="X(0)" :y="Y(0) + 6" :width="X(3) - X(0)" height="172" class="svc" />
      <text :x="(X(0) + X(3)) / 2" :y="Y(0) + 100" text-anchor="middle" class="b">Job A</text>

      <g class="f" :class="{ off: s >= 3 && s < 5 }">
        <rect :x="X(0)" :y="Y(2) + 6" :width="X(3) - X(0)" height="172" class="idle" />
        <text :x="(X(0) + X(3)) / 2" :y="Y(2) + 100" text-anchor="middle" class="mut">Idle</text>
      </g>
      <g class="f" :class="{ off: s < 2 }">
        <rect :x="X(3)" :y="Y(0) + 6" :width="X(6) - X(3)" height="356" class="bar" />
        <text :x="(X(3) + X(6)) / 2" :y="Y(2) - 2" text-anchor="middle" class="b">Job B</text>
      </g>
      <g class="f" :class="{ off: s < 3 }">
        <rect :x="s === 5 ? X(6) : X(0)" :y="Y(2) + 6" :width="X(2) - X(0)" height="172" class="svc" :class="{ hl: s === 3 || s === 5 }" />
        <text :x="s === 5 ? (X(6) + X(8)) / 2 : (X(0) + X(2)) / 2" :y="Y(2) + 100" text-anchor="middle" class="b">Job C</text>
      </g>
      <g class="f" :class="{ off: s < 4 }">
        <rect :x="X(6)" :y="Y(0) + 6" :width="X(8) - X(6)" height="172" class="node" />
        <text :x="(X(6) + X(8)) / 2" :y="Y(0) + 100" text-anchor="middle" class="b">Job D</text>
      </g>
    </svg>
  </Stepper>
</template>
