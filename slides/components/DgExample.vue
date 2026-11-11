<script setup>
// The 2-node example cluster that Building and Installing Slurm builds and
// Introduction to Cluster uses: slurm-head is also the login node, controller,
// DBD node and a compute node. Drawn at 1x; coordinates from the constants below.
defineProps({ ips: Boolean })

const NODE_W = 660
const GAP = 80
const W = NODE_W * 2 + GAP // 1400
const USER_H = 56
const NODE_Y = 128
const NODE_H = 152
const TITLE = 64 // title row inside a node
const SVC_W = 188
const SVC_H = 56
const SVC_GAP = 24
const NET_Y = NODE_Y + NODE_H + 64
const NET_H = 56
const H = NET_Y + NET_H

const nodes = [
  { x: 0, name: 'slurm-head', ip: '10.1.253.75', svcs: ['slurmctld', 'slurmdbd', 'slurmd'] },
  { x: NODE_W + GAP, name: 'slurm-compute', ip: '10.1.253.77', svcs: ['slurmd'] },
]
const mid = (n) => n.x + NODE_W / 2
const USER_W = 200
</script>

<template>
  <svg :viewBox="`-4 -4 ${W + 8} ${H + 8}`" role="img" aria-label="Example cluster with two nodes" :style="{ width: W + 8 + 'px' }">
    <rect :x="mid(nodes[0]) - USER_W / 2" y="0" :width="USER_W" :height="USER_H" class="plain" />
    <text :x="mid(nodes[0])" :y="USER_H / 2 + 9" text-anchor="middle" class="b">User</text>
    <line :x1="mid(nodes[0])" :y1="USER_H" :x2="mid(nodes[0])" :y2="NODE_Y - 4" class="ln" marker-end="url(#ah-ex)" />
    <text :x="mid(nodes[0]) + 16" :y="(USER_H + NODE_Y) / 2 + 9">SSH</text>

    <g v-for="n in nodes" :key="n.name">
      <rect :x="n.x" :y="NODE_Y" :width="NODE_W" :height="NODE_H" class="node" />
      <text :x="n.x + 24" :y="NODE_Y + 42" class="b">{{ n.name }}</text>
      <text v-if="ips" :x="n.x + 236" :y="NODE_Y + 42" class="m">{{ n.ip }}</text>
      <text :x="n.x + NODE_W - 24" :y="NODE_Y + 42" text-anchor="end">4 CPUs</text>
      <g v-for="(sv, j) in n.svcs" :key="sv">
        <rect :x="n.x + 24 + j * (SVC_W + SVC_GAP)" :y="NODE_Y + TITLE" :width="SVC_W" :height="SVC_H" class="svc" />
        <text :x="n.x + 24 + j * (SVC_W + SVC_GAP) + SVC_W / 2" :y="NODE_Y + TITLE + SVC_H / 2 + 9" text-anchor="middle" class="m">{{ sv }}</text>
      </g>
      <line :x1="mid(n)" :y1="NODE_Y + NODE_H" :x2="mid(n)" :y2="NET_Y" class="ln" />
    </g>

    <rect x="0" :y="NET_Y" :width="W" :height="NET_H" class="bar" />
    <text :x="W / 2" :y="NET_Y + NET_H / 2 + 9" text-anchor="middle" class="b">Network</text>
    <defs><marker id="ah-ex" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
  </svg>
</template>
