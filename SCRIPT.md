# Introduction to Cluster and Slurm 筆記與講稿

搭配投影片使用，依投影片順序排列。每張投影片列出：

- 筆記：投影片右側 NOTE 欄依點擊順序顯示的重點（括號內為第幾次點擊）。
- 講稿：講者要說的內容與補充說明。

投影片本身不含講者備註，所有講稿都在這份文件。

## 1. Introduction to Cluster and Slurm

講稿：

- 開場：前半部會在範例叢集上送出第一個 job，後半部說明這座叢集是怎麼建起來的。

# Overview

## 2. 學習目標

講稿：

- 五個目標對應兩個部分：前 3 項是使用者，後 2 項是管理員。

## 3. 前半部使用 Cluster，後半部建置 Cluster

講稿：

- 強調兩部分用同一座叢集，後半部的設定檔就是前半部 job 跑起來的原因。

# Ch 1 · What is a Cluster

## 4. What is a Cluster

## 5. Cluster 是以網路連接、統一管理的多台電腦

講稿：

- 先建立「一台更大的電腦」的直覺，再拆開看裡面有什麼。

## 6. Node

講稿：

- 之後所有圖都以 node 為單位，先確定大家知道 node 就是一台獨立的電腦。

## 7. 運算能力不足時的兩種擴充方式

講稿：

- 一列一列點出來。可以問：家用電腦想變快，通常先想到哪一種？

## 8. Scale Up 與 Scale Out

講稿：

- 第 1 步只看左邊，第 2 步帶出右邊的 Network Switch。
- 提醒 Scale Out 的代價：程式要能平行化，網路會變成瓶頸。

## 9. Cluster 的種類

講稿：

- 三種 cluster 目的不同，後面主要談 HPC Cluster，但 Slurm 自己也會用到 HA 的做法。

## 10. Q1．Slurm 的 controller 故障時，由另一台 backup controller 接手排程。這屬於哪一種 Cluster 的做法？

講稿：

- 舉手表決後再公布答案。
- 這題在 Ch 9 的 slurmctld 備援會再出現。

# Ch 2 · Cluster Architecture

## 11. Cluster Architecture

## 12. 典型的 HPC Cluster 架構

講稿：

- 依步驟逐層建立架構：先有入口，再有管理網路與 Head Node，接著是 Compute Node，最後是 Storage 與高速網路。
- 強調兩張網路分開的原因：管理流量和計算資料互不干擾。

## 13. Node Roles

講稿：

- 每一項都對照架構圖上的位置，服務名稱後面會反覆出現。

## 14. Daemon

講稿：

- slurmd、munged 都是 daemon，之後看到結尾是 d 的程式，大多是背景服務。

## 15. 角色是功能上的區分，不一定是實體機器的區分

講稿：

- 範例叢集只有 2 台，所以 slurm-head 身兼多職。

## 16. 計算一律透過 scheduler 送到 Compute Node

講稿：

- Login Node 是共用的入口，這一點在 Ch 9 會用 systemd 的資源限制實際落實。

## 17. Cluster 中的三種網路

講稿：

- BMC Network 是選用的，教學環境常常沒有。

## 18. 網路相關名詞

講稿：

- RDMA 是 High-Speed Interconnect 低延遲的原因。

# Ch 3 · Cluster Software Stack

## 19. Cluster Software Stack

## 20. 使用 Cluster 時會接觸的軟體

講稿：

- 四項需求各自對應一類軟體，接下來依序介紹前兩項。

## 21. NFS 與平行檔案系統

講稿：

- NFS 的瓶頸在於所有 I/O 都經過同一台 server。

## 22. 檔案系統相關名詞

講稿：

- metadata 與 chunk 是下一張圖的兩個主角。

## 23. 平行檔案系統的讀寫流程

講稿：

- 第 1 步只問位置，第 2 步才真正搬資料，而且是 4 台同時。
- 練習第 4 題就是問這張圖的設計理由。

## 24. home 放在 NFS，scratch 放在平行檔案系統

講稿：

- 很多 cluster 兩者都有，使用者要知道自己的資料該放哪裡。

## 25. Workload Manager 的職責

講稿：

- 四項職責依序對應 Slurm 的指令：分配與排程是 sbatch、salloc，監控是 squeue，記帳是 sacct。

## 26. 排程相關名詞

講稿：

- Backfill 的定義先講完，下一張用圖說明。

## 27. Backfill 的排程方式

講稿：

- 關鍵是 Job C 的長度剛好能在 3h 前結束，所以不會延後 Job B。
- 這也是 Ch 4 要求 --time 估準的原因。

