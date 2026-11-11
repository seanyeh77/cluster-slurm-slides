# 接下來 筆記與講稿

搭配投影片使用，依投影片順序排列。每張投影片列出：

- 筆記：投影片右側 NOTE 欄依點擊順序顯示的重點（括號內為第幾次點擊）。
- 講稿：講者要說的內容與補充說明。

投影片本身不含講者備註，所有講稿都在這份文件。

## 1. Introduction to Cluster

講稿：

- 開場：從 cluster 是什麼開始，最後在範例叢集上送出第一個 job。

# Overview

## 2. 學習目標

講稿：

- 三個目標依序對應 cluster 的架構、核心軟體與 Slurm 的使用。

# Ch 1 · What is a Cluster

## 3. What is a Cluster

## 4. Cluster 是以網路連接、統一管理的多台電腦

講稿：

- 先建立「一台更大的電腦」的直覺，再拆開看裡面有什麼。
- 多台獨立的電腦透過網路連接，再以軟體統一管理。

## 5. Node

講稿：

- 之後所有圖都以 node 為單位，先確定大家知道 node 就是一台獨立的電腦。

## 6. 運算能力不足時的兩種擴充方式

講稿：

- 一列一列點出來。可以問：家用電腦想變快，通常先想到哪一種？

## 7. Scale Up 與 Scale Out

講稿：

- 第 1 步只看左邊，第 2 步帶出右邊的 Network Switch。
- 提醒 Scale Out 的代價：程式要能平行化，網路會變成瓶頸。

## 8. Cluster 的種類

講稿：

- 三種 cluster 目的不同，後面主要談 HPC Cluster，但 Slurm 自己也會用到 HA 的做法。

## 9. Q1．controller 故障時由 backup 接手排程，屬於哪一種 Cluster？

講稿：

- 舉手表決後再公布答案。
- 這題在 Building and Installing Slurm 的 slurmctld 備援會再出現。

# Ch 2 · Cluster Architecture

## 10. Cluster Architecture

## 11. 典型的 HPC Cluster 架構

講稿：

- 依步驟逐層建立架構：先有入口，再有管理網路與 Head Node，接著是 Compute Node，最後是 Storage 與高速網路。
- 強調兩張網路分開的原因：管理流量和計算資料互不干擾。

## 12. Node Roles

講稿：

- 每一項都對照架構圖上的位置，服務名稱後面會反覆出現。

## 13. Daemon

講稿：

- slurmd、munged 都是 daemon，之後看到結尾是 d 的程式，大多是背景服務。

## 14. 角色是功能上的區分，不一定是實體機器的區分

講稿：

- Ch 4 使用的範例叢集只有 2 台，所以 slurm-head 身兼多職。
- 小型 cluster 常把好幾個角色放在同一台機器上，例如 Login Node 與 Head Node 合併，或讓 slurmctld 與 slurmdbd 在同一台執行。

## 15. 計算一律透過 scheduler 送到 Compute Node

講稿：

- Login Node 是共用的入口，這一點在 Building and Installing Slurm 會用 systemd 的資源限制實際落實。
- Login Node 是所有使用者共用的入口，在上面直接執行大量運算，會讓其他使用者連登入都變慢。

## 16. Cluster 中的三種網路

講稿：

- BMC Network 是選用的，教學環境常常沒有。

## 17. 網路相關名詞

講稿：

- RDMA 是 High-Speed Interconnect 低延遲的原因。

# Ch 3 · Cluster Software Stack

## 18. Cluster Software Stack

## 19. 使用 Cluster 時會接觸的軟體

講稿：

- 四項需求各自對應一類軟體，接下來依序介紹前兩項。

## 20. NFS 與平行檔案系統

講稿：

- NFS 的瓶頸在於所有 I/O 都經過同一台 server。

## 21. 檔案系統相關名詞

講稿：

- metadata 與 chunk 是下一張圖的兩個主角。

## 22. 平行檔案系統的讀寫流程

筆記：

- （1）Lookup：先向 Metadata Service 查詢各個 chunk 的位置。
- （2）資料直接對 4 台 Storage Node 同時讀寫，不必全部經過同一台 server。
- （3）只有一台 server 時，chunk 只能依序經過它，I/O 全部集中在一台。

