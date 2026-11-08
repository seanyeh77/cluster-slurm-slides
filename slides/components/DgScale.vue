<script setup>
// Scale Up (one node grows) vs Scale Out (more nodes on a switch).
defineProps({ captions: Array })
const nodes = [0, 1, 2, 3].map((i) => 800 + i * 180)
</script>

<template>
  <Stepper :steps="2" :captions="captions" :width="1508" v-slot="{ s }">
    <svg viewBox="-4 -4 1508 382" role="img" aria-label="Scale Up and Scale Out">
      <text x="330" y="30" text-anchor="middle" class="b t">Scale Up</text>
      <rect x="40" y="150" width="220" height="120" class="node" />
      <text x="150" y="196" text-anchor="middle" class="b">Node</text>
      <text x="150" y="236" text-anchor="middle">16 cores 64 GB</text>
      <line x1="262" y1="210" x2="376" y2="210" class="ln" marker-end="url(#ah-sc)" />
      <text x="319" y="194" text-anchor="middle">Upgrade</text>
      <rect x="380" y="90" width="280" height="240" class="node" />
      <text x="520" y="180" text-anchor="middle" class="b">Node</text>
      <text x="520" y="222" text-anchor="middle">128 cores</text>
      <text x="520" y="258" text-anchor="middle">1 TB</text>

      <g class="f" :class="{ off: s < 2 }">
        <text x="1150" y="30" text-anchor="middle" class="b t">Scale Out</text>
        <rect x="950" y="66" width="400" height="64" class="bar" />
        <text x="1150" y="106" text-anchor="middle">Network Switch</text>
        <path d="M1150 130V192M880 192H1420" class="ln" />
        <g v-for="x in nodes" :key="x">
          <path :d="`M${x + 80} 192V250`" class="ln" />
          <rect :x="x" y="250" width="160" height="124" class="node" />
          <text :x="x + 80" y="290" text-anchor="middle" class="b">Node</text>
          <text :x="x + 80" y="326" text-anchor="middle">16 cores</text>
          <text :x="x + 80" y="358" text-anchor="middle">64 GB</text>
        </g>
      </g>
      <defs><marker id="ah-sc" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
    </svg>
  </Stepper>
</template>
