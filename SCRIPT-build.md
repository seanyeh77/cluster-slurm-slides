# Further Reading 筆記與講稿

搭配投影片使用，依投影片順序排列。每張投影片列出：

- 筆記：投影片右側 NOTE 欄依點擊順序顯示的重點（括號內為第幾次點擊）。
- 講稿：講者要說的內容與補充說明。

投影片本身不含講者備註，所有講稿都在這份文件。

## 1. Building and Installing Slurm

講稿：

- 開場：這份從管理員的角度，把 Introduction to Cluster 用的範例叢集建起來。

# Overview

## 2. 學習目標

講稿：

- 四個目標依序對應 Prerequisites、Installation、Example Configuration 與 Production Deployment。

## 3. 要建置的範例叢集

講稿：

- 這 2 台機器就是 Introduction to Cluster 實作時使用的叢集，這份改從管理員的角度把它建起來。
- slurm-head（10.1.253.75）兼任 login、controller、DBD 與 compute；slurm-compute（10.1.253.77）只執行 slurmd。
- 先確認大家熟悉 Introduction to Cluster 的內容：node 的角色、slurmctld 與 slurmd、sbatch 與 srun。

# Ch 1 · Prerequisites

## 4. Prerequisites

## 5. Slurm 的元件

筆記：

- （1）sbatch、srun、sinfo 把請求送給 slurmctld。
- （2）slurmctld 把 job 派送給每台 Compute Node 的 slurmd。
- （3）記帳資料交給 slurmdbd，由 slurmdbd 寫入 MariaDB。

講稿：

- 從這裡開始換成管理員的角度。三個步驟對應三個 daemon 與它們的通訊方向。

## 6. 安裝時會用到的 Linux 名詞

講稿：

- cgroup 在 slurm.conf 的 ProctrackType 與 TaskPlugin 會用到；tmpfs 在 TmpDisk 的設定會用到。

## 7. 所有節點的時鐘、UID 與 GID 必須一致

講稿：

- 時間同步與帳號集中管理各有獨立的文件，這裡只說明為什麼需要。
- 時間差太多，Slurm 的 credential 會被判為過期；UID 不一致，使用者在共用檔案系統上會存取不到自己的檔案。

## 8. UID 不一致時的情形

講稿：

- 共用檔案系統只看 UID 數字，不看帳號名稱。

## 9. 集中管理帳號的兩種方式

講稿：

- 教學環境可以用 NIS，正式環境用 LDAP。

## 10. 安裝 Slurm 前，先讓所有節點共用 home 目錄

講稿：

- job 的輸出檔寫在送出 job 時的工作目錄，所以 home 必須共用。
- job 的輸入資料與輸出檔（例如 slurm-42.out）都在送出 job 時的工作目錄。小型叢集使用 NFS；需要高吞吐量的 scratch 時，再加上 BeeGFS。

## 11. 修正 hostname 解析

筆記：

- （進入投影片）以 getent hosts slurm-head slurm-compute 確認每個節點名稱的解析結果。
- （1）Debian 預設把本機名稱對應到 127.0.1.1，slurmd 會連到自己而不是 controller。
- （2）在所有節點寫入真實 IP，並移除本機名稱對應 127.0.1.1 的那一行。

講稿：

- 這是安裝時最常踩到的問題之一。

## 12. Authentication 的三項要求

講稿：

- 範例使用 auth/slurm，不需要另外安裝 MUNGE。

## 13. 產生 auth/slurm 的金鑰

筆記：

- （1）在 controller 產生 1 KB 的隨機金鑰，再複製到所有節點的 /etc/slurm/。
- （2）在每個節點把擁有者設為 slurm。
- （3）只讓 SlurmUser 讀寫。

講稿：

- 金鑰權限過寬時，slurmctld 會拒絕啟動。

## 14. 建立 slurm 帳號

筆記：

- （1）確認 UID 981 未被使用：沒有輸出即可使用。
- （2）每個節點使用相同的 UID。建議選 1000 以下，避免與一般使用者撞號。
- （3）-r：系統群組。-g：指定固定的 GID。

講稿：

- UID 選在 1000 以下，所有節點都用同一個數字。

## 15. useradd 的參數

講稿：

