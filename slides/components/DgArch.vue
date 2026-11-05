<script setup>
// Cluster architecture built in four steps: login, management network and
// head node, compute nodes, storage on the high-speed interconnect.
defineProps({ captions: Array })
const computes = [560, 920, 1280]
</script>

<template>
  <Stepper :steps="4" :captions="captions" :width="1608" v-slot="{ s }">
    <svg viewBox="-4 -4 1608 914" role="img" aria-label="Cluster architecture">
      <rect x="700" y="0" width="200" height="60" class="node" />
      <text x="800" y="39" text-anchor="middle" class="b">User</text>
      <line x1="800" y1="60" x2="800" y2="118" class="ln" marker-end="url(#ah-ar)" />
      <text x="816" y="98">SSH</text>
      <rect x="520" y="120" width="560" height="130" class="node" />
      <text x="544" y="158" class="b">Login Node</text>
      <rect x="544" y="176" width="248" height="56" class="svc" />
      <text x="668" y="213" text-anchor="middle" class="m">sshd</text>
      <rect x="808" y="176" width="248" height="56" class="svc" />
      <text x="932" y="213" text-anchor="middle">Slurm client</text>

      <g class="f" :class="{ off: s < 2 }">
        <path d="M800 250V300" class="ln" />
        <rect x="0" y="300" width="1600" height="50" class="bar" />
        <text x="800" y="334" text-anchor="middle" class="b">Management Network</text>
        <path d="M250 350V410" class="ln" />
        <rect x="0" y="410" width="500" height="200" class="node" />
        <text x="24" y="448" class="b">Head Node</text>
        <rect x="24" y="468" width="218" height="56" class="svc" />
        <text x="133" y="505" text-anchor="middle" class="m">slurmctld</text>
        <rect x="258" y="468" width="218" height="56" class="svc" />
        <text x="367" y="505" text-anchor="middle" class="m">slurmdbd</text>
        <rect x="24" y="536" width="218" height="56" class="svc" />
        <text x="133" y="573" text-anchor="middle">LDAP</text>
        <rect x="258" y="536" width="218" height="56" class="svc" />
        <text x="367" y="573" text-anchor="middle">NTP</text>
      </g>

      <g class="f" :class="{ off: s < 3 }">
        <g v-for="x in computes" :key="x">
          <path :d="`M${x + 160} 350V410`" class="ln" />
          <rect :x="x" y="410" width="320" height="200" class="node" />
          <text :x="x + 24" y="448" class="b">Compute Node</text>
          <rect :x="x + 24" y="468" width="272" height="56" class="svc" />
          <text :x="x + 160" y="505" text-anchor="middle" class="m">slurmd</text>
          <rect :x="x + 24" y="536" width="272" height="56" class="svc" />
          <text :x="x + 160" y="573" text-anchor="middle" class="m">munged</text>
        </g>
      </g>

      <g class="f" :class="{ off: s < 4 }">
        <path v-for="x in computes" :key="'ic' + x" :d="`M${x + 160} 610V680`" class="ln" />
        <rect x="560" y="680" width="1040" height="50" class="bar" />
        <text x="1080" y="714" text-anchor="middle" class="b">High-Speed Interconnect</text>
        <path d="M1080 730V780" class="ln" />
        <rect x="840" y="780" width="480" height="126" class="node" />
        <text x="864" y="818" class="b">Storage Node</text>
        <rect x="864" y="834" width="208" height="56" class="svc" />
        <text x="968" y="871" text-anchor="middle">NFS</text>
        <rect x="1088" y="834" width="208" height="56" class="svc" />
        <text x="1192" y="871" text-anchor="middle">BeeGFS</text>
      </g>
      <defs><marker id="ah-ar" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
    </svg>
  </Stepper>
</template>
