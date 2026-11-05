<script setup>
// Slurm daemons by role: clients submit to slurmctld, slurmctld dispatches to
// slurmd, accounting goes through slurmdbd into MariaDB.
defineProps({ captions: Array })
const comps = [0, 320]
</script>

<template>
  <Stepper :steps="3" :captions="captions" :width="1408" v-slot="{ s }">
    <svg viewBox="-4 -4 1408 602" role="img" aria-label="Slurm components">
      <rect x="0" y="0" width="600" height="124" class="node" />
      <text x="24" y="40" class="b">Login Node</text>
      <rect x="24" y="56" width="552" height="50" class="svc" />
      <text x="300" y="90" text-anchor="middle" class="m">sbatch  srun  sinfo</text>
      <line x1="300" y1="124" x2="300" y2="196" class="ln" marker-end="url(#ah-cp)" />
      <text x="316" y="168">Submit</text>
      <rect x="0" y="200" width="600" height="130" class="node" />
      <text x="24" y="240" class="b">Head Node</text>
      <rect x="24" y="258" width="552" height="54" class="svc" />
      <text x="300" y="294" text-anchor="middle" class="m">slurmctld</text>

      <g class="f" :class="{ off: s < 2 }">
        <path d="M300 330V400M140 400H460" class="ln" />
        <line v-for="x in comps" :key="'l' + x" :x1="x + 140" y1="400" :x2="x + 140" y2="456" class="ln" marker-end="url(#ah-cp)" />
        <text x="316" y="378">Dispatch</text>
        <g v-for="x in comps" :key="x">
          <rect :x="x" y="460" width="280" height="130" class="node" />
          <text :x="x + 24" y="500" class="b">Compute Node</text>
          <rect :x="x + 24" y="518" width="232" height="54" class="svc" />
          <text :x="x + 140" y="554" text-anchor="middle" class="m">slurmd</text>
        </g>
      </g>

      <g class="f" :class="{ off: s < 3 }">
        <line x1="600" y1="285" x2="796" y2="285" class="ln" marker-end="url(#ah-cp)" />
        <text x="698" y="269" text-anchor="middle">Accounting</text>
        <rect x="800" y="200" width="600" height="130" class="node" />
        <text x="824" y="240" class="b">DBD Node</text>
        <rect x="824" y="258" width="552" height="54" class="svc" />
        <text x="1100" y="294" text-anchor="middle" class="m">slurmdbd</text>
        <line x1="1100" y1="330" x2="1100" y2="456" class="ln" marker-end="url(#ah-cp)" />
        <text x="1116" y="400">Store</text>
        <rect x="800" y="460" width="600" height="130" class="bar" />
        <text x="824" y="500" class="b">MariaDB</text>
        <rect x="824" y="518" width="552" height="54" class="plain" />
        <text x="1100" y="554" text-anchor="middle" class="m">slurm_acct_db</text>
      </g>
      <defs><marker id="ah-cp" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
    </svg>
  </Stepper>
</template>