## 28. Slurm 的主要元件

講稿：

- 三個 daemon 的位置對照 Ch 2 的架構圖。

## 29. 一個 job 的流程

講稿：

- 三個步驟對應 Submit、Dispatch、Write output，之後的 hello.sh 就是這個流程。

## 30. 以 Spack 建置軟體，以 module load 切換環境

講稿：

- Spack 與 Lmod 有獨立的文件，這裡只說明它們解決的問題。

# Ch 4 · Submit Your First Job

## 31. Submit Your First Job

## 32. 範例叢集：slurm-head 與 slurm-compute

講稿：

- 請大家打開指令清單，之後的指令都可以從那裡複製。
- 在自己的電腦上沒有 cluster 時，跳過操作，只看輸出。

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
- （2）squeue -u $USER：查看自己排隊中與執行中的 job（輸出省略）。
- （3）cat hello_42.out：job 結束後查看輸出檔（輸出省略）。

講稿：

- sbatch 送出後立即回到 shell，可以用 squeue 觀察 job 的狀態，結束後再看輸出檔。
- 輸出檔名中的 42 來自 --output 的 %j。

## 38. --time 估得越準，越有機會提早執行

講稿：

- 連結 Ch 3 的 Backfill 圖：短 job 才排得進空檔。

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

講稿：

- 依步驟對照 steps.sh 的三行，最後一步只有 2 格亮起。

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

## 44. Q2．steps.sh 的 allocation 為 2 台 node。若把 srun hostname 改成 ./a.out，沒有加 srun，程式會在哪裡執行？

講稿：

- 舉手表決後再公布答案，下一張說明這是最常見的錯誤。

## 45. 常見錯誤：script 中沒有以 srun 執行程式

講稿：

- 程式「有跑」但只用到一台 node，所以不容易察覺。

## 46. 常見錯誤：srun 要求超過 allocation

筆記：

- （1）allocation 只有 8 個 task。srun 只能在已分配的資源中切分，不能向外多要。

講稿：

- 先看真實的錯誤訊息，再說明原因：srun 不能超過 allocation。

## 47. srun 要求的資源比 sbatch 多

講稿：

- 兩種情況的訊息不同：一個是失敗，一個是等待。

## 48. 在同一個 allocation 中同時執行多個 step

筆記：

- （1）每個 srun 都寫明只使用多少資源，否則第一個 step 會用滿整塊 allocation。
- （2）wait：等待所有背景執行的 step 結束。

講稿：

- --exact 讓每個 step 只拿自己要求的資源，最後的 wait 等所有背景 step 結束。

## 49. 不同版本的 Slurm，step 的預設行為不同

講稿：

- 遇到行為不同時，先用 sinfo --version 確認版本。

## 50. 以 dependency 串接 job

筆記：

- （進入投影片）script 中的 sbatch 會送出一個全新的 job，重新排隊，不使用原本 job 的資源。
- （1）前處理以 srun 執行。
- （2）afterok:<jobid>：指定的 job 成功結束後，train.sh 才能開始。

講稿：

- script 中的 sbatch 和 srun 意義完全不同：sbatch 送出新的 job，重新排隊。

## 51. script 送出自己時，必須有停止條件

講稿：

- 自我送出要有停止條件，例如檢查某個檔案是否存在。

## 52. 以 salloc 取得互動式資源

筆記：

- （1）向 Slurm 要 2 台 node、每台 4 個 task、30 分鐘。
- （2）取得的 shell 仍在下指令的 login node 上。
- （3）srun：在分配到的 node 上執行，共 8 行，省略中間 5 行。

講稿：

- 取得資源後，shell 仍在 login node，hostname 會顯示 slurm-head。

## 53. 進入分配到的 node 後歸還資源

筆記：

- （1）查看這個 allocation 取得哪些 node。
- （2）多數 cluster 啟用 pam_slurm_adopt：只有在該 node 上有 job 才能 SSH 進去，且只能使用 job 分配到的資源。
- （3）離開 SSH 連線。
- （4）離開 salloc 的 shell，歸還資源。

講稿：

- ssh 進入 node 適合查看狀態或除錯；啟動平行程式仍建議用 srun，資源才會記錄在 sacct。
- 要 exit 兩次：先離開 SSH，再離開 salloc。

## 54. salloc 的流程

講稿：

- 五個步驟對照前兩張的終端機畫面。

## 55. 常見錯誤：在 salloc 的 shell 中直接執行程式

講稿：

- 這和 Q2 是同一類錯誤：沒有 srun 就不會用到分配到的 node。

## 56. sbatch、salloc 與 srun

講稿：

