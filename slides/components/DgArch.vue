<script setup>
// Cluster architecture built in four steps: login, management network and
// head node, compute nodes, storage on the high-speed interconnect.
// Drawn at 1x on the slide: rows use a tight pitch with 44 px service boxes.
defineProps({ captions: Array })

const SVC = 44 // service box height
const LOGIN_Y = 100 // login node row
const ROW = 64 // height of a one-row container (title and services side by side)
const MGMT_Y = LOGIN_Y + ROW + 36 // management network bar
const BAR = 44 // network bar height
const NODE_Y = MGMT_Y + BAR + 40 // head and compute nodes
const NODE_H = 160
const IC_Y = NODE_Y + NODE_H + 40 // high-speed interconnect bar
const ST_Y = IC_Y + BAR + 40 // storage node
const H = ST_Y + ROW // total height

const computes = [560, 920, 1280]
const svcY = (row) => NODE_Y + 52 + row * 52
</script>

<template>
  <Stepper :steps="4" :captions="captions" :width="1608" v-slot="{ s }">
    <svg :viewBox="`-4 -4 1608 ${H + 8}`" role="img" aria-label="Cluster architecture">
      <rect x="700" y="0" width="200" height="50" class="node" />
      <text x="800" y="34" text-anchor="middle" class="b">User</text>
      <line x1="800" y1="50" :x2="800" :y2="LOGIN_Y - 4" class="ln" marker-end="url(#ah-ar)" />
      <text x="816" y="84">SSH</text>
      <rect x="500" :y="LOGIN_Y" width="600" :height="ROW" class="node" />
      <text x="524" :y="LOGIN_Y + 40" class="b">Login Node</text>
      <rect x="700" :y="LOGIN_Y + 10" width="180" :height="SVC" class="svc" />
      <text x="790" :y="LOGIN_Y + 40" text-anchor="middle" class="m">sshd</text>
      <rect x="896" :y="LOGIN_Y + 10" width="180" :height="SVC" class="svc" />
      <text x="986" :y="LOGIN_Y + 40" text-anchor="middle">Slurm client</text>

      <g class="f" :class="{ off: s < 2 }">
        <path :d="`M800 ${LOGIN_Y + ROW}V${MGMT_Y}`" class="ln" />
        <rect x="0" :y="MGMT_Y" width="1600" :height="BAR" class="bar" />
        <text x="800" :y="MGMT_Y + 30" text-anchor="middle" class="b">Management Network</text>
        <path :d="`M250 ${MGMT_Y + BAR}V${NODE_Y}`" class="ln" />
        <rect x="0" :y="NODE_Y" width="500" :height="NODE_H" class="node" />
        <text x="24" :y="NODE_Y + 36" class="b">Head Node</text>
        <g v-for="(name, i) in ['slurmctld', 'slurmdbd', 'LDAP', 'NTP']" :key="name">
          <rect :x="24 + (i % 2) * 234" :y="svcY(Math.floor(i / 2))" width="218" :height="SVC" class="svc" />
          <text :x="133 + (i % 2) * 234" :y="svcY(Math.floor(i / 2)) + 30" text-anchor="middle" :class="{ m: i < 2 }">{{ name }}</text>
        </g>
      </g>

      <g class="f" :class="{ off: s < 3 }">
        <g v-for="x in computes" :key="x">
          <path :d="`M${x + 160} ${MGMT_Y + BAR}V${NODE_Y}`" class="ln" />
          <rect :x="x" :y="NODE_Y" width="320" :height="NODE_H" class="node" />
          <text :x="x + 24" :y="NODE_Y + 36" class="b">Compute Node</text>
          <g v-for="(name, r) in ['slurmd', 'munged']" :key="name">
            <rect :x="x + 24" :y="svcY(r)" width="272" :height="SVC" class="svc" />
            <text :x="x + 160" :y="svcY(r) + 30" text-anchor="middle" class="m">{{ name }}</text>
          </g>
        </g>
      </g>

      <g class="f" :class="{ off: s < 4 }">
        <path v-for="x in computes" :key="'ic' + x" :d="`M${x + 160} ${NODE_Y + NODE_H}V${IC_Y}`" class="ln" />
        <rect x="560" :y="IC_Y" width="1040" :height="BAR" class="bar" />
        <text x="1080" :y="IC_Y + 30" text-anchor="middle" class="b">High-Speed Interconnect</text>
        <path :d="`M1080 ${IC_Y + BAR}V${ST_Y}`" class="ln" />
        <rect x="800" :y="ST_Y" width="560" :height="ROW" class="node" />
        <text x="824" :y="ST_Y + 40" class="b">Storage Node</text>
        <rect x="1012" :y="ST_Y + 10" width="150" :height="SVC" class="svc" />
        <text x="1087" :y="ST_Y + 40" text-anchor="middle">NFS</text>
        <rect x="1178" :y="ST_Y + 10" width="158" :height="SVC" class="svc" />
        <text x="1257" :y="ST_Y + 40" text-anchor="middle">BeeGFS</text>
      </g>
      <defs><marker id="ah-ar" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
    </svg>
  </Stepper>
</template>
