<template>
  <svg viewBox="-4 -4 1288 376" role="img" aria-label="UID mismatch on a shared file system" style="width:1288px">
    <g v-for="(n, i) in [{ x: 0, name: 'node1', uid: '1001', ok: true }, { x: 720, name: 'node2', uid: '1002', ok: false }]" :key="n.name">
      <rect :x="n.x" y="0" width="560" height="130" class="node" />
      <text :x="n.x + 24" y="40" class="b m">{{ n.name }}</text>
      <rect :x="n.x + 24" y="56" width="512" height="56" class="svc" />
      <text :x="n.x + 280" y="93" text-anchor="middle">alice UID {{ n.uid }}</text>
      <line :x1="n.x + 280" y1="130" :x2="n.x + 280" y2="216" class="ln" marker-end="url(#ah-uid)" />
      <text :x="n.x + 296" y="182">{{ n.ok ? 'Owner matches' : 'Not the owner' }}</text>
    </g>
    <rect x="0" y="220" width="1280" height="148" class="bar" />
    <text x="24" y="260" class="b">Shared File System</text>
    <rect x="360" y="284" width="560" height="64" class="plain" />
    <text x="640" y="325" text-anchor="middle" class="m">home alice owned by UID 1001</text>
    <defs><marker id="ah-uid" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0 0L10 5L0 10z" fill="#333333" /></marker></defs>
  </svg>
</template>