- 逐一點出參數：系統帳號、固定 UID、不建立家目錄、禁止登入。

## 16. 叢集中的兩類帳號

講稿：

- 兩類帳號放在不同地方，原因在下一張。

## 17. 服務帳號不放進 LDAP

講稿：

- 三個原因都與「daemon 開機就要啟動」有關。

## 18. 編譯用的開發套件

講稿：

- 打包前先裝好開發套件，否則需要重新打包。

# Ch 2 · Installation

## 19. Installation

## 20. 從原始碼打包 Debian 套件

筆記：

- （1）安裝解壓縮與打包所需的工具。
- （3）從 SchedMD 下載頁取得 tarball 的網址。
- （6）依 debian/control 自動安裝 build dependencies。
- （7）debuild 完成後，.deb 出現在上一層目錄 /opt。

講稿：

- 指令中的 <<...>> 是要自行替換的部分：下載網址、解壓縮後的目錄名稱。
- debuild 需要一段時間，完成後 .deb 在 /opt。

## 21. 各角色需要的套件

講稿：

- 每個角色只裝需要的套件。範例叢集的 slurm-head 身兼 controller、DBD 與 compute，所以要裝 4 個。

## 22. 在 Compute Node 安裝套件

筆記：

- （1）所有角色都需要 slurm-smd。
- （3）其他角色依上一頁的表格替換套件名稱。

講稿：

- Compute Node 需要 slurm-smd、client 與 slurmd 三個套件。

## 23. 確認 plugin 已編入

筆記：

- （1）DBD 節點需要看到 accounting_storage_mysql.so。
- （2）使用 PMIx 時，清單中要有 pmix。缺少 plugin 時，安裝開發套件後重新 debuild。

講稿：

- 缺少 plugin 代表打包時沒有對應的開發套件。

## 24. 以 root 建立目錄並交給 slurm

講稿：

- 每個目錄都由 root 建立，再交給 slurm。

## 25. 讓 /run/slurmdbd 在開機時自動建立

筆記：

- （1）進入 /etc/tmpfiles.d，接下來的設定檔寫在這裡。
- （2）/run 重開機時會清空，以 tmpfiles 設定每次開機時建立。
- （3）立即依設定建立目錄。

講稿：

- /run 是 tmpfs，重開機會清空，所以用 tmpfiles 設定。

## 26. 在 DBD 節點安裝 MariaDB

筆記：

- （1）安裝前先執行 sudo apt update。
- （2）啟動 MariaDB，並設定開機自動啟動。

講稿：

- MariaDB 只裝在 DBD 節點。

## 27. 建立 accounting database

筆記：

- （進入投影片）以 sudo mysql -u root 登入 MariaDB 後執行。
- （1）建立存放記帳資料的 database。
- （2）建立 slurm 帳號，password 請換成自己的密碼。
- （3）只授予 slurm_acct_db 的權限。

講稿：

- password 要與 slurmdbd.conf 的 StoragePass 相同。

# Ch 3 · Example Configuration

## 28. Example Configuration

## 29. 範例設定對應 2 台機器的叢集

講稿：

- 接下來三張是同一份 slurm.conf，所有節點內容完全相同。
- slurm-compute 為 compute node。

## 30. slurm.conf：基本設定

筆記：

- （進入投影片）在所有節點建立 /etc/slurm/slurm.conf，內容完全相同。
- （1）SlurmctldHost：controller 的短 hostname，與 hostname -s 相同。
- （2）AuthType：認證 plugin。SlurmUser：執行 daemon 的帳號。
- （3）MailProg：不寄通知信時設為 /bin/true。
- （4）cgroup 追蹤與限制 job 的 process；ReturnToService=1 讓因無回應而 DOWN 的節點重新註冊時自動恢復。

講稿：

- 逐段點出設定：名稱與 controller、認證、通知信、process 追蹤與自動恢復。

## 31. slurm.conf：PID、spool 與 log 路徑

筆記：

- （進入投影片）接續上一頁。spool 與 log 目錄即先前以 root 建立並交給 slurm 的目錄。

講稿：

- 這幾行只是路徑，對照第 24 張建立的目錄即可，不需逐行說明。

## 32. slurm.conf：排程與記帳

筆記：

