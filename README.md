# Cluster 與 Slurm 簡報

兩份 Slidev 簡報，使用同一座範例叢集 `slurm-head` 與 `slurm-compute`，共用版型與元件：

| 簡報 | 內容 | 線上版 | 講稿 |
| --- | --- | --- | --- |
| Introduction to Cluster | Cluster 的架構、Shared File System 與 Workload Manager，以 Slurm 送出第一個 job | https://seanyeh77.github.io/cluster-slurm-slides/intro/ | [SCRIPT-intro.md](SCRIPT-intro.md) |
| Building and Installing Slurm | 建置前的同步、從原始碼安裝、最小設定，以及正式環境的備援與 partition 規劃 | https://seanyeh77.github.io/cluster-slurm-slides/build/ | [SCRIPT-build.md](SCRIPT-build.md) |

- 入口頁：https://seanyeh77.github.io/cluster-slurm-slides/
- 指令清單：https://seanyeh77.github.io/cluster-slurm-slides/commands.html ，由 `slides/scripts/gen-commands.mjs` 在 build 時從 Introduction to Cluster 的 hands-on 投影片自動產生。
- 講稿逐張列出 NOTE 欄的筆記與講者要說的內容；投影片本身不含講者備註。

## 開發

```bash
cd slides
npm install
npm run dev         # 預覽 Introduction to Cluster，按 p 開講者模式
npm run dev:build   # 預覽 Building and Installing Slurm
npm run build       # 兩份簡報與入口頁輸出到 slides/dist
npm run tokens      # 從 ui-design-system 更新 styles/tokens.css
```

| 檔案 | 內容 |
| --- | --- |
| `intro.md`、`build.md` | 兩份簡報的設定與封面，依序引入 `pages/intro/`、`pages/build/` |
| `site/` | 入口頁 `index.html` 與首頁索引用的 `slides.json`，build 時複製到 `dist/` 根目錄 |
| `layouts/` | Textbook 版型：cover、textbook、section、quiz、compare、focus、figure、reference、bento 等 |
| `components/` | `TerminalTyping`、`AnnotatedCommand`、`ConfigDiff`、`Note`、`Tile`，以及分步圖 `Stepper` 與 `Dg*` |
| `styles/` | 版型樣式；`tokens.css` 來自 ui-design-system，`tokens-pinned.css` 由 `scripts/pin-tokens.mjs` 產生 |
| `scripts/check-diagrams.py` | 逐步檢查每張 SVG 圖：線穿過方框、線壓到文字、文字重疊或超出、被 viewBox 切掉、縮小到 1x 以下 |

## 主題

配色與字型來自 [seanyeh77/ui-design-system](https://github.com/seanyeh77/ui-design-system) 的 `teaching` preset：暖灰中性色、Inter 加思源黑體、Geist Mono，搭配青綠強調色 `#0f766e`、直角與細線邊框。樣式只讀 token 名稱；token 同時固定在 `body, #app`，外層頁面設成深色主題時仍維持淺色。GitHub Actions 每次建置前會取得最新的 `tokens.css`。

push 到 main 且 `slides/` 有變動時，GitHub Actions 會建置兩份簡報並部署到 GitHub Pages。
