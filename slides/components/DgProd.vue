<script setup>
// Production deployment in three layers, one step per layer.
defineProps({ captions: Array })
const parts = [
  { x: 24, t: 'debug', n: 'cpu01 to cpu02' },
  { x: 548, t: 'cpu', n: 'cpu01 to cpu16' },
  { x: 1072, t: 'gpu', n: 'gpu01 to gpu04' },
]
</script>

<template>
  <Stepper :steps="3" :captions="captions" :width="1608" v-slot="{ s }">
    <svg viewBox="-4 -4 1608 780" role="img" aria-label="Production deployment layers">
      <rect x="0" y="0" width="1600" height="210" class="outer" />
      <text x="24" y="40" class="b">Access Layer</text>
      <rect x="600" y="20" width="400" height="56" class="svc" />
      <text x="800" y="57" text-anchor="middle" class="m">VIP login.cluster</text>
      <path d="M800 76V110M500 110H1100M500 110V130M1100 110V130" class="ln" />
      <rect x="300" y="130" width="400" height="60" class="node" />
      <text x="500" y="169" text-anchor="middle" class="m">login1</text>
      <rect x="900" y="130" width="400" height="60" class="node" />
      <text x="1100" y="169" text-anchor="middle" class="m">login2</text>

      <g class="f" :class="{ off: s < 2 }">
        <line x1="800" y1="210" x2="800" y2="246" class="ln" marker-end="url(#ah-pd)" />
        <rect x="0" y="250" width="1600" height="270" class="outer" />
        <text x="24" y="290" class="b">Control Layer</text>
        <g v-for="(h, i) in [{ x: 24, t: 'head1 Primary' }, { x: 548, t: 'head2 Backup' }]" :key="h.t">
          <rect :x="h.x" y="310" width="500" height="190" class="node" />
          <text :x="h.x + 24" y="348" class="b">{{ h.t }}</text>
          <rect :x="h.x + 24" y="366" width="452" height="54" class="svc" />
          <text :x="h.x + 250" y="402" text-anchor="middle" class="m">slurmctld</text>
          <rect :x="h.x + 24" y="430" width="452" height="54" class="svc" />
          <text :x="h.x + 250" y="466" text-anchor="middle" class="m">slurmdbd</text>
        </g>
        <rect x="1072" y="310" width="504" height="90" class="bar" />
        <text x="1324" y="364" text-anchor="middle" class="m">StateSaveLocation</text>
        <rect x="1072" y="410" width="504" height="90" class="bar" />
        <text x="1324" y="464" text-anchor="middle" class="m">MariaDB db1</text>
      </g>

      <g class="f" :class="{ off: s < 3 }">
        <line x1="800" y1="520" x2="800" y2="556" class="ln" marker-end="url(#ah-pd)" />
        <rect x="0" y="560" width="1600" height="212" class="outer" />
        <text x="24" y="600" class="b">Compute Layer</text>
        <g v-for="p in parts" :key="p.t">
          <rect :x="p.x" y="620" width="504" height="132" class="node" />
          <text :x="p.x + 24" y="658" class="b">Partition {{ p.t }}</text>
          <rect :x="p.x + 24" y="676" width="456" height="56" class="svc" />
          <text :x="p.x + 252" y="713" text-anchor="middle" class="m">{{ p.n }}</text>
        </g>
      </g>
      <defs><marker id="ah-pd" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
    </svg>
  </Stepper>
</template>
