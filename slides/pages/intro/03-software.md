---
layout: section
number: 3
chapter: Ch 3 · Cluster Software Stack
---

# Cluster Software Stack

- **3.1** Shared File System
- **3.2** Workload Manager
- **3.3** Software Environment

---
layout: focus
chapter: Ch 3 · Cluster Software Stack
clicks: 3
items:
  - label: 每台機器看到同一份資料
    title: Shared File System
    code: NFS  BeeGFS  Lustre
    text: 使用者在 Login Node 寫好的程式與資料，Compute Node 也必須看得到。
  - label: 程式在哪一台執行、執行多久
    title: Workload Manager
    code: Slurm  PBS Pro
    text: 分配資源、排程 job，並在結束後回收資源。
  - label: 每台機器的軟體環境一致
    title: Environment Management
    code: Spack  Lmod
    text: 管理編譯器、MPI 與函式庫的多個版本，讓使用者切換。
  - label: 平行程式之間的溝通
    title: Message Passing
    code: Open MPI  Intel MPI
    text: 讓多台 node 上的 process 交換資料。
---

# 使用 Cluster 時會接觸的軟體

---
layout: compare
chapter: Ch 3 · Cluster Software Stack
left: NFS
right: BeeGFS、Lustre
reveal: true
clicks: 3
rows:
  - [架構, 一台 server 分享目錄給其他 node, 檔案切成 chunk，分散到多台 storage node]
  - [效能, 所有 I/O 都經過同一台 server，規模一大即成為瓶頸, client 同時從多台讀寫，提供高吞吐量]
  - [適合, 小型 cluster 與 home 目錄, 大量資料的平行讀寫]
---

# NFS 與平行檔案系統

---
layout: textbook
chapter: Ch 3 · Cluster Software Stack
clicks: 3
---

# 檔案系統相關名詞

<div class="deflist">
  <div v-click="1"><b>Metadata</b><span>描述檔案的資料，例如檔名、目錄結構、大小、權限、修改時間，以及檔案內容存在哪些位置。</span></div>
  <div v-click="2"><b>Chunk</b><span>平行檔案系統把大檔案切成固定大小的區塊，每一塊分別存放在不同的 storage node。</span></div>
  <div v-click="3"><b>Throughput</b><span>吞吐量，單位時間內能傳輸的資料量，例如 GB/s。</span></div>
</div>

---
layout: figure
chapter: Ch 3 · Cluster Software Stack
clicks: 1
takeaway: metadata 與實際資料分開，由不同服務處理，資料不必全部經過同一台 server。
---

# 平行檔案系統的讀寫流程

<DgPfs :captions="[
  'Client 先向 Metadata Service 查詢各個 chunk 存在哪裡。',
  '接著直接對 4 台 Storage Node 同時讀寫 Chunk 1 到 Chunk 4。',
]" />

---
layout: statement
chapter: Ch 3 · Cluster Software Stack
---

# home 放在 NFS，scratch 放在平行檔案系統

home 需要個人 quota；scratch 重視速度，通常不備份。

---
layout: focus
chapter: Ch 3 · Cluster Software Stack
numbered: true
clicks: 3
items:
  - title: 資源分配
    text: 決定誰的 job 可以使用哪幾台 node，以及多少 CPU、記憶體與 GPU。
  - title: 排程
    text: 資源不足時讓 job 排隊，依優先權與策略決定執行順序，例如 backfill。
  - title: 執行與監控
    text: 在分配到的 node 上啟動程式，追蹤狀態，結束後回收資源。
  - title: 記帳
    text: Accounting，記錄每個使用者使用了多少資源。
---

# Workload Manager 的職責

---
layout: textbook
chapter: Ch 3 · Cluster Software Stack
clicks: 3
---

# 排程相關名詞

<div class="deflist">
  <div v-click="1"><b>Job</b><span>交給 scheduler 執行的一個工作，包含要執行的程式，以及需要多少 node、CPU、記憶體和時間。</span></div>
  <div v-click="2"><b>Partition</b><span>把 node 分組，每個 partition 可以有不同的限制，例如最長執行時間，類似不同的排隊窗口。</span></div>
  <div v-click="3"><b>Backfill</b><span>大 job 等待資源時，若短 job 能在大 job 開始前完成，就先讓短 job 執行，填滿空檔，且不延後大 job 的開始時間。</span></div>
</div>

---
layout: figure
chapter: Ch 3 · Cluster Software Stack
clicks: 4
---

# Backfill 的排程方式

<DgBackfill :captions="[
  'Job A 在 node01、node02 上執行到 3h，node03、node04 目前閒置。',
  'Job B 需要 4 台 node，必須等 Job A 在 3h 結束後才能開始。',
  'Job C 只需要 2 小時，能在 Job B 開始前完成，因此被 backfill 進空檔。',
  'Job D 排在 Job B 之後執行。',
  '沒有 backfill 時，Job C 只能排在 Job B 之後，node03、node04 在前 3 小時閒置。',
]" />

---
layout: reference
chapter: Ch 3 · Cluster Software Stack
---

# Slurm 的主要元件

| 元件 | 執行位置 | 功能 |
| --- | --- | --- |
| `slurmctld` | Head Node | 中央控制器，負責排程與管理所有 node 的狀態 |
| `slurmd` | 每一台 Compute Node | 接收指令，在本機啟動與監控 job |
| `slurmdbd` | DBD Node，常與 Head Node 合併 | 把記帳資料寫進 MySQL 或 MariaDB |

---
layout: figure
chapter: Ch 3 · Cluster Software Stack
clicks: 2
---

# 一個 job 的流程

<DgJobFlow :captions="[
  '使用者在 Login Node 以 sbatch 送出 job。',
  'Head Node 的 slurmctld 排程後，把 job 派送給 Compute Node 的 slurmd。',
  'job 的輸出寫到 Shared Storage 上的 slurm-42.out。',
]" />

---
layout: statement
chapter: Ch 3 · Cluster Software Stack
---

# 以 Spack 建置軟體，以 module load 切換環境

Spack 讓編譯器與函式庫的多個版本共存，Lmod 讓使用者切換。
