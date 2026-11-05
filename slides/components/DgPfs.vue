<script setup>
// Parallel file system: the client looks up chunk locations, then reads and
// writes all storage nodes at once.
defineProps({ captions: Array })
const st = [50, 383, 717, 1050]
</script>

<template>
  <Stepper :steps="2" :captions="captions" :width="1358" v-slot="{ s }">
    <svg viewBox="-4 -4 1358 472" role="img" aria-label="Parallel file system">
      <rect x="200" y="0" width="400" height="120" class="node" />
      <text x="224" y="40" class="b">Client</text>
      <rect x="224" y="56" width="352" height="48" class="svc" />
      <text x="400" y="88" text-anchor="middle">Application</text>
      <rect x="800" y="0" width="400" height="120" class="node" />
      <text x="824" y="40" class="b">Metadata Node</text>
      <rect x="824" y="56" width="352" height="48" class="svc" />
      <text x="1000" y="88" text-anchor="middle">Metadata Service</text>
      <line x1="600" y1="80" x2="796" y2="80" class="ln" :class="{ hl: s === 1 }" marker-end="url(#ah-pf)" />
      <text x="698" y="64" text-anchor="middle">Lookup</text>

      <g v-for="(x, i) in st" :key="x">
        <rect :x="x" y="330" width="300" height="134" class="node" />
        <text :x="x + 24" y="370" class="b">Storage Node</text>
        <rect :x="x + 24" y="390" width="252" height="56" class="bar" :class="{ hl: s === 2 }" />
        <text :x="x + 150" y="427" text-anchor="middle">Chunk {{ i + 1 }}</text>
      </g>
      <g class="f" :class="{ off: s < 2 }">
        <path d="M400 120V220M200 220H1200" class="ln" />
        <line v-for="x in st" :key="'a' + x" :x1="x + 150" y1="220" :x2="x + 150" y2="326" class="ln" marker-end="url(#ah-pf)" />
        <text x="416" y="176">Read and write</text>
      </g>
      <defs><marker id="ah-pf" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
    </svg>
  </Stepper>
</template>