講稿：

- 動畫：第 1 步只問位置，第 2 步才真正搬資料，而且 4 個 chunk 同時出發。
- 第 3 步是對照：只有一台 server 時，同樣 4 個 chunk 必須一個接一個經過它，這就是 NFS 規模變大後的瓶頸。
- 練習第 4 題就是問這張圖的設計理由。

## 23. home 放在 NFS，scratch 放在平行檔案系統

講稿：

- 很多 cluster 兩者都有，使用者要知道自己的資料該放哪裡。
- home 小檔案多，適合 NFS；scratch 存放計算時大量的中間資料，適合 BeeGFS 或 Lustre。兩者不是二選一。

## 24. Workload Manager 的職責

講稿：

- 四項職責依序對應 Slurm 的指令：分配與排程是 sbatch、salloc，監控是 squeue，記帳是 sacct。

## 25. 排程相關名詞

講稿：

- Backfill 的定義先講完，下一張用圖說明。

## 26. Backfill 的排程方式

筆記：

- （進入投影片）Job A 在 node01、node02 上執行到 3h。
- （1）Job B 需要 4 台 node，必須等到 3h；node03、node04 先閒置。
- （2）Job C 只需要 2 小時，能在 Job B 開始前完成，因此 backfill 進空檔。
- （3）Job D 排在 Job B 之後。
- （4）Job B 準時在 3h 開始，沒有被 Job C 延後。
- （5）沒有 backfill 時，Job C 只能排在 Job B 之後。

講稿：

- 動畫上方的 Utilization 是 0h 到 3h 的利用率，Job C 補進空檔時從 50 % 升到 83 %。
- 關鍵是 Job C 的長度剛好能在 3h 前結束，所以不會延後 Job B；第 4 步時間游標掃過，可以看到 Job B 準時在 3h 開始。
- 最後一步是對照：沒有 backfill 時 Job C 排在 Job B 之後，node03、node04 前 3 小時完全閒置，利用率回到 50 %。
- 這也是 Ch 4 要求 --time 估準的原因。

## 27. Slurm 的主要元件

講稿：

- 三個 daemon 的位置對照 Ch 2 的架構圖。

## 28. 一個 job 的流程

筆記：

- （1）sbatch：在 Login Node 送出 job，交給 slurmctld。
- （2）slurmctld 排程後，把 job 派送給 slurmd。
- （3）slurmd 在 Compute Node 上執行 job。
- （4）輸出寫到 Shared Storage 上的 slurm-42.out。
- （5）Login Node 直接讀取同一個檔案。
- （6）沒有共用儲存時，輸出只留在 Compute Node 的本機磁碟。

講稿：

- 前五步依序是 Submit、Dispatch、Run、Write output、Read output，之後的 hello.sh 就是這個流程。
- 第 5 步強調：使用者在 Login Node 就能 cat slurm-42.out，是因為輸出寫在共用儲存上。
- 最後一步是對照：沒有共用儲存時，輸出留在 Compute Node 的本機磁碟，Login Node 上會看到 No such file。

## 29. 以 Spack 建置軟體，以 module load 切換環境

講稿：

- Spack 與 Lmod 有獨立的文件，這裡只說明它們解決的問題。
- 不同的使用者需要不同版本的編譯器、MPI 與函式庫。Spack 從原始碼建置並讓多個版本共存，Environment Modules 或 Lmod 讓使用者以 module load 切換。

# Ch 4 · Submit Your First Job

## 30. Submit Your First Job

## 31. 範例叢集

講稿：

- 實作使用的範例叢集有 2 台 node，每台 4 個 CPU。
- slurm-head 兼任 login、controller 與 compute：使用者 SSH 進入的就是它，slurmctld、slurmdbd 也在上面執行，同時它也有 slurmd，會分到計算工作。
- slurm-compute 只執行 slurmd，是純粹的 Compute Node。
- 兩台機器就是 Building and Installing Slurm 建起來的叢集。

## 32. 以下指令都在 slurm-head 上執行

講稿：

- 請大家打開指令清單，之後的指令都可以從那裡複製。
- 在自己的電腦上沒有 cluster 時，跳過操作，只看輸出。
- 所有指令都在 slurm-head，也就是 login 的角色上輸入。