- 三者都會要資源，差別在執行方式與何時釋放資源。

## 57. 指令總表

講稿：

- 指令清單頁面也有完整列表。

## 58. 練習

講稿：

- 第 4 題的參考答案：metadata 是大量且微小的 I/O，適合放在高 IOPS 的 NVMe 或 SSD；實際資料需要高吞吐量，適合切塊分散到多台 storage node。分開後兩種負載互不干擾，也能各自擴充。

# Ch 5 · Prerequisites

## 59. Prerequisites

## 60. Slurm 的元件

講稿：

- 從這裡開始換成管理員的角度。三個步驟對應三個 daemon 與它們的通訊方向。

## 61. 安裝時會用到的 Linux 名詞

講稿：

- cgroup 在 slurm.conf 的 ProctrackType 與 TaskPlugin 會用到；tmpfs 在 TmpDisk 的設定會用到。

## 62. 所有節點的時鐘、UID 與 GID 必須一致

講稿：

- 時間同步與帳號集中管理各有獨立的文件，這裡只說明為什麼需要。

## 63. UID 不一致時的情形

講稿：

- 共用檔案系統只看 UID 數字，不看帳號名稱。

## 64. 集中管理帳號的兩種方式

講稿：

- 教學環境可以用 NIS，正式環境用 LDAP。

## 65. 安裝 Slurm 前，先讓所有節點共用 home 目錄

講稿：

- job 的輸出檔寫在送出 job 時的工作目錄，所以 home 必須共用。

## 66. 修正 hostname 解析

筆記：

- （進入投影片）以 getent hosts slurm-head slurm-compute 確認每個節點名稱的解析結果。
- （1）Debian 預設把本機名稱對應到 127.0.1.1，slurmd 會連到自己而不是 controller。
- （2）在所有節點寫入真實 IP，並移除本機名稱對應 127.0.1.1 的那一行。

講稿：

- 這是安裝時最常踩到的問題之一，Troubleshooting 的 not responding 也會提到。

## 67. Authentication 的三項要求

講稿：

- 範例使用 auth/slurm，不需要另外安裝 MUNGE。

## 68. 產生 auth/slurm 的金鑰

筆記：

- （1）在 controller 產生 1 KB 的隨機金鑰，再複製到所有節點的 /etc/slurm/。
- （2）在每個節點把擁有者設為 slurm。
- （3）只讓 SlurmUser 讀寫。

講稿：

- 金鑰權限過寬時，slurmctld 會拒絕啟動，見 Troubleshooting。

## 69. 建立 slurm 帳號

筆記：

- （1）確認 UID 981 未被使用：沒有輸出即可使用。
- （2）每個節點使用相同的 UID。建議選 1000 以下，避免與一般使用者撞號。
- （3）-r：系統群組。-g：指定固定的 GID。

講稿：

- UID 選在 1000 以下，所有節點都用同一個數字。

## 70. useradd 的參數

講稿：

- 逐一點出參數：系統帳號、固定 UID、不建立家目錄、禁止登入。

## 71. 叢集中的兩類帳號

講稿：

- 兩類帳號放在不同地方，原因在下一張。

## 72. 服務帳號不放進 LDAP

講稿：

- 三個原因都與「daemon 開機就要啟動」有關。

## 73. 編譯用的開發套件

講稿：

- 打包前先裝好開發套件，否則需要重新打包。

# Ch 6 · Installation

## 74. Installation

## 75. 從原始碼打包 Debian 套件

筆記：

- （1）安裝解壓縮與打包所需的工具。
- （3）從 SchedMD 下載頁取得 tarball 的網址。
- （6）依 debian/control 自動安裝 build dependencies。
- （7）debuild 完成後，.deb 出現在上一層目錄 /opt。

講稿：

- 指令中的 <<...>> 是要自行替換的部分：下載網址、解壓縮後的目錄名稱。
- debuild 需要一段時間，完成後 .deb 在 /opt。

## 76. 各角色需要的套件

講稿：

- 每個角色只裝需要的套件。範例叢集的 slurm-head 身兼 controller、DBD 與 compute，所以要裝 4 個。

## 77. 在 Compute Node 安裝套件

筆記：

- （1）所有角色都需要 slurm-smd。
- （3）其他角色依上一頁的表格替換套件名稱。

講稿：

- Compute Node 需要 slurm-smd、client 與 slurmd 三個套件。

## 78. 確認 plugin 已編入

筆記：

- （1）DBD 節點需要看到 accounting_storage_mysql.so。
- （2）使用 PMIx 時，清單中要有 pmix。缺少 plugin 時，安裝開發套件後重新 debuild。

講稿：

