---
layout: section
number: 10
chapter: Ch 10 · Troubleshooting
---

# Troubleshooting

- **10.1** 查看 log
- **10.2** 常見錯誤與修正

---
layout: textbook
chapter: Ch 10 · Troubleshooting
ltag: Terminal
clicks: 2
---

# 先查看 log

<TerminalTyping :keep="2" :cmds="[
  { c: 'sudo tail -n 30 /var/log/slurm/slurmctld.log' },
  { c: 'sudo journalctl -u slurmctld -n 30 --no-pager' },
]" />

::note::

<Note :notes="[
  '',
  'slurmctld 的 log；compute node 改看 slurmd.log。',
  'log 檔尚未建立時，改看 journal 最新的紀錄。',
]" />

---
layout: focus
chapter: Ch 10 · Troubleshooting
clicks: 5
items:
  - label: Controller Node
    title: 金鑰權限過寬
    code: 'fatal: auth/slurm: key file is insecure'
    text: 其他人可讀取金鑰就能冒充 Slurm daemon。在所有節點把 slurm.key 的擁有者設為 slurm、權限設為 600。
  - label: Controller Node
    title: 取不到 ClusterID
    code: "error: Still don't know my ClusterID"
    text: slurmctld 連不上 slurmdbd，因此不回應請求。先啟動 slurmdbd，再重啟 slurmctld。
  - label: Controller Node
    title: 不是有效的 controller
    code: 'error: This host (...) not a valid controller'
    text: SlurmctldHost 要填 controller 的短 hostname，與 hostname -s 的輸出相同。
  - label: Compute Node
    title: 節點沒有回應
    code: 'error: Nodes ... not responding'
    text: 依序檢查 slurmd 是否啟動、目錄與權限、hostname 是否解析為真實 IP，以及 controller 能否連到 6818 port。
  - label: Compute Node
    title: 設定與硬體不符
    code: 'error: Node configuration differs from hardware'
    text: 依該節點 sudo slurmd -C 的結果修正 NodeName 設定；虛擬機的 CPU 拓撲常與實體機不同。
  - label: DBD Node
    title: 資料庫拒絕登入
    code: 'mysql_real_connect failed: 1698 Access denied'
    text: slurmdbd.conf 的 StorageUser、StoragePass 與 MariaDB 中建立的帳號密碼不一致。
---

# 常見錯誤與修正