## 33. 查看 partition 與 node

筆記：

- （1）debug*：* 表示預設的 partition。STATE：node 目前的狀態。

講稿：

- 先確認 2 台 node 都是 idle，才能接著送 job。

## 34. Node 的狀態

講稿：

- drain 與 down 的差別：drain 是管理員主動暫停，down 是 Slurm 聯絡不到 node。

## 35. 以 srun 執行互動式 job

筆記：

- （1）-N 2：使用 2 台 node，各執行一次 hostname。srun 會等 job 結束才回到 shell，適合快速測試。

講稿：

- srun 單獨使用時會自己要資源、執行、歸還，三件事一次完成。

## 36. 撰寫 job script

筆記：

- （進入投影片）以 vim hello.sh 建立檔案。#SBATCH 開頭的行是給 Slurm 的選項。
- （1）--job-name：job 的名稱，顯示在 squeue 中。
- （2）--partition：送到哪個 partition。
- （3）--nodes：需要幾台 node。
- （4）--ntasks-per-node：每台 node 執行幾個 task。
- （5）--time：最長執行時間，超過會被強制結束。
- （6）--output：輸出檔的位置，%j 會換成 job ID。
- （7）srun：在分配到的 node 上執行 hostname。

講稿：

- 逐行點出 #SBATCH 選項，最後一行的 srun 是真正執行的程式。

## 37. 以 sbatch 送出 batch job

筆記：

- （1）sbatch：送出 job 後立即回到 shell，job 在背景排隊與執行。
- （2）squeue -u $USER：查看自己排隊中與執行中的 job，輸出省略。
- （3）cat hello_42.out：job 結束後查看輸出檔，輸出省略。

講稿：

- sbatch 送出後立即回到 shell，可以用 squeue 觀察 job 的狀態，結束後再看輸出檔。
- 輸出檔名中的 42 來自 --output 的 %j。

## 38. --time 估得越準，越有機會提早執行

講稿：

- 連結 Ch 3 的 Backfill 圖：短 job 才排得進空檔。
- 時間設得越短，越有機會被 backfill 提早排到。

## 39. Job Allocation 與 Job Step

講稿：

- 三個名詞是下一個範例的基礎。

## 40. 一個 job 中的兩個 step

筆記：

- （進入投影片）以 vim steps.sh 建立檔案。allocation 為 2 台 node，每台 4 個 task。
- （1）沒有 srun：只在 batch host 執行。
- （2）srun 不需要再寫一次資源數量，會繼承 allocation 的設定。
- （3）srun -n 2：只使用 allocation 中的 2 個 task。

講稿：

- 逐行對照註解：第 7 行沒有 srun，第 8、9 行各產生一個 step。

## 41. steps.sh 使用的資源

筆記：

- （1）sbatch 先要一塊資源：2 台 node，每台 4 個 task。
- （2）script 本身只在 batch host，也就是 slurm-compute 上執行。
- （3）step 0：srun 用滿整塊 allocation，共 8 個 task。
- （4）step 1：srun -n 2 只使用其中 2 個 task。
- （5）沒有 srun 的 ./a.out 只在 batch host 執行，slurm-head 整段時間閒置。

講稿：

- 右邊的 slurm-44.out 每一行都對應左邊某一格 task 的輸出，依步驟對照 steps.sh 的三行。
- step 1 只有 slurm-compute 的 2 格亮起，所以最後 2 行都是 slurm-compute。
- 最後一步是對照：script 裡直接執行 ./a.out、沒有 srun，只有 batch host 的一格在跑，slurm-head 整段時間閒置，這是最常見的錯誤。

## 42. steps.sh 的輸出

筆記：

- （1）第 1 行來自 script 本身；接著 8 行為 step 0；最後 2 行為 step 1。

講稿：

- 請大家數一下：1 行、8 行、2 行，總共 11 行。

## 43. 以 sacct 查看每個 step

筆記：

- （1）44.batch：script 本身。44.0、44.1：兩個 step，各自記錄使用的 CPU 數。

講稿：

- 44.batch 是 script 本身，44.0 與 44.1 是兩個 step，CPU 數與上一張圖一致。

