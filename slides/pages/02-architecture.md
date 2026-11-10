---
layout: section
number: 2
chapter: Ch 2 · Cluster Architecture
---

# Cluster Architecture

- **2.1** 架構總覽
- **2.2** Node Roles
- **2.3** Networks

---
layout: figure
chapter: Ch 2 · Cluster Architecture
clicks: 3
---

# 典型的 HPC Cluster 架構

<DgArch :captions="[
  '使用者從外部以 SSH 連進 Login Node，在上面編輯、編譯程式並送出 job。',
  '每台 node 都接在 Management Network 上；Head Node 提供排程、記帳、帳號與時間同步。',
  'Compute Node 執行 slurmd 與 munged，負責實際的計算。',
  'Storage Node 與 Compute Node 之間另有 High-Speed Interconnect，MPI 與平行檔案系統的資料走這一層。',
]" />

---
layout: focus
chapter: Ch 2 · Cluster Architecture
clicks: 3
items:
  - label: 使用者的入口
    title: Login Node
    code: sshd  Slurm client
    text: 使用者登入、編輯程式、編譯，並送出 job。
  - label: 管理整座 cluster
    title: Head Node
    code: slurmctld  slurmdbd  LDAP  NTP
    text: 負責排程、記帳、帳號與時間同步，也稱為 Controller。
  - label: 執行計算
    title: Compute Node
    code: slurmd  munged
    text: 真正執行計算的機器，數量通常最多。
  - label: 共用檔案
    title: Storage Node
    code: NFS  BeeGFS  Lustre
    text: 提供所有 node 共用的檔案系統。
---

# Node Roles

---
layout: definition
chapter: Ch 2 · Cluster Architecture
term: Daemon
kind: TERM
---

在背景持續執行、等待請求的程式，不需要使用者操作，通常開機就自動啟動。一般以 `systemctl` 啟動、停止與查看狀態。

::example::

名稱習慣以 d 結尾：`sshd`、`slurmd`、`munged`。

---
layout: statement
chapter: Ch 2 · Cluster Architecture
---

# 角色是功能上的區分，不一定是實體機器的區分

範例叢集的 `slurm-head` 同時是 login、controller 與 compute。

---
layout: statement
chapter: Ch 2 · Cluster Architecture
---

# 計算一律透過 scheduler 送到 Compute Node

在共用的 Login Node 上執行大量運算，會拖慢所有使用者。

---
layout: focus
chapter: Ch 2 · Cluster Architecture
clicks: 2
items:
  - label: 1GbE、10GbE Ethernet
    title: Management Network
    code: SSH  systemctl  Slurm daemons
    text: SSH、系統管理、監控與安裝部署的流量，每一台 node 都會連接。
  - label: InfiniBand、RoCE
    title: High-Speed Interconnect
    code: MPI  RDMA
    text: node 之間的平行運算通訊，以及存取平行檔案系統，支援 RDMA。
  - label: Optional
    title: BMC Network
    code: IPMI  Redfish
    text: 遠端開關機、查看硬體狀態，即使作業系統當機也能連線。
---

# Cluster 中的三種網路

---
layout: textbook
chapter: Ch 2 · Cluster Architecture
clicks: 3
---

# 網路相關名詞

<div class="deflist">
  <div v-click="1"><b>MPI</b><span>Message Passing Interface，平行程式的通訊標準。一個程式在多台 node 上同時執行多個 process，彼此以 MPI 傳送訊息、交換資料。</span></div>
  <div v-click="2"><b>RDMA</b><span>Remote Direct Memory Access，讓一台機器直接讀寫另一台機器的記憶體，不經過對方的 CPU 與 OS kernel，因此延遲很低。</span></div>
  <div v-click="3"><b>BMC</b><span>Baseboard Management Controller，主機板上獨立的小型控制器，有自己的網路，主機關機或當機時仍能遠端管理。</span></div>
</div>
