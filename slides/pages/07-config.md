---
layout: section
number: 7
chapter: Ch 7 · Example Configuration
---

# Example Configuration

- **7.1** slurm.conf
- **7.2** slurmdbd.conf
- **7.3** 啟動與驗證

---
layout: statement
chapter: Ch 7 · Example Configuration
---

# 範例設定對應 2 台機器的叢集

`slurm-head` 兼任 controller、DBD 與 compute，認證使用 `auth/slurm`。

---
layout: textbook
chapter: Ch 7 · Example Configuration
ltag: slurm.conf
clicks: 5
---

# slurm.conf：基本設定

<div class="code-md">

```shell {all|1-2|3-4|5|6-8|9-15}
ClusterName=cluster
SlurmctldHost=slurm-head
AuthType=auth/slurm
SlurmUser=slurm
MailProg=/bin/true
MpiDefault=pmi2
ProctrackType=proctrack/cgroup
TaskPlugin=task/affinity,task/cgroup
ReturnToService=1
SlurmctldPidFile=/var/run/slurmctld.pid
SlurmdPidFile=/var/run/slurmd.pid
SlurmdSpoolDir=/var/spool/slurmd
StateSaveLocation=/var/spool/slurmctld
SlurmctldLogFile=/var/log/slurm/slurmctld.log
SlurmdLogFile=/var/log/slurm/slurmd.log
```

</div>

::note::

<Note :notes="[
  '在所有節點建立 /etc/slurm/slurm.conf，內容完全相同。',
  'SlurmctldHost：controller 的短 hostname，與 hostname -s 相同。',
  'AuthType：認證 plugin。SlurmUser：執行 daemon 的帳號。',
  'MailProg：不寄通知信時設為 /bin/true。',
  'ProctrackType、TaskPlugin：以 cgroup 追蹤與限制 job 的 process。',
  'ReturnToService=1：因無回應而 DOWN 的節點，重新註冊時自動恢復。其餘為 PID、spool、state 與 log 的路徑。',
]" />

---
layout: textbook
chapter: Ch 7 · Example Configuration
ltag: slurm.conf
clicks: 2
---

# slurm.conf：排程與記帳

```shell {all|1-3|4-8}
# SCHEDULING
SchedulerType=sched/backfill
SelectType=select/cons_tres
# ACCOUNTING
AccountingStorageType=accounting_storage/slurmdbd
AccountingStorageHost=slurm-head
AccountingStoragePort=6819
JobAcctGatherType=jobacct_gather/linux
```

::note::

<Note :notes="[
  '接續上一頁，同一份檔案的中段。',
  'backfill 讓小 job 利用空檔；cons_tres 讓一台節點同時執行多個 job。',
  '記帳交給 slurm-head 上的 slurmdbd，port 與 slurmdbd.conf 的 DbdPort 相同。',
]" />

---
layout: figure
chapter: Ch 7 · Example Configuration
ltag: slurm.conf
takeaway: 硬體欄位以各節點 sudo slurmd -C 的結果為準；debug 是包含所有節點的預設 partition。
---

# slurm.conf：節點與 partition

<div class="code-wide">

```shell
# COMPUTE NODES
NodeName=DEFAULT CPUs=4 Boards=1 SocketsPerBoard=1 CoresPerSocket=4 ThreadsPerCore=1 RealMemory=3500 State=UNKNOWN
NodeName=slurm-head NodeAddr=10.1.253.75
NodeName=slurm-compute NodeAddr=10.1.253.77
# PARTITIONS
PartitionName=debug Nodes=ALL Default=YES MaxTime=INFINITE State=UP
```

</div>

---
layout: textbook
chapter: Ch 7 · Example Configuration
ltag: slurmdbd.conf
clicks: 3
---

# slurmdbd.conf

```shell {all|2-3|8-13|12}
AuthType=auth/slurm
DbdHost=localhost
DbdPort=6819
SlurmUser=slurm
DebugLevel=info
LogFile=/var/log/slurm/slurmdbd.log
PidFile=/run/slurmdbd/slurmdbd.pid
StorageType=accounting_storage/mysql
StorageHost=localhost
StoragePort=3306
StorageUser=slurm
StoragePass=password
StorageLoc=slurm_acct_db
```

::note::

<Note :notes="[
  '只在 DBD 節點建立 /etc/slurm/slurmdbd.conf。',
  'slurmdbd 監聽的位置，與 slurm.conf 的 AccountingStoragePort 相同。',
  '連線到建立 accounting database 時的 MariaDB 帳號。',
  'StoragePass 換成建立資料庫帳號時的密碼。',
]" />

---
layout: textbook
chapter: Ch 7 · Example Configuration
ltag: Terminal
clicks: 2
---

# 保護 slurmdbd.conf

<TerminalTyping :keep="2" :cmds="[
  { c: 'sudo chown slurm:slurm /etc/slurm/slurmdbd.conf' },
  { c: 'sudo chmod 600 /etc/slurm/slurmdbd.conf' },
]" />

::note::

<Note :notes="[
  '',
  '檔案中有資料庫密碼，擁有者必須是 slurm。',
  '權限不是 600 時，slurmdbd 會拒絕啟動。',
]" />

---
layout: focus
chapter: Ch 7 · Example Configuration
numbered: true
clicks: 2
items:
  - title: slurmdbd
    code: sudo systemctl enable --now slurmdbd
    text: 在 DBD 節點啟動。slurmctld 啟動時要先向它註冊。
  - title: slurmctld
    code: sudo systemctl enable --now slurmctld
    text: 在 controller 啟動。slurmd 啟動時要連線到它。
  - title: slurmd
    code: sudo systemctl enable --now slurmd
    text: 在每個 compute node 啟動。
---

# 依上下游順序啟動 daemon

---
layout: textbook
chapter: Ch 7 · Example Configuration
ltag: Terminal
clicks: 3
---

# 驗證叢集

<TerminalTyping :keep="3" :cmds="[
  { c: 'scontrol ping' },
  { c: 'sinfo -N -l' },
  { c: 'srun -N 2 hostname', o: 'slurm-compute\nslurm-head' },
]" />

::note::

<Note :notes="[
  '',
  '確認 controller 正常回應（輸出省略）。',
  '列出節點狀態，State 為 idle 代表可接收 job（輸出省略）。',
  '送出測試 job。叢集可以運作後，即可使用 Ch 4 的指令。',
]" />
