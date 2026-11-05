<script setup>
// One job allocation of 2 nodes x 4 tasks. Step 1 the allocation, step 2 the
// batch script on the batch host, step 3 srun step 0 on all 8 tasks, step 4
// srun -n 2 as step 1 on two tasks.
defineProps({ captions: Array })
const nodes = [
  { x: 24, name: 'slurm-compute', host: true },
  { x: 682, name: 'slurm-head', host: false },
]
const cell = (n, j, s) => {
  if (s === 2) return n.host && j === 0 ? 'batch' : ''
  if (s === 3) return '44.0'
  if (s === 4) return n.host && j < 2 ? '44.1' : ''
  return ''
}
</script>

<template>
  <Stepper :steps="4" :captions="captions" :width="1348" v-slot="{ s }">
    <svg viewBox="-4 -4 1348 312" role="img" aria-label="Job allocation and job steps">
      <rect x="0" y="0" width="1340" height="300" class="outer" :class="{ hl: s === 1 }" />
      <text x="24" y="40" class="b">Allocation 44</text>
      <g v-for="n in nodes" :key="n.name">
        <rect :x="n.x" y="60" width="634" height="216" class="node" />
        <text :x="n.x + 24" y="100" class="b m">{{ n.name }}</text>
        <text v-if="n.host" :x="n.x + 610" y="100" text-anchor="end" class="f" :class="{ off: s < 2 }">Batch Host</text>
        <g v-for="j in [0, 1, 2, 3]" :key="j">
          <rect :x="n.x + 24 + j * 150" y="130" width="136" height="120" :class="cell(n, j, s) ? 'svc' : 'plain'" :style="cell(n, j, s) === 'batch' ? 'stroke:var(--accent);stroke-width:5' : null" />
          <text :x="n.x + 92 + j * 150" y="200" text-anchor="middle" class="m">{{ cell(n, j, s) || 'CPU' }}</text>
        </g>
      </g>
    </svg>
  </Stepper>
</template>
