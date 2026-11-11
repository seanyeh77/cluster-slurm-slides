---
layout: section
number: 5
chapter: Ch 5 · Production Deployment
---

# Production Deployment

- **9.1** 三層架構
- **9.2** slurmctld 與 slurmdbd 的備援
- **9.3** Partition 規劃
- **9.4** Login Node

---
layout: figure
chapter: Ch 5 · Production Deployment
clicks: 2
---

# 正式環境的三層架構

<DgProd :captions="[
  'Access Layer：多台 Login Node 共用 login.cluster 這個 VIP，任何一台維護時使用者仍連得進來。',
  'Control Layer：head1 執行 primary，head2 執行 backup，兩者共用 StateSaveLocation 與 MariaDB。',
  'Compute Layer：依用途把 node 分成不同的 partition。',
]" />

---
layout: textbook
chapter: Ch 5 · Production Deployment
clicks: 2
---

# 備援相關名詞

<div class="deflist">
  <div v-click="1"><b>Heartbeat</b><span>兩台機器之間定期傳送的小訊息，用來確認對方仍在運作；超過一段時間收不到回應，即判定對方故障。</span></div>
  <div v-click="2"><b>Active-standby</b><span>一台提供服務，另一台只待命，active 故障時才由 standby 接手；不同於兩台同時分擔工作的 active-active。</span></div>
</div>

---
layout: textbook
chapter: Ch 5 · Production Deployment
clicks: 3
---

# slurmctld 的 active-standby 備援

<MotionCanvas src="motion/index.html" scene="failover" :steps="3" />

::note::

<Note :notes="[
  '',
  'head1 寫入狀態；head2 以 heartbeat 確認 head1 仍在運作。',
  'head1 超過 SlurmctldTimeout 秒沒有回應時，head2 判定它故障；預設為 120 秒。',
  'head2 讀取最後的狀態接手；執行中的 job 不受影響，因為 job 由 slurmd 執行。',
]" />

---
layout: textbook
chapter: Ch 5 · Production Deployment
ltag: slurm.conf
clicks: 3
---

# 設定 slurmctld 備援

```shell {all|1-2|3|4}
SlurmctldHost=head1
SlurmctldHost=head2
SlurmctldTimeout=120
StateSaveLocation=/shared/slurmctld
```

::note::

<Note :notes="[
  '所有節點的 slurm.conf 都要加上，順序必須相同。',
  '第一行為 primary，第二行起為 backup。',
  '設太短時，primary 只是短暫忙碌也會被誤判為故障。',
  '兩台 controller 共用、擁有者為 slurm 的狀態目錄。',
]" />

---
layout: textbook
chapter: Ch 5 · Production Deployment
ltag: Terminal
clicks: 3
---

# 測試切換

<TerminalTyping :keep="3" :cmds="[
  { c: 'scontrol ping', o: 'Slurmctld(primary) at head1 is UP\nSlurmctld(backup) at head2 is UP' },
  { c: 'sudo systemctl stop slurmctld' },
  { c: 'scontrol ping', o: 'Slurmctld(primary) at head1 is DOWN\nSlurmctld(backup) at head2 is UP' },
]" />

::note::

<Note :notes="[
  '',
  '兩台 controller 都在運作。',
  '在 head1 停止 slurmctld，模擬 primary 故障。',
  '等待超過 SlurmctldTimeout 後，backup 已經接手。計畫性維護時可改用 scontrol takeover 立即切換。',
]" />

---
layout: statement
chapter: Ch 5 · Production Deployment
---

# StateSaveLocation 不能成為新的單點故障

兩台 controller 共用的狀態目錄，要放在本身有備援的儲存上。

---
layout: compare
chapter: Ch 5 · Production Deployment
left: slurm.conf
right: slurmdbd.conf
reveal: true
clicks: 2
rows:
  - [設定, '<code>AccountingStorageHost=head1</code><br><code>AccountingStorageBackupHost=head2</code>', '<code>DbdHost=head1</code><br><code>DbdBackupHost=head2</code><br><code>StorageHost=db1</code>']
  - [作用, slurmctld 連不上 primary 時，改送到 backup, 兩台 slurmdbd 各自知道自己是 primary 或 backup，並寫入同一個 MariaDB]