- 缺少 plugin 代表打包時沒有對應的開發套件。

## 79. 以 root 建立目錄並交給 slurm

講稿：

- 每個目錄都由 root 建立，再交給 slurm。

## 80. 讓 /run/slurmdbd 在開機時自動建立

筆記：

- （1）/run 重開機時會清空，以 tmpfiles 設定每次開機時建立。
- （2）立即依設定建立目錄。

講稿：

- /run 是 tmpfs，重開機會清空，所以用 tmpfiles 設定。

## 81. 在 DBD 節點安裝 MariaDB

筆記：

- （1）安裝前先執行 sudo apt update。
- （2）啟動 MariaDB，並設定開機自動啟動。

講稿：

- MariaDB 只裝在 DBD 節點。

## 82. 建立 accounting database

筆記：

- （進入投影片）以 sudo mysql -u root 登入 MariaDB 後執行。
- （1）建立存放記帳資料的 database。
- （2）建立 slurm 帳號，password 請換成自己的密碼。
- （3）只授予 slurm_acct_db 的權限。

講稿：

- password 要與 slurmdbd.conf 的 StoragePass 相同。

# Ch 7 · Example Configuration

## 83. Example Configuration

## 84. 一份最小可用的設定

講稿：

- 接下來三張是同一份 slurm.conf，所有節點內容完全相同。

## 85. slurm.conf：基本設定

筆記：

- （進入投影片）在所有節點建立 /etc/slurm/slurm.conf，內容完全相同。
- （1）SlurmctldHost：controller 的短 hostname，與 hostname -s 相同。
- （2）AuthType：認證 plugin。SlurmUser：執行 daemon 的帳號。
- （3）MailProg：不寄通知信時設為 /bin/true。
- （4）ProctrackType、TaskPlugin：以 cgroup 追蹤與限制 job 的 process。
- （5）ReturnToService=1：因無回應而 DOWN 的節點，重新註冊時自動恢復。其餘為 PID、spool、state 與 log 的路徑。

講稿：

- 逐段點出設定：名稱與 controller、認證、通知信、process 追蹤、各種路徑。

## 86. slurm.conf：排程與記帳

筆記：

- （進入投影片）接續上一頁，同一份檔案的中段。
- （1）backfill 讓小 job 利用空檔；cons_tres 讓一台節點同時執行多個 job。
- （2）記帳交給 slurm-head 上的 slurmdbd，port 與 slurmdbd.conf 的 DbdPort 相同。

講稿：

- 這一段決定排程方式，以及記帳資料送到哪裡。

## 87. slurm.conf：節點與 partition

講稿：

- NodeName=DEFAULT 設定共同的硬體規格，再逐一列出每台 node 的 IP。

## 88. slurmdbd.conf

筆記：

- （進入投影片）只在 DBD 節點建立 /etc/slurm/slurmdbd.conf。
- （1）slurmdbd 監聽的位置，與 slurm.conf 的 AccountingStoragePort 相同。
- （2）連線到建立 accounting database 時的 MariaDB 帳號。
- （3）StoragePass 換成建立資料庫帳號時的密碼。

講稿：

- slurmdbd.conf 只在 DBD 節點。DbdPort 與 slurm.conf 的 AccountingStoragePort 要一致。

## 89. 保護 slurmdbd.conf

筆記：

- （1）檔案中有資料庫密碼，擁有者必須是 slurm。
- （2）權限不是 600 時，slurmdbd 會拒絕啟動。

講稿：

- 權限錯誤是 slurmdbd 啟動失敗的常見原因。

## 90. 依上下游順序啟動 daemon

講稿：

- 依上下游順序啟動：slurmdbd、slurmctld、slurmd。

## 91. 常見錯誤：sinfo timeout

講稿：

- slurmctld 顯示 running 卻不回應，是因為它在等 slurmdbd 給 ClusterID。

## 92. 驗證叢集

筆記：

- （1）確認 controller 正常回應（輸出省略）。
- （2）列出節點狀態，State 為 idle 代表可接收 job（輸出省略）。
- （3）送出測試 job。叢集可以運作後，即可使用 Ch 4 的指令。

講稿：

- srun 的輸出與 Ch 4 相同，代表叢集已經可以接收 job。

# Ch 8 · Configuration and Operations

## 93. Configuration and Operations

## 94. slurm.conf 的重要參數

講稿：

- 只列出最常調整的參數，完整說明見 slurm.conf man page。

## 95. TreeWidth 的樹狀轉發

講稿：

- 每多一層，涵蓋的節點數乘以 16。

## 96. 取得節點的硬體規格

筆記：

