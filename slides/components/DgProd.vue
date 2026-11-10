<script setup>
// Production deployment in three layers, one step per layer.
// Drawn at 1x on the slide: tight row pitch with 44 px service boxes.
defineProps({ captions: Array })

const SVC = 44
const ACC_Y = 0 // access layer
const ACC_H = 150
const CTL_Y = ACC_H + 40 // control layer
const CTL_H = 218
const HEAD_Y = CTL_Y + 48
const HEAD_H = 156
const CMP_Y = CTL_Y + CTL_H + 40 // compute layer
const CMP_H = 158
const PART_Y = CMP_Y + 48
const PART_H = 96
const H = CMP_Y + CMP_H

const parts = [
  { x: 24, t: 'debug', n: 'cpu01 to cpu02' },
  { x: 548, t: 'cpu', n: 'cpu01 to cpu16' },
  { x: 1072, t: 'gpu', n: 'gpu01 to gpu04' },
]
const heads = [{ x: 24, t: 'head1 Primary' }, { x: 548, t: 'head2 Backup' }]
</script>

<template>
  <Stepper :steps="3" :captions="captions" :width="1608" v-slot="{ s }">
    <svg :viewBox="`-4 -4 1608 ${H + 8}`" role="img" aria-label="Production deployment layers">
      <rect x="0" :y="ACC_Y" width="1600" :height="ACC_H" class="outer" />
      <text x="24" :y="ACC_Y + 36" class="b">Access Layer</text>
      <rect x="600" :y="ACC_Y + 14" width="400" :height="SVC" class="svc" />
      <text x="800" :y="ACC_Y + 44" text-anchor="middle" class="m">VIP login.cluster</text>
      <path :d="`M800 ${ACC_Y + 58}V${ACC_Y + 78}M500 ${ACC_Y + 78}H1100M500 ${ACC_Y + 78}V${ACC_Y + 92}M1100 ${ACC_Y + 78}V${ACC_Y + 92}`" class="ln" />
      <rect x="300" :y="ACC_Y + 92" width="400" :height="SVC" class="node" />
      <text x="500" :y="ACC_Y + 122" text-anchor="middle" class="m">login1</text>
      <rect x="900" :y="ACC_Y + 92" width="400" :height="SVC" class="node" />
      <text x="1100" :y="ACC_Y + 122" text-anchor="middle" class="m">login2</text>

      <g class="f" :class="{ off: s < 2 }">
        <line x1="800" :y1="ACC_Y + ACC_H" x2="800" :y2="CTL_Y - 4" class="ln" marker-end="url(#ah-pd)" />
        <rect x="0" :y="CTL_Y" width="1600" :height="CTL_H" class="outer" />
        <text x="24" :y="CTL_Y + 32" class="b">Control Layer</text>
        <g v-for="h in heads" :key="h.t">
          <rect :x="h.x" :y="HEAD_Y" width="500" :height="HEAD_H" class="node" />
          <text :x="h.x + 24" :y="HEAD_Y + 34" class="b">{{ h.t }}</text>
          <g v-for="(name, r) in ['slurmctld', 'slurmdbd']" :key="name">
            <rect :x="h.x + 24" :y="HEAD_Y + 46 + r * 54" width="452" :height="SVC" class="svc" />
            <text :x="h.x + 250" :y="HEAD_Y + 76 + r * 54" text-anchor="middle" class="m">{{ name }}</text>
          </g>
        </g>
        <rect x="1072" :y="HEAD_Y" width="504" height="70" class="bar" />
        <text x="1324" :y="HEAD_Y + 44" text-anchor="middle" class="m">StateSaveLocation</text>
        <rect x="1072" :y="HEAD_Y + 86" width="504" height="70" class="bar" />
        <text x="1324" :y="HEAD_Y + 130" text-anchor="middle" class="m">MariaDB db1</text>
      </g>

      <g class="f" :class="{ off: s < 3 }">
        <line x1="800" :y1="CTL_Y + CTL_H" x2="800" :y2="CMP_Y - 4" class="ln" marker-end="url(#ah-pd)" />
        <rect x="0" :y="CMP_Y" width="1600" :height="CMP_H" class="outer" />
        <text x="24" :y="CMP_Y + 32" class="b">Compute Layer</text>
        <g v-for="p in parts" :key="p.t">
          <rect :x="p.x" :y="PART_Y" width="504" :height="PART_H" class="node" />
          <text :x="p.x + 24" :y="PART_Y + 34" class="b">Partition {{ p.t }}</text>
          <rect :x="p.x + 24" :y="PART_Y + 44" width="456" :height="SVC" class="svc" />
          <text :x="p.x + 252" :y="PART_Y + 74" text-anchor="middle" class="m">{{ p.n }}</text>
        </g>
      </g>
      <defs><marker id="ah-pd" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
    </svg>
  </Stepper>
</template>