---

# slurmdbd 的備援

---
layout: statement
chapter: Ch 5 · Production Deployment
---

# slurmdbd 可以短暫停止，但不能停太久

記帳紀錄暫存在 slurmctld，超過 `MaxDBDMsgs` 筆就會被丟棄。

---
layout: reference
chapter: Ch 5 · Production Deployment
---

# Partition 規劃：16 台 CPU node 加 4 台 GPU node

| Partition | 用途 | Node | Node 數 (台) | MaxTime (小時) | DefaultTime (分) |
| --- | --- | --- | ---: | ---: | ---: |
| `debug` | 快速測試與除錯 | cpu01、cpu02 | 2 | 0.5 | 10 |
| `cpu` | 一般計算，預設 | cpu01 到 cpu16 | 16 | 48 | 60 |
| `gpu` | 需要 GPU 的計算 | gpu01 到 gpu04 | 4 | 48 | 60 |

debug 的 MaxTime 短、`PriorityTier` 較高，排隊時間短；cpu01、cpu02 同時屬於 debug 與 cpu，不會閒置。

---
layout: figure
chapter: Ch 5 · Production Deployment
ltag: slurm.conf
takeaway: Gres=gpu:4 宣告每台 4 張 GPU，還需在 gres.conf 指定裝置檔；新增或修改 node 定義後，重啟 slurmctld 與所有 slurmd。
---

# 設定 Partition

```shell
GresTypes=gpu
NodeName=cpu[01-16] CPUs=64 RealMemory=250000
NodeName=gpu[01-04] CPUs=64 RealMemory=500000 Gres=gpu:4
PartitionName=debug Nodes=cpu[01-02] MaxTime=00:30:00 DefaultTime=00:10:00 \
    MaxNodes=2 PriorityTier=10 State=UP
PartitionName=cpu Nodes=cpu[01-16] Default=YES MaxTime=2-00:00:00 \
    DefaultTime=01:00:00 State=UP
PartitionName=gpu Nodes=gpu[01-04] MaxTime=2-00:00:00 \
    DefaultTime=01:00:00 State=UP
```

---
layout: reference
chapter: Ch 5 · Production Deployment
---

# Partition 參數

| 參數 | 說明 |
| --- | --- |
| `MaxTime` | 單一 job 的最長執行時間，超過會被強制結束 |
| `DefaultTime` | job 未指定 `--time` 時使用的時間；未設定時直接使用 MaxTime，backfill 就很難排進空檔 |
| `MaxNodes` | 單一 job 最多可以使用的 node 數，單位為台 |
| `PriorityTier` | 數值越大越先排程，預設 1 |

`MaxTime` 的格式為 `時:分:秒` 或 `天-時:分:秒`，例如 `00:30:00` 是 30 分、`2-00:00:00` 是 2 天。

---
layout: textbook
chapter: Ch 5 · Production Deployment
ltag: 50-login-limits.conf
clicks: 4
---

# 限制每位使用者在 Login Node 上的資源

```ini {all|2|3|4|5}
[Slice]
CPUQuota=200%
MemoryMax=8G
MemorySwapMax=0
TasksMax=512
```

::note::

<Note :notes="[
  '寫入 /etc/systemd/system/user-.slice.d/，對每位使用者的 user-UID.slice 生效。',
  'CPUQuota：200% 為 2 個 core。',
  'MemoryMax：超過時該使用者的 process 會被 OOM kill。',
  'MemorySwapMax=0：避免大量 swap 拖慢整台機器。',
  'TasksMax：process 與 thread 數上限，可防止 fork bomb。',
]" />

---
layout: statement
chapter: Ch 5 · Production Deployment
---

# 以 VIP 讓多台 Login Node 共用一個位址

keepalived 以 VRRP 決定由哪一台持有 VIP，故障時在數秒內轉移。