- （進入投影片）接續上一頁，同一份檔案的後段。
- （1）backfill 讓小 job 利用空檔；cons_tres 讓一台節點同時執行多個 job。
- （2）記帳交給 slurm-head 上的 slurmdbd，port 與 slurmdbd.conf 的 DbdPort 相同。

講稿：

- 這一段決定排程方式，以及記帳資料送到哪裡。

## 33. slurm.conf：節點與 partition

講稿：

- NodeName=DEFAULT 設定共同的硬體規格，再逐一列出每台 node 的 IP。
- 原本一行寫完的 NodeName=DEFAULT 太長，以行尾的 \ 接續到下一行；slurm.conf 會把兩行合成同一筆設定。

## 34. slurmdbd.conf

筆記：

- （進入投影片）只在 DBD 節點建立 /etc/slurm/slurmdbd.conf。
- （1）slurmdbd 監聽的位置，與 slurm.conf 的 AccountingStoragePort 相同。
- （2）連線到建立 accounting database 時的 MariaDB 帳號。
- （3）StoragePass 換成建立資料庫帳號時的密碼。

講稿：

- slurmdbd.conf 只在 DBD 節點。DbdPort 與 slurm.conf 的 AccountingStoragePort 要一致。

## 35. 保護 slurmdbd.conf

筆記：

- （1）檔案中有資料庫密碼，擁有者必須是 slurm。
- （2）權限不是 600 時，slurmdbd 會拒絕啟動。

講稿：

- 權限錯誤是 slurmdbd 啟動失敗的常見原因。

## 36. 依上下游順序啟動 daemon

講稿：

- 依上下游順序啟動：slurmdbd、slurmctld、slurmd。

## 37. 驗證叢集

筆記：

- （1）確認 controller 正常回應，輸出省略。
- （2）列出節點狀態，State 為 idle 代表可接收 job，輸出省略。
- （3）送出測試 job。叢集可以運作後，即可使用 sinfo、srun、sbatch、salloc。

講稿：

- srun 的輸出與 Introduction to Cluster 的範例相同，代表叢集已經可以接收 job。

# Ch 4 · Configuration and Operations

## 38. Configuration and Operations

## 39. slurm.conf 的重要參數

講稿：

- 只列出最常調整的參數，完整說明見 slurm.conf man page。

## 40. TreeWidth 的樹狀轉發

筆記：

- （1）slurmctld 只直接傳給 16 個 slurmd。
- （2）每個 slurmd 再轉發給最多 16 個，共 256 個。
- （3）以預設的 TreeWidth=16 為例，3 次轉發就能涵蓋超過 4000 個節點。
- （4）不轉發時，slurmctld 必須自己送出 4096 份訊息。

講稿：

- 每多一層，涵蓋的節點數乘以 16；右上角的計數顯示 slurmctld 自己始終只送出 16 份。
- 最後一步是對照：不轉發時，slurmctld 要自己送出 4096 份訊息。

## 41. 取得節點的硬體規格

筆記：

- （1）在每個 compute node 分別執行。... 省略了 CPU 拓撲欄位，完整內容與 Ch 3 的 NodeName=DEFAULT 相同。第一行可直接貼進 slurm.conf，UpTime 不屬於設定。

講稿：

- 在虛擬機上 CPU 拓撲常與實體機不同，一定要以 slurmd -C 的結果為準。

## 42. /tmp 為 tmpfs 時，不要以它的大小填 TmpDisk

講稿：

- /tmp 是 tmpfs 時，暫存空間其實是記憶體。
- job 寫入 /tmp 的檔案可能導致記憶體不足。需要暫存空間時，把 TmpFS 指向實體磁碟上的目錄，例如 /var/tmp，再填入 TmpDisk。

## 43. 修改設定後的生效方式

講稿：

- 不確定時，重啟最保險。

## 44. 查看節點狀態並恢復上線

筆記：

- （1）節點為 DOWN 或 INVALID 時，原因顯示在 Reason 欄位。輸出只保留與狀態相關的幾行。
- （2）修正設定並重啟 slurmd 後，將節點恢復上線。

講稿：

- Reason 欄位會說明節點為什麼是 DOWN。

# Ch 5 · Production Deployment

