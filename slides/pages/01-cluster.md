---
layout: section
number: 1
chapter: Ch 1 · What is a Cluster
---

# What is a Cluster

- **1.1** Cluster 的定義
- **1.2** Scale Up 與 Scale Out
- **1.3** Cluster 的種類

---
layout: statement
chapter: Ch 1 · What is a Cluster
---

# Cluster 是以網路連接、統一管理的多台電腦

多台獨立的電腦透過網路連接，再以軟體統一管理。對使用者而言，整座 cluster 如同一台更大的電腦。

---
layout: definition
chapter: Ch 1 · What is a Cluster
term: Node
kind: TERM
---

Cluster 中的一台獨立電腦。每個 node 都有自己的 CPU、記憶體與作業系統，彼此透過網路交換資料與訊息。

::example::

範例叢集有 2 台 node：`slurm-head` 與 `slurm-compute`，每台 4 個 CPU。

---
layout: compare
chapter: Ch 1 · What is a Cluster
left: Scale Up
right: Scale Out
reveal: true
clicks: 3
rows:
  - [做法, 升級單台機器：更多 CPU、更大記憶體, 增加機器的數量，以網路連接共同計算]
  - [範例, 16 cores、64 GB 升級為 128 cores、1 TB, 每台規格不變，增加 Node 的數量]
  - [限制, 受限於主機板的 socket 數與記憶體插槽，越高階越昂貴, 程式必須能平行化，網路成為新的瓶頸]
---

# 運算能力不足時的兩種擴充方式

---
layout: figure
chapter: Ch 1 · What is a Cluster
clicks: 1
takeaway: Cluster 屬於 Scale Out：一個大問題被切成許多小問題，分配到不同 node 同時計算。
---

# Scale Up 與 Scale Out

<DgScale :captions="[
  'Scale Up：將同一台 Node 從 16 cores、64 GB 升級為 128 cores、1 TB。',
  'Scale Out：每台規格不變，增加 Node 的數量，所有 Node 透過 Network Switch 連接。',
]" />

---
layout: focus
chapter: Ch 1 · What is a Cluster
clicks: 2
items:
  - label: 合併算力
    title: HPC Cluster
    text: 把多台機器的算力合起來，解決一個大型的計算問題，例如氣象模擬、CFD、分子動力學與 AI 訓練。
  - label: 服務不中斷
    title: High Availability Cluster
    text: 一台機器故障時由另一台接手，服務不中斷，例如資料庫的主從備援與 Slurm 的 backup controller。
  - label: 分散請求
    title: Load Balancing Cluster
    text: 把大量的請求分散到多台機器處理，例如 Web server farm 與 CDN。
---

# Cluster 的種類

---
layout: quiz
chapter: Ch 1 · What is a Cluster
question: Q1．Slurm 的 controller 故障時，由另一台 backup controller 接手排程。這屬於哪一種 Cluster 的做法？
clicks: 1
answer: 1
options:
  - HPC Cluster
  - High Availability Cluster
  - Load Balancing Cluster
---

backup controller 的目的是在一台故障時由另一台接手，讓服務不中斷。Ch 9 Production Deployment 會說明它的運作方式與設定。
