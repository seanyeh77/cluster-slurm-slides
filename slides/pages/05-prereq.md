---
layout: section
number: 5
chapter: Ch 5 · Prerequisites
---

# Prerequisites

- **5.1** Slurm 的元件與 Linux 名詞
- **5.2** 時間、帳號與檔案系統
- **5.3** Hostname 與 Authentication
- **5.4** slurm 帳號與開發套件

---
layout: figure
chapter: Ch 5 · Prerequisites
clicks: 2
---

# Slurm 的元件

<DgComponents :captions="[
  '使用者以 sbatch、srun、sinfo 把請求送給 Head Node 上的 slurmctld。',
  'slurmctld 把 job 派送給每台 Compute Node 上的 slurmd。',
  'slurmctld 把記帳資料交給 slurmdbd，由 slurmdbd 寫入 MariaDB。',
]" />

---
layout: textbook
chapter: Ch 5 · Prerequisites
clicks: 2
---

# 安裝時會用到的 Linux 名詞

<div class="deflist">
  <div v-click="1"><b>cgroup</b><span>control group，Linux kernel 的功能。把一組 process 歸在一起，統一限制與統計 CPU、記憶體用量，也能一次清除整組 process。</span></div>
  <div v-click="2"><b>tmpfs</b><span>以記憶體模擬的檔案系統，預設大小為實體記憶體的一半。寫入的檔案會佔用記憶體，重開機後就消失。</span></div>
</div>

---
layout: statement
chapter: Ch 5 · Prerequisites
---

# 所有節點的時鐘、UID 與 GID 必須一致

時間差太多 credential 會過期；UID 不一致會存取不到自己的檔案。

---
layout: figure
chapter: Ch 5 · Prerequisites
takeaway: 共用檔案系統只認 UID 的數字，UID 不同的 alice 在 node2 上會被當成別人。
---

# UID 不一致時的情形

<DgUid class="dg" />

---
layout: compare
chapter: Ch 5 · Prerequisites
left: NIS
right: LDAP
reveal: true
clicks: 2
rows:
  - [特性, 設定簡單，但以明文傳輸, 支援 TLS]
  - [適合, 隔離的教學環境, 正式環境]
---

# 集中管理帳號的兩種方式

---
layout: statement
chapter: Ch 5 · Prerequisites
---

# 安裝 Slurm 前，先讓所有節點共用 home 目錄

job 的輸出檔寫在送出 job 時的工作目錄，compute node 必須看得到。

---
layout: textbook
chapter: Ch 5 · Prerequisites
ltag: /etc/hosts
clicks: 2
---

# 修正 hostname 解析

<ConfigDiff file="/etc/hosts" lang="shell" :rows="[
  ['del', '127.0.1.1 slurm-head'],
  ['add', '10.1.253.75 slurm-head'],
  ['add', '10.1.253.77 slurm-compute'],
]" />

::note::

<Note :notes="[
  '以 getent hosts slurm-head slurm-compute 確認每個節點名稱的解析結果。',
  'Debian 預設把本機名稱對應到 127.0.1.1，slurmd 會連到自己而不是 controller。',
  '在所有節點寫入真實 IP，並移除本機名稱對應 127.0.1.1 的那一行。',
]" />

---
layout: focus
chapter: Ch 5 · Prerequisites
numbered: true
clicks: 2
items:
  - title: 同一把金鑰
    code: /etc/slurm/slurm.key
    text: 所有節點使用同一把金鑰，MUNGE 為 munge.key，auth/slurm 為 slurm.key，擁有者與權限依 plugin 要求設定。
  - title: 先啟動認證服務
    code: munged
    text: 認證所需的服務要在 Slurm daemon 之前啟動，例如使用 MUNGE 時的 munged。
  - title: 設定 AuthType
    code: AuthType=auth/slurm
    text: slurm.conf 與 slurmdbd.conf 的 AuthType 都要設為所選的 plugin。
---

# Authentication 的三項要求

