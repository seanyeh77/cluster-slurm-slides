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
<Tile label="共用檔案" value="home 與 scratch">home 放在 NFS，scratch 放在平行檔案系統</Tile>
<Tile label="送出 job" value="sbatch hello.sh" mono wide>script 在背景排隊與執行，輸出寫入共用儲存</Tile>

---
layout: end
chapter: Summary
next: Building and Installing Slurm
---

# 接下來

- 建置 Slurm 前的時間、帳號與檔案系統同步
- 從原始碼打包並依角色安裝 Slurm
- 撰寫最小設定並依序啟動 daemon
- 正式環境的備援與 partition 規劃
