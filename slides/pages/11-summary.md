---
layout: bento
chapter: Summary
big: true
---

# 重點整理

<Tile variant="hero" label="核心概念" value="Scale Out">以網路連接多台 node，統一管理，如同一台更大的電腦</Tile>
<Tile label="入口" value="Login Node">登入、編譯與送出 job，不直接執行大量運算</Tile>
<Tile label="排程" value="slurmctld" mono>分配資源並排程，以 backfill 填滿空檔</Tile>
<Tile variant="accent" label="執行" value="srun" mono>在 allocation 中產生 job step，送到所有分配到的 node</Tile>
<Tile label="前置作業" value="時間、UID、home">所有節點的時鐘、帳號與 home 目錄一致</Tile>
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
