---
layout: section
number: 6
chapter: Ch 6 · Installation
---

# Installation

- **6.1** 打包 Debian 套件
- **6.2** 依角色安裝套件
- **6.3** 確認 plugin
- **6.4** 建立目錄與資料庫

---
layout: textbook
chapter: Ch 6 · Installation
ltag: Terminal
clicks: 7
---

# 從原始碼打包 Debian 套件

<TerminalTyping :keep="7" :cmds="[
  { c: 'sudo apt install -y lbzip2 build-essential fakeroot devscripts equivs' },
  { c: 'cd /opt', to: '/opt' },
  { c: 'wget <<slurm_bz2_download_url>>' },
  { c: 'tar -xaf slurm*tar.bz2' },
  { c: 'cd /opt/<<slurm_download_path>>', to: '/opt/<<slurm_download_path>>' },
  { c: 'sudo mk-build-deps -i debian/control' },
  { c: 'sudo debuild -b -uc -us' },
]" />

::note::

<Note :notes="[
  '',
  '安裝解壓縮與打包所需的工具。',
  '',
  '從 SchedMD 下載頁取得 tarball 的網址。',
  '',
  '',
  '依 debian/control 自動安裝 build dependencies。',
  'debuild 完成後，.deb 出現在上一層目錄 /opt。',
]" />

---
layout: reference
chapter: Ch 6 · Installation
---

# 各角色需要的套件

| DEB 套件 | Login | Controller | Compute | DBD |
| --- | --- | --- | --- | --- |
| `slurm-smd` | X | X | X | X |
| `slurm-smd-client` | X | X | X |  |
| `slurm-smd-slurmctld` |  | X |  |  |
| `slurm-smd-slurmd` |  |  | X |  |
| `slurm-smd-slurmdbd` |  |  |  | X |

---
layout: textbook
chapter: Ch 6 · Installation
ltag: Terminal
clicks: 3
---

# 在 Compute Node 安裝套件

<TerminalTyping :keep="3" dir="/opt" :cmds="[
  { c: 'sudo apt install ./slurm-smd_<<slurm-version>>_amd64.deb' },
  { c: 'sudo apt install ./slurm-smd-client_<<slurm-version>>_amd64.deb' },
  { c: 'sudo apt install ./slurm-smd-slurmd_<<slurm-version>>_amd64.deb' },
]" />

::note::

<Note :notes="[
  '',
  '所有角色都需要 slurm-smd。',
  '',
  '其他角色依上一頁的表格替換套件名稱。',
]" />

---
layout: textbook
chapter: Ch 6 · Installation
ltag: Terminal
clicks: 2
---

# 確認 plugin 已編入

<TerminalTyping :keep="2" :cmds="[
  { c: 'ls /usr/lib/x86_64-linux-gnu/slurm/ | grep accounting_storage_mysql' },
  { c: 'srun --mpi=list' },
]" />

::note::

<Note :notes="[
  '',
  'DBD 節點需要看到 accounting_storage_mysql.so。',
  '使用 PMIx 時，清單中要有 pmix。缺少 plugin 時，安裝開發套件後重新 debuild。',
]" />

---
layout: reference
chapter: Ch 6 · Installation
---

# 以 root 建立目錄並交給 slurm

| 目錄 | 節點 | 擁有者 | 權限 |
| --- | --- | --- | --- |
| `/var/spool/slurmctld` | Controller | `slurm:slurm` | `755` |
| `/var/spool/slurmd` | 每個 Compute Node | `slurm:slurm` | `755` |
| `/var/log/slurm` | 所有節點 | `slurm:slurm` | 預設 |
| `/run/slurmdbd` | DBD 節點，以 tmpfiles 於開機時建立 | `slurm:slurm` | `0755` |

daemon 以 slurm 帳號執行，沒有權限在 `/var/spool`、`/var/log` 底下自行建立目錄。

---
layout: textbook
chapter: Ch 6 · Installation
ltag: Terminal
clicks: 2
---

# 讓 /run/slurmdbd 在開機時自動建立

<TerminalTyping :keep="2" :cmds="[
  { c: 'echo \'d /run/slurmdbd 0755 slurm slurm -\' | sudo tee /etc/tmpfiles.d/slurmdbd.conf', o: 'd /run/slurmdbd 0755 slurm slurm -' },
  { c: 'sudo systemd-tmpfiles --create' },
]" />

::note::

<Note :notes="[
  '',
  '/run 重開機時會清空，以 tmpfiles 設定每次開機時建立。',
  '立即依設定建立目錄。',
]" />

---
layout: textbook
chapter: Ch 6 · Installation
ltag: Terminal
clicks: 2
---

# 在 DBD 節點安裝 MariaDB

<TerminalTyping :keep="2" :cmds="[
  { c: 'sudo apt install -y mariadb-server mariadb-client' },
  { c: 'sudo systemctl enable --now mariadb' },
]" />

::note::

<Note :notes="[
  '',
  '安裝前先執行 sudo apt update。',
  '啟動 MariaDB，並設定開機自動啟動。',
]" />

---
layout: textbook
chapter: Ch 6 · Installation
ltag: SQL
clicks: 3
---

# 建立 accounting database

```sql {all|1|2|3}
CREATE DATABASE slurm_acct_db;
CREATE USER 'slurm'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON slurm_acct_db.* TO 'slurm'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

::note::

<Note :notes="[
  '以 sudo mysql -u root 登入 MariaDB 後執行。',
  '建立存放記帳資料的 database。',
  '建立 slurm 帳號，password 請換成自己的密碼。',
  '只授予 slurm_acct_db 的權限。',
]" />
