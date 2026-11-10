---
layout: section
number: 4
chapter: Ch 4 · Submit Your First Job
---

# Submit Your First Job

- **4.1** 查看 Cluster 狀態
- **4.2** srun 與 sbatch
- **4.3** Job Steps
- **4.4** salloc

---
layout: statement
chapter: Ch 4 · Submit Your First Job
---

# 範例叢集：slurm-head 與 slurm-compute

指令清單：`seanyeh77.github.io/cluster-slurm-slides/commands.html`

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
ltag: Terminal
clicks: 1
---

# 查看 partition 與 node

<TerminalTyping :keep="1" :cmds="[
  { c: 'sinfo', o: 'PARTITION AVAIL  TIMELIMIT  NODES  STATE NODELIST\ndebug*       up   infinite      2   idle slurm-compute,slurm-head' },
]" />

::note::

<Note :notes="[
  '',
  'debug*：* 表示預設的 partition。STATE：node 目前的狀態。',
]" />

---
layout: reference
chapter: Ch 4 · Submit Your First Job
---

# Node 的狀態

| STATE | 意義 |
| --- | --- |
| `idle` | 閒置中，可以接收 job |
| `alloc` | 整台都已分配給 job |
| `mix` | 部分 CPU 已分配、部分閒置 |
| `drain` | 管理員暫停派送新 job 給這台，通常是為了維修 |
| `down` | 無法使用，例如 `slurmd` 沒有回應 |

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
ltag: Terminal
clicks: 1
---

# 以 srun 執行互動式 job

<TerminalTyping :keep="1" :cmds="[
  { c: 'srun -N 2 hostname', o: 'slurm-compute\nslurm-head' },
]" />

::note::

<Note :notes="[
  '',
  '-N 2：使用 2 台 node，各執行一次 hostname。srun 會等 job 結束才回到 shell，適合快速測試。',
]" />

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
ltag: hello.sh
clicks: 7
---

# 撰寫 job script

```bash {all|2|3|4|5|6|7|9}
#!/bin/bash
#SBATCH --job-name=hello
#SBATCH --partition=debug
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=1
#SBATCH --time=00:05:00
#SBATCH --output=hello_%j.out

srun hostname
```

::note::

<Note :notes="[
  '以 vim hello.sh 建立檔案。#SBATCH 開頭的行是給 Slurm 的選項。',
  '--job-name：job 的名稱，顯示在 squeue 中。',
  '--partition：送到哪個 partition。',
  '--nodes：需要幾台 node。',
  '--ntasks-per-node：每台 node 執行幾個 task。',
  '--time：最長執行時間，超過會被強制結束。',
  '--output：輸出檔的位置，%j 會換成 job ID。',
  'srun：在分配到的 node 上執行 hostname。',
]" />

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
ltag: Terminal
clicks: 3
---

# 以 sbatch 送出 batch job

<TerminalTyping :keep="3" :cmds="[
  { c: 'sbatch hello.sh', o: 'Submitted batch job 42' },
  { c: 'squeue -u $USER' },
  { c: 'cat hello_42.out' },
]" />

::note::

<Note :notes="[
  '',
  'sbatch：送出 job 後立即回到 shell，job 在背景排隊與執行。',
  'squeue -u $USER：查看自己排隊中與執行中的 job（輸出省略）。',
  'cat hello_42.out：job 結束後查看輸出檔（輸出省略）。',
]" />

---
layout: statement
chapter: Ch 4 · Submit Your First Job
---

# `--time` 估得越準，越有機會提早執行

backfill 依 `--time` 把短 job 排進大 job 等待的空檔。

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
clicks: 3
---

# Job Allocation 與 Job Step

<div class="deflist">
  <div v-click="1"><b>Allocation</b><span>Slurm 分配給一個 job 的資源，包含哪幾台 node、多少 CPU 與記憶體，在 job 結束前都保留給它使用。</span></div>
  <div v-click="2"><b>Job Step</b><span>在 allocation 中執行的一組 task。每執行一次 srun 就產生一個 step，編號依序為 42.0、42.1。</span></div>
  <div v-click="3"><b>Batch Host</b><span>allocation 中的第一台 node，負責執行 batch script 本身。</span></div>
</div>

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
ltag: steps.sh
clicks: 3
---

# 一個 job 中的兩個 step

