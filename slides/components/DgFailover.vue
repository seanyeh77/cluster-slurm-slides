<script setup>
// slurmctld active-standby: heartbeat, primary down, backup reads the shared
// state and takes over.
defineProps({ captions: Array })
</script>

<template>
  <Stepper :steps="3" :captions="captions" :width="1408" v-slot="{ s }">
    <svg viewBox="-4 -4 1408 440" role="img" aria-label="slurmctld failover">
      <g :style="{ opacity: s >= 2 ? 0.35 : 1, transition: 'opacity .45s' }">
        <rect x="0" y="0" width="520" height="150" class="node" />
        <text x="24" y="40" class="b m">head1</text>
        <rect x="24" y="64" width="472" height="62" class="svc" />
        <text x="260" y="104" text-anchor="middle" class="m">{{ s >= 2 ? 'slurmctld DOWN' : 'slurmctld Primary' }}</text>
        <line x1="260" y1="150" x2="260" y2="326" class="ln" marker-end="url(#ah-fo)" />
        <text x="276" y="246">Write state</text>
      </g>
      <rect x="880" y="0" width="520" height="150" class="node" />
      <text x="904" y="40" class="b m">head2</text>
      <rect x="904" y="64" width="472" height="62" class="svc" :class="{ hl: s === 3 }" />
      <text x="1140" y="104" text-anchor="middle" class="m">{{ s === 3 ? 'slurmctld Active' : 'slurmctld Backup' }}</text>
      <line x1="880" y1="75" x2="524" y2="75" class="ln" marker-end="url(#ah-fo)" />
      <text x="700" y="59" text-anchor="middle">{{ s >= 2 ? 'No response' : 'Heartbeat' }}</text>
      <g class="f" :class="{ off: s < 3 }">
        <line x1="1140" y1="330" x2="1140" y2="154" class="ln" marker-end="url(#ah-fo)" />
        <text x="1156" y="246">Read state</text>
      </g>
      <rect x="0" y="330" width="1400" height="102" class="bar" />
      <text x="700" y="390" text-anchor="middle" class="m">StateSaveLocation</text>
      <defs><marker id="ah-fo" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
    </svg>
  </Stepper>
</template>