## 44. Q2．step 0 的 srun hostname 拿掉 srun，會輸出幾行？

講稿：

- 題目指的是 steps.sh 裡 step 0 那一行 srun hostname，必要時翻回前一張指給大家看。
- 舉手表決後再公布答案。可以對照 steps.sh 的輸出：最上面那一行就是 script 開頭沒有 srun 的 hostname。
- 沒有 srun 的程式只會用到一台 node；程式「有跑」，所以不容易察覺。

## 45. 在同一個 allocation 中同時執行多個 step

筆記：

- （進入投影片）./a.out：gcc 編譯時未指定檔名所產生的執行檔，./ 表示目前目錄。
- （1）--exact：step 只使用 -n 要求的資源，其餘 CPU 留給其他 step；結尾的 & 讓它在背景執行，兩個 step 才能同時跑。
- （2）wait：等待所有背景執行的 step 結束。

講稿：

- 先說明 ./a.out：用 gcc 編譯 C 程式、沒有以 -o 指定檔名時，執行檔預設叫 a.out；./ 表示執行目前目錄裡的這個檔案。換成任何自己的程式都一樣。
- --exact 讓每個 step 只拿 -n 指定的資源。不加的話，step 會拿走分配到的 node 上所有 CPU，第二個 step 只能等第一個結束，就變回依序執行。
- 每行結尾的 & 讓 srun 在背景執行，shell 不等它結束就繼續下一行；最後的 wait 等所有背景 step 結束，否則 script 一結束 job 就結束，step 也會被中止。

## 46. 以 dependency 串接 job

筆記：

- （進入投影片）script 中的 sbatch 會送出一個全新的 job，重新排隊，不使用原本 job 的資源。
- （1）前處理以 srun 執行。
- （2）afterok:<jobid>：指定的 job 成功結束後，train.sh 才能開始。

講稿：

- script 中的 sbatch 和 srun 意義完全不同：sbatch 送出新的 job，重新排隊。

## 47. 以 salloc 取得互動式資源

筆記：

- （1）向 Slurm 要 2 台 node、每台 4 個 task、30 分鐘。
- （2）取得的 shell 仍在下指令的 login node 上。
- （3）srun：在分配到的 node 上執行，共 8 行，省略中間 5 行。

講稿：

- 取得資源後，shell 仍在 login node，hostname 會顯示 slurm-head。

## 48. 進入分配到的 node 後歸還資源

筆記：

- （1）查看這個 allocation 取得哪些 node。
- （2）多數 cluster 啟用 pam_slurm_adopt：只有在該 node 上有 job 才能 SSH 進去，且只能使用 job 分配到的資源。
- （3）離開 SSH 連線。
- （4）離開 salloc 的 shell，歸還資源。

講稿：

- ssh 進入 node 適合查看狀態或除錯；啟動平行程式仍建議用 srun，資源才會記錄在 sacct。
- 要 exit 兩次：先離開 SSH，再離開 salloc。

## 49. salloc 的流程

講稿：

- 五個步驟對照前兩張的終端機畫面。

## 50. 常見錯誤：在 salloc 的 shell 中直接執行程式

講稿：

- 這和 Q2 是同一類錯誤：沒有 srun 就不會用到分配到的 node。
- 在 salloc 的 shell 裡直接執行 ./a.out，程式在 login node 上執行，分配到的 compute node 完全閒置。拿到 shell 後先以 hostname 確認所在的主機。

## 51. sbatch、salloc 與 srun

講稿：

- 三者都會要資源，差別在執行方式與何時釋放資源。

## 52. 指令總表

講稿：

- 指令清單頁面也有完整列表。

## 53. 練習

講稿：

- 第 4 題的參考答案：metadata 是大量且微小的 I/O，適合放在高 IOPS 的 NVMe 或 SSD；實際資料需要高吞吐量，適合切塊分散到多台 storage node。分開後兩種負載互不干擾，也能各自擴充。

# Summary

## 54. 重點整理

講稿：

- 用這張回顧 cluster 的架構與 Slurm 的使用。

## 55. 接下來

講稿：

- 下一份 Building and Installing Slurm 會把這座範例叢集實際建起來。
- 開放提問。