```bash {all|7|8|9}
#!/bin/bash
#SBATCH --job-name=steps
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=4
#SBATCH --time=00:05:00

hostname           # 只在 batch host 執行一次
srun hostname      # step 0：預設用滿整塊 allocation，共 8 個 task
srun -n 2 hostname # step 1：只用其中 2 個 task
```

::note::

<Note :notes="[
  '以 vim steps.sh 建立檔案。allocation 為 2 台 node，每台 4 個 task。',
  '沒有 srun：只在 batch host 執行。',
  'srun 不需要再寫一次資源數量，會繼承 allocation 的設定。',
  'srun -n 2：只使用 allocation 中的 2 個 task。',
]" />

---
layout: figure
chapter: Ch 4 · Submit Your First Job
clicks: 3
---

# steps.sh 使用的資源

<DgSteps :captions="[
  'sbatch 先向 Slurm 要一塊資源：2 台 node，每台 4 個 task。',
  'script 本身只在 batch host，也就是 slurm-compute 上執行。',
  'step 0：srun 用滿整塊 allocation，共 8 個 task。',
  'step 1：srun -n 2 只使用其中 2 個 task。',
]" />

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
ltag: Terminal
clicks: 1
---

# steps.sh 的輸出

<TerminalTyping :keep="1" :cmds="[
  { c: 'cat slurm-44.out', o: 'slurm-compute\nslurm-compute\nslurm-compute\nslurm-compute\nslurm-compute\nslurm-head\nslurm-head\nslurm-head\nslurm-head\nslurm-compute\nslurm-compute' },
]" />

::note::

<Note :notes="[
  '',
  '第 1 行來自 script 本身；接著 8 行為 step 0；最後 2 行為 step 1。',
]" />

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
ltag: Terminal
clicks: 1
---

# 以 sacct 查看每個 step

<TerminalTyping :keep="1" :cmds="[
  { c: 'sacct -j 44', o: 'JobID           JobName  Partition    Account  AllocCPUS      State ExitCode\n------------ ---------- ---------- ---------- ---------- ---------- --------\n44                steps      debug    student          8  COMPLETED      0:0\n44.batch          batch               student          4  COMPLETED      0:0\n44.0           hostname               student          8  COMPLETED      0:0\n44.1           hostname               student          2  COMPLETED      0:0' },
]" />

::note::

<Note :notes="[
  '',
  '44.batch：script 本身。44.0、44.1：兩個 step，各自記錄使用的 CPU 數。',
]" />

---
layout: quiz
chapter: Ch 4 · Submit Your First Job
question: Q2．第 8 行改成不加 srun 的 hostname，會輸出幾行？
clicks: 1
answer: 1
options:
  - 8 行：2 台 node 各輸出 4 行
  - 1 行：只在 batch host 執行
  - 0 行：沒有 srun 就不會執行
---

沒有 srun 的指令和第 7 行一樣，只在 batch host 執行一次，另一台 node 完全沒有用到。要在所有分配到的 node 上執行，必須透過 srun。

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
ltag: Bash
clicks: 2
---

# 在同一個 allocation 中同時執行多個 step

```bash {all|1-2|3}
srun -n 2 --exact ./a.out &
srun -n 2 --exact ./a.out &
wait
```

::note::

<Note :notes="[
  './a.out：gcc 編譯時未指定檔名所產生的執行檔，./ 表示目前目錄。',
  '每個 srun 都寫明只使用多少資源，否則第一個 step 會用滿整塊 allocation。',
  'wait：等待所有背景執行的 step 結束。',
]" />

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
ltag: preprocess.sh
clicks: 2
---

# 以 dependency 串接 job

```bash {all|5|6}
#!/bin/bash
#SBATCH --job-name=preprocess
#SBATCH --time=00:30:00

srun ./preprocess
sbatch --dependency=afterok:$SLURM_JOB_ID train.sh
```

::note::

<Note :notes="[
  'script 中的 sbatch 會送出一個全新的 job，重新排隊，不使用原本 job 的資源。',
  '前處理以 srun 執行。',
  'afterok:&amp;lt;jobid&amp;gt;：指定的 job 成功結束後，train.sh 才能開始。',
]" />

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
ltag: Terminal
clicks: 3
---

# 以 salloc 取得互動式資源

<TerminalTyping :keep="3" :cmds="[
  { c: 'salloc -N 2 --ntasks-per-node=4 -t 00:30:00', o: 'salloc: Pending job allocation 45\nsalloc: job 45 queued and waiting for resources\nsalloc: job 45 has been allocated resources\nsalloc: Granted job allocation 45' },
  { c: 'hostname', o: 'slurm-head' },
  { c: 'srun hostname', o: 'slurm-compute\nslurm-compute\n...\nslurm-head' },
]" />

