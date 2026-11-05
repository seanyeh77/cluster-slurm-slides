<template>
  <svg viewBox="-4 -4 1408 468" role="img" aria-label="TreeWidth message fan-out" style="width:1408px">
    <rect x="500" y="0" width="400" height="72" class="svc" />
    <text x="700" y="45" text-anchor="middle" class="m">slurmctld</text>
    <g v-for="(r, i) in [{ y: 128, w: 600, t: '16 slurmd' }, { y: 256, w: 1000, t: '256 slurmd' }, { y: 384, w: 1400, t: '4096 slurmd' }]" :key="r.t">
      <line x1="700" :y1="r.y - 56" x2="700" :y2="r.y - 4" class="ln" marker-end="url(#ah-tw)" />
      <text x="716" :y="r.y - 22">Forward</text>
      <rect :x="700 - r.w / 2" :y="r.y" :width="r.w" height="72" class="bar" />
      <text :x="700 - r.w / 2 + 24" :y="r.y + 45" class="b">Level {{ i + 2 }}</text>
      <text x="700" :y="r.y + 45" text-anchor="middle" class="m">{{ r.t }}</text>
    </g>
    <defs><marker id="ah-tw" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
  </svg>
</template>
