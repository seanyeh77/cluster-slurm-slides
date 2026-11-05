<script setup>
// sbatch on the login node, slurmctld schedules, slurmd runs, output lands
// on shared storage. One arrow per step.
defineProps({ captions: Array })
const rows = [
  { y: 0, name: 'Login Node', svc: 'sbatch hello.sh', kind: 'node' },
  { y: 190, name: 'Head Node', svc: 'slurmctld', kind: 'node' },
  { y: 380, name: 'Compute Node', svc: 'slurmd', kind: 'node' },
  { y: 570, name: 'Shared Storage', svc: 'slurm-42.out', kind: 'bar' },
]
const labels = ['Submit', 'Dispatch', 'Write output']
</script>

<template>
  <Stepper :steps="3" :captions="captions" :width="824" v-slot="{ s }">
    <svg viewBox="-4 -4 824 702" role="img" aria-label="Slurm job flow">
      <g v-for="(r, i) in rows" :key="r.name" class="f" :class="{ off: i > s }">
        <rect x="0" :y="r.y" width="816" height="124" :class="r.kind" />
        <text x="32" :y="r.y + 72" class="b">{{ r.name }}</text>
        <rect x="400" :y="r.y + 24" width="392" height="76" :class="i === 3 ? 'plain' : 'svc'" />
        <text x="596" :y="r.y + 70" text-anchor="middle" class="m">{{ r.svc }}</text>
      </g>
      <g v-for="(l, i) in labels" :key="l" class="f" :class="{ off: i >= s }">
        <line x1="596" :y1="rows[i].y + 124" x2="596" :y2="rows[i + 1].y - 4" class="ln" :class="{ hl: i === s - 1 }" marker-end="url(#ah-jf)" />
        <text x="580" :y="rows[i].y + 164" text-anchor="end">{{ l }}</text>
      </g>
      <defs><marker id="ah-jf" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
    </svg>
  </Stepper>
</template>