::note::

<Note :notes="[
  '',
  '向 Slurm 要 2 台 node、每台 4 個 task、30 分鐘。',
  '取得的 shell 仍在下指令的 login node 上。',
  'srun：在分配到的 node 上執行，共 8 行，省略中間 5 行。',
]" />

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
ltag: Terminal
clicks: 4
---

# 進入分配到的 node 後歸還資源

<TerminalTyping :keep="4" :cmds="[
  { c: 'echo $SLURM_JOB_NODELIST', o: 'slurm-compute,slurm-head' },
  { c: 'ssh slurm-compute', after: '[alice@slurm-compute ~]$ ' },
  { c: 'exit', p: '[alice@slurm-compute ~]$ ' },
  { c: 'exit', o: 'salloc: Relinquishing job allocation 45' },
]" />

::note::

<Note :notes="[
  '',
  '查看這個 allocation 取得哪些 node。',
  '多數 cluster 啟用 pam_slurm_adopt：只有在該 node 上有 job 才能 SSH 進去，且只能使用 job 分配到的資源。',
  '離開 SSH 連線。',
  '離開 salloc 的 shell，歸還資源。',
]" />

---
layout: focus
chapter: Ch 4 · Submit Your First Job
numbered: true
clicks: 4
items:
  - title: 送出請求
    code: salloc
    text: 向 slurmctld 要資源，和其他 job 一樣排隊，等待期間終端機會停住。
  - title: 取得資源
    code: SLURM_JOB_NODELIST
    text: Slurm 分配 node、產生 job ID，並設定 SLURM_JOB_ID、SLURM_NTASKS 等環境變數。
  - title: 開啟 shell
    code: hostname
    text: 預設這個 shell 仍在下指令的 login node 上，不會自動跳到 compute node。
  - title: 使用資源
    code: srun
    text: 每執行一次 srun 就是一個 job step，不能超過已取得的資源；也可以 ssh 進入分配到的 node。
  - title: 釋放資源
    code: exit
    text: 離開 shell 或時間（-t）到期時回收資源；到期時仍在執行的 step 會被強制結束。
---

# salloc 的流程

---
layout: statement
chapter: Ch 4 · Submit Your First Job
---

# 常見錯誤：在 salloc 的 shell 中直接執行程式

salloc 的 shell 在 login node 上，以 `srun` 才會在分配到的 node 執行。

---
layout: reference
chapter: Ch 4 · Submit Your First Job
---

# sbatch、salloc 與 srun

|  | `sbatch` | `salloc` | `srun`（單獨使用） |
| --- | --- | --- | --- |
| 要資源 | 是 | 是 | 是，沒有現成的 allocation 時 |
| 執行方式 | 在背景執行 script | 開互動 shell，手動下 `srun` | 直接執行一個指令 |
| 終端機 | 送出後立即返回 | 等待並佔住 | 等待並佔住 |
| 釋放資源 | script 結束 | `exit` 或時間到期 | 指令結束 |
| 適合情境 | 正式、長時間的計算 | 互動除錯、反覆測試 | 快速測試單一指令 |

---
layout: reference
chapter: Ch 4 · Submit Your First Job
---

# 指令總表

| 指令 | 用途 |
| --- | --- |
| `sinfo` | 查看 partition 與 node 狀態 |
| `squeue -u $USER` | 查看自己的 job |
| `srun` | 互動式執行 |
| `salloc` | 取得資源並開啟互動 shell |
| `sbatch script.sh` | 送出 batch job |
| `scancel <jobid>` | 取消 job |
| `scontrol show job <jobid>` | 查看 job 的詳細資訊 |
| `sacct` | 查看歷史 job 的資源使用，需要 `slurmdbd` |

---
layout: textbook
chapter: Ch 4 · Submit Your First Job
---

# 練習

1. 以 `sinfo` 找出 cluster 有幾個 partition、各有幾台 node
2. 修改 `hello.sh`，改為 2 台 node、每台 3 個 task，觀察輸出有幾行
3. 送出一個 `sleep 300` 的 job，執行時以 `squeue` 查看，再以 `scancel` 取消
4. 平行檔案系統為什麼要把 metadata 和實際資料分開存放？
