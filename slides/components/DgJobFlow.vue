<script setup>
// sbatch on the login node, slurmctld schedules, slurmd runs, output lands
// on shared storage. One arrow per step; drawn at 1x on the slide.
defineProps({ captions: Array })

const BOX = 96 // row height
const PITCH = 160 // row to row
const SVC = 56 // service box height
const rows = [
  { name: 'Login Node', svc: 'sbatch hello.sh', kind: 'node' },
  { name: 'Head Node', svc: 'slurmctld', kind: 'node' },
  { name: 'Compute Node', svc: 'slurmd', kind: 'node' },
  { name: 'Shared Storage', svc: 'slurm-42.out', kind: 'bar' },
].map((r, i) => ({ ...r, y: i * PITCH }))
const labels = ['Submit', 'Dispatch', 'Write output']
const H = rows.at(-1).y + BOX
</script>

<template>
  <Stepper :steps="3" :captions="captions" :width="824" v-slot="{ s }">
    <svg :viewBox="`-4 -4 824 ${H + 8}`" role="img" aria-label="Slurm job flow">
      <g v-for="(r, i) in rows" :key="r.name" class="f" :class="{ off: i > s }">
        <rect x="0" :y="r.y" width="816" :height="BOX" :class="r.kind" />
        <text x="32" :y="r.y + BOX / 2 + 9" class="b">{{ r.name }}</text>
        <rect x="400" :y="r.y + (BOX - SVC) / 2" width="392" :height="SVC" :class="i === 3 ? 'plain' : 'svc'" />
        <text x="596" :y="r.y + BOX / 2 + 9" text-anchor="middle" class="m">{{ r.svc }}</text>
      </g>
      <g v-for="(l, i) in labels" :key="l" class="f" :class="{ off: i >= s }">
        <line x1="596" :y1="rows[i].y + BOX" x2="596" :y2="rows[i + 1].y - 4" class="ln" :class="{ hl: i === s - 1 }" marker-end="url(#ah-jf)" />
        <text x="580" :y="rows[i].y + BOX + (PITCH - BOX) / 2 + 9" text-anchor="end">{{ l }}</text>
      </g>
      <defs><marker id="ah-jf" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
    </svg>
  </Stepper>
</template>
