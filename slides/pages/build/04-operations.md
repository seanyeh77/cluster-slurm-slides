---
layout: section
number: 4
chapter: Ch 4 · Configuration and Operations
---

# Configuration and Operations

- **8.1** slurm.conf 的重要參數
- **8.2** 節點的硬體規格
- **8.3** 套用設定與恢復節點

---
layout: reference
chapter: Ch 4 · Configuration and Operations
---

# slurm.conf 的重要參數

| 參數 | 說明 |
| --- | --- |
| `SlurmctldHost` | controller 的短 hostname；可列多行，第一行為主要，其餘為備援 |
| `SlurmctldPort`、`SlurmdPort` | slurmctld、slurmd 監聽的 port，預設 6817、6818 |
| `SlurmctldTimeout` | 備援 controller 等待主要 controller 回應的秒數，預設 120 秒 |
| `ReturnToService` | `0` 手動恢復；`1` 因無回應而 DOWN 的節點自動恢復；`2` 設定正確即自動恢復 |
| `LaunchParameters` | `use_interactive_step`：salloc 的 shell 直接開在第一台分配到的 node |
| `TreeWidth` | 每個 slurmd 最多轉發給幾個子節點，預設 16 個 |

---
layout: textbook
chapter: Ch 4 · Configuration and Operations
clicks: 4
---

# TreeWidth 的樹狀轉發

<MotionCanvas src="motion/index.html" scene="treeWidth" :steps="4" />

::note::

<Note :notes="[
  '',
  'slurmctld 只直接傳給 16 個 slurmd。',
  '每個 slurmd 再轉發給最多 16 個，共 256 個。',
  '以預設的 TreeWidth=16 為例，3 次轉發就能涵蓋超過 4000 個節點。',
  '不轉發時，slurmctld 必須自己送出 4096 份訊息。',
]" />

---
layout: textbook
chapter: Ch 4 · Configuration and Operations
ltag: Terminal
clicks: 1
---

# 取得節點的硬體規格

<TerminalTyping :keep="1" :cmds="[
  { c: 'sudo slurmd -C', o: 'NodeName=slurm-head CPUs=4 ... RealMemory=3921\nUpTime=19-22:07:58' },
]" />

::note::

<Note :notes="[
  '',
  '在每個 compute node 分別執行。... 省略了 CPU 拓撲欄位，完整內容與 Ch 3 的 NodeName=DEFAULT 相同。第一行可直接貼進 slurm.conf，UpTime 不屬於設定。',
]" />

---
layout: statement
chapter: Ch 4 · Configuration and Operations
---

# /tmp 為 tmpfs 時，不要以它的大小填 TmpDisk

tmpfs 是記憶體，會與 `RealMemory` 重複計算；改把 `TmpFS` 指向實體磁碟。

---
layout: reference
chapter: Ch 4 · Configuration and Operations
---

# 修改設定後的生效方式

| 生效方式 | 修改內容 |
| --- | --- |
| `sudo scontrol reconfigure` | 一般參數，例如 partition 限制、`Priority*` 權重 |
| 重啟 slurmctld 與所有 slurmd | 節點定義、`TmpFS`、port、`AuthType`、各類 plugin |
| 重啟 slurmdbd | `slurmdbd.conf` |
| 重啟對應節點的 slurmd | `gres.conf`、`cgroup.conf` |

修改前先把 slurm.conf 同步到所有節點；三個 daemon 都要重啟時，依 slurmdbd、slurmctld、slurmd 的順序。

---
layout: textbook
chapter: Ch 4 · Configuration and Operations
ltag: Terminal
clicks: 2
---

# 查看節點狀態並恢復上線

<TerminalTyping :keep="2" :cmds="[
  { c: 'scontrol show node slurm-compute', o: 'NodeName=slurm-compute CoresPerSocket=4\n   ...\n   NodeAddr=10.1.253.77 NodeHostName=slurm-compute\n   RealMemory=3921 AllocMem=0 FreeMem=N/A Sockets=1 Boards=1\n   State=UNKNOWN+NOT_RESPONDING ThreadsPerCore=1 TmpDisk=20000\n   ...' },
  { c: 'sudo scontrol update NodeName=slurm-compute State=RESUME' },
]" />

::note::

<Note :notes="[
  '',
  '節點為 DOWN 或 INVALID 時，原因顯示在 Reason 欄位。輸出只保留與狀態相關的幾行。',
  '修正設定並重啟 slurmd 後，將節點恢復上線。',
]" />