---
layout: textbook
chapter: Ch 5 · Prerequisites
ltag: Terminal
clicks: 3
---

# 產生 auth/slurm 的金鑰

<TerminalTyping :keep="3" :cmds="[
  { c: 'sudo dd if=/dev/urandom of=/etc/slurm/slurm.key bs=1024 count=1' },
  { c: 'sudo chown slurm:slurm /etc/slurm/slurm.key' },
  { c: 'sudo chmod 600 /etc/slurm/slurm.key' },
]" />

::note::

<Note :notes="[
  '',
  '在 controller 產生 1 KB 的隨機金鑰，再複製到所有節點的 /etc/slurm/。',
  '在每個節點把擁有者設為 slurm。',
  '只讓 SlurmUser 讀寫。',
]" />

---
layout: textbook
chapter: Ch 5 · Prerequisites
ltag: Terminal
clicks: 3
---

# 建立 slurm 帳號

<TerminalTyping :keep="3" :cmds="[
  { c: 'getent passwd 981' },
  { c: 'export SLURM_UID=981' },
  { c: 'sudo groupadd -r -g $SLURM_UID slurm' },
]" />

::note::

<Note :notes="[
  '',
  '確認 UID 981 未被使用：沒有輸出即可使用。',
  '每個節點使用相同的 UID。建議選 1000 以下，避免與一般使用者撞號。',
  '-r：系統群組。-g：指定固定的 GID。',
]" />

---
layout: figure
chapter: Ch 5 · Prerequisites
clicks: 4
---

# useradd 的參數

<AnnotatedCommand :size="24" :parts="[
  { t: 'sudo' },
  { t: 'useradd' },
  { t: '-r', label: '系統帳號', h: 40 },
  { t: '-u $SLURM_UID -g slurm', label: '固定的 UID 與群組', h: 110 },
  { t: '-d /var/lib/slurm' },
  { t: '-M', label: '不建立家目錄', h: 40 },
  { t: '-s /usr/sbin/nologin', label: '禁止登入', h: 110 },
  { t: '-c &quot;Slurm workload manager&quot;' },
  { t: 'slurm' },
]" />

---
layout: compare
chapter: Ch 5 · Prerequisites
left: 真人使用者
right: 服務帳號
reveal: true
clicks: 3
rows:
  - [例子, 學生、管理員, 'slurm、munge、slurmrestd、mysql']
  - [位置, 目錄服務，例如 LDAP, 各節點本機，固定 UID]
  - [原因, 需要登入、改密碼，帳號經常增減, daemon 開機就要啟動，不能依賴網路服務]
---

# 叢集中的兩類帳號

---
layout: focus
chapter: Ch 5 · Prerequisites
clicks: 2
items:
  - label: 原因 1
    title: 開機順序
    text: munged、slurmd 開機時就要以服務帳號啟動。若帳號在 LDAP 而網路尚未就緒，daemon 會因查不到帳號而啟動失敗。
  - label: 原因 2
    title: 故障範圍
    text: LDAP 故障時只有使用者暫時無法登入；若服務帳號也在 LDAP，整個排程系統都會停擺。
  - label: 原因 3
    title: 不需集中管理
    text: 服務帳號沒有密碼、不會登入，建立後幾乎不會更動；各節點以相同指令建立即可讓 UID 一致。
---

# 服務帳號不放進 LDAP

---
layout: reference
chapter: Ch 5 · Prerequisites
---

# 編譯用的開發套件

| 開發套件 | 產生的 plugin | 用途 |
| --- | --- | --- |
| `libmariadb-dev` | `accounting_storage/mysql` | slurmdbd 連線資料庫 |
| `libpmix-dev` | `mpi/pmix` | 以 PMIx 啟動 MPI 程式，選用 |
| `libmunge-dev` | `auth/munge` | 使用 MUNGE 認證時 |

部分 plugin 只有在打包時已安裝對應的開發套件才會產生；打包後才補裝，必須重新打包。
