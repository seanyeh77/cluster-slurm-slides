---
layout: bento
chapter: Summary
big: true
---

# 重點整理

<Tile variant="hero" label="前置作業" value="三項同步">所有節點的時鐘、UID 與 home 目錄一致，hostname 解析為真實 IP</Tile>
<Tile label="認證" value="slurm.key" mono>所有節點同一把金鑰，擁有者 slurm、權限 600</Tile>
<Tile label="安裝" value="依角色安裝">每個角色只裝需要的 .deb 套件</Tile>
<Tile variant="accent" label="設定" value="slurm.conf" mono>所有節點內容相同；硬體欄位以 slurmd -C 為準</Tile>
<Tile label="備援" value="active-standby">backup 讀取共用的 StateSaveLocation 後接手</Tile>
<Tile label="啟動順序" value="slurmdbd, slurmctld, slurmd" mono wide>上游先就緒，下游才能註冊</Tile>

---
layout: end
chapter: Summary
next: Scheduling、Accounting 與 Configless 模式
---

# Further Reading

- 排程：partition 限制、優先順序、fair-share
- Accounting：slurmdbd.conf 參數與 accounting 帳號
- Prolog 與 Epilog：job 前後的清理與健康檢查
- 設定檔管理：Configless 模式與 Ansible
- REST API：slurmrestd 與 JWT 認證