- （1）在每個 compute node 分別執行。第一行可直接貼進 slurm.conf；UpTime 不屬於設定。RealMemory 建議略低於偵測值。

講稿：

- 在虛擬機上 CPU 拓撲常與實體機不同，一定要以 slurmd -C 的結果為準。

## 97. /tmp 為 tmpfs 時，不要以它的大小填 TmpDisk

講稿：

- /tmp 是 tmpfs 時，暫存空間其實是記憶體。

## 98. 修改設定後的生效方式

講稿：

- 不確定時，重啟最保險。

## 99. 查看節點狀態並恢復上線

筆記：

- （1）節點為 DOWN 或 INVALID 時，原因顯示在 Reason 欄位。輸出只保留與狀態相關的幾行。
- （2）修正設定並重啟 slurmd 後，將節點恢復上線。

講稿：

- Reason 欄位會說明節點為什麼是 DOWN。

# Ch 9 · Production Deployment

## 100. Production Deployment

## 101. 正式環境的三層架構

講稿：

- 依步驟逐層建立：Access、Control、Compute。

## 102. 備援相關名詞

講稿：

- 兩個名詞是 slurmctld 備援的基礎。

## 103. slurmctld 的 active-standby 備援

講稿：

- 回應 Ch 1 的 Q1：這就是 High Availability 的做法。
- 強調切換期間執行中的 job 不受影響。

## 104. 設定 slurmctld 備援

筆記：

- （進入投影片）所有節點的 slurm.conf 都要加上，順序必須相同。
- （1）第一行為 primary，第二行起為 backup。
- （2）設太短時，primary 只是短暫忙碌也會被誤判為故障。
- （3）兩台 controller 共用、擁有者為 slurm 的狀態目錄。

講稿：

- 所有節點的 slurm.conf 都要列出兩台 controller，而且順序相同。

## 105. 測試切換

筆記：

- （1）兩台 controller 都在運作。
- （2）在 head1 停止 slurmctld，模擬 primary 故障。
- （3）等待超過 SlurmctldTimeout 後，backup 已經接手。計畫性維護時可改用 scontrol takeover 立即切換。

講稿：

- 停止 primary 後要等超過 SlurmctldTimeout，backup 才會接手。

## 106. StateSaveLocation 不能成為新的單點故障

講稿：

- 共用狀態目錄本身也要有備援，否則只是把單點故障換了位置。

## 107. slurmdbd 的備援

講稿：

- 兩台 slurmdbd 寫入同一個 MariaDB。資料庫不在本機時，帳號要允許兩台 head node 連線。

## 108. slurmdbd 可以短暫停止，但不能停太久

講稿：

- MariaDB 的複寫或叢集超出這份內容的範圍。

## 109. Partition 規劃：16 台 CPU node 加 4 台 GPU node

講稿：

- debug 的 node 同時屬於 cpu，不會閒置。

## 110. 設定 Partition

講稿：

- GPU 還需要 gres.conf，詳見 GRES 文件。

## 111. Partition 參數

講稿：

- DefaultTime 沒設時，backfill 幾乎無法發揮作用。

## 112. 限制每位使用者在 Login Node 上的資源

筆記：

- （進入投影片）寫入 /etc/systemd/system/user-.slice.d/，對每位使用者的 user-UID.slice 生效。
- （1）CPUQuota：200% 為 2 個 core。
- （2）MemoryMax：超過時該使用者的 process 會被 OOM kill。
- （3）MemorySwapMax=0：避免大量 swap 拖慢整台機器。
- （4）TasksMax：process 與 thread 數上限，可防止 fork bomb。

講稿：

- 寫入後執行 sudo systemctl daemon-reload，使用者重新登入後生效；root 的 user-0.slice 要另外解除限制。

## 113. 以 VIP 讓多台 Login Node 共用一個位址

講稿：

- VRRP 預設使用 multicast，許多雲端與虛擬化環境會擋掉，需要改用 unicast。

# Ch 10 · Troubleshooting

## 114. Troubleshooting

## 115. 先查看 log

筆記：

- （1）slurmctld 的 log；compute node 改看 slurmd.log。
- （2）log 檔尚未建立時，改看 journal 最新的紀錄。

講稿：

- 遇到問題先看 log，大多數錯誤訊息都會直接說明原因。

## 116. 常見錯誤與修正

講稿：

- 逐一點出錯誤訊息與修正方式，都是安裝過程中實際遇到的錯誤。

# Summary

## 117. 重點整理

講稿：

- 用這張回顧兩部分的重點。

## 118. Further Reading

講稿：

- 延伸主題各有獨立的文件。
- 開放提問。