## 45. Production Deployment

## 46. 正式環境的三層架構

講稿：

- 依步驟逐層建立：Access、Control、Compute。

## 47. 備援相關名詞

講稿：

- 兩個名詞是 slurmctld 備援的基礎。

## 48. slurmctld 的 active-standby 備援

筆記：

- （1）head1 寫入狀態；head2 以 heartbeat 確認 head1 仍在運作。
- （2）head1 超過 SlurmctldTimeout 秒沒有回應時，head2 判定它故障；預設為 120 秒。
- （3）head2 讀取最後的狀態接手；執行中的 job 不受影響，因為 job 由 slurmd 執行。

講稿：

- 回應 Introduction to Cluster 的 Q1：這就是 High Availability 的做法。
- 第 2 步的計時器跑到 120 秒，對應 SlurmctldTimeout 的預設值。
- 強調切換期間執行中的 job 不受影響。

## 49. 設定 slurmctld 備援

筆記：

- （進入投影片）所有節點的 slurm.conf 都要加上，順序必須相同。
- （1）第一行為 primary，第二行起為 backup。
- （2）設太短時，primary 只是短暫忙碌也會被誤判為故障。
- （3）兩台 controller 共用、擁有者為 slurm 的狀態目錄。

講稿：

- 所有節點的 slurm.conf 都要列出兩台 controller，而且順序相同。

## 50. 測試切換

筆記：

- （1）兩台 controller 都在運作。
- （2）在 head1 停止 slurmctld，模擬 primary 故障。
- （3）等待超過 SlurmctldTimeout 後，backup 已經接手。計畫性維護時可改用 scontrol takeover 立即切換。

講稿：

- 停止 primary 後要等超過 SlurmctldTimeout，backup 才會接手。

## 51. StateSaveLocation 不能成為新的單點故障

講稿：

- 共用狀態目錄本身也要有備援，否則只是把單點故障換了位置。
- StateSaveLocation 放在一台普通的 NFS server 上時，NFS server 停機，兩台 controller 都讀不到狀態。正式環境使用雙機的 NFS 或平行檔案系統。

## 52. slurmdbd 的備援

講稿：

- 兩台 slurmdbd 寫入同一個 MariaDB。資料庫不在本機時，帳號要允許兩台 head node 連線。

## 53. slurmdbd 可以短暫停止，但不能停太久

講稿：

- MariaDB 的複寫或叢集超出這份內容的範圍。
- 兩台 slurmdbd 都停止時，slurmctld 仍可排程，記帳紀錄恢復後再補送。MariaDB 本身仍是單點故障，正式環境會再設定複寫或 Galera Cluster。

## 54. Partition 規劃：16 台 CPU node 加 4 台 GPU node

講稿：

- debug 的 node 同時屬於 cpu，不會閒置。

## 55. 設定 Partition

講稿：

- GPU 還需要 gres.conf，詳見 GRES 文件。

## 56. Partition 參數

講稿：

- DefaultTime 沒設時，backfill 幾乎無法發揮作用。

## 57. 限制每位使用者在 Login Node 上的資源

筆記：

- （進入投影片）寫入 /etc/systemd/system/user-.slice.d/，對每位使用者的 user-UID.slice 生效。
- （1）CPUQuota：200% 為 2 個 core。
- （2）MemoryMax：超過時該使用者的 process 會被 OOM kill。
- （3）MemorySwapMax=0：避免大量 swap 拖慢整台機器。
- （4）TasksMax：process 與 thread 數上限，可防止 fork bomb。

講稿：

- 寫入後執行 sudo systemctl daemon-reload，使用者重新登入後生效；root 的 user-0.slice 要另外解除限制。

## 58. 以 VIP 讓多台 Login Node 共用一個位址

講稿：

- VRRP 預設使用 multicast，許多雲端與虛擬化環境會擋掉，需要改用 unicast。
- priority 最高且仍在運作的那台成為 MASTER；VRRP 只做備援、不分流。兩台的 SSH host key 要一致，home 目錄要共用。

# Summary

## 59. 重點整理

講稿：

- 用這張回顧建置 Slurm 的重點。

## 60. Further Reading

講稿：

- 延伸主題各有獨立的文件。
- 開放提問。
