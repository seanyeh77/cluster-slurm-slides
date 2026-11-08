# Introduction to Cluster and Slurm

Cluster 架構、Slurm 的使用與建置的 Slidev 簡報。前半部（Ch 1 到 Ch 4）從使用者的角度認識 cluster 並送出 job，後半部（Ch 5 到 Ch 9）從管理員的角度安裝與設定 Slurm，兩部分使用同一座範例叢集 `slurm-head` 與 `slurm-compute`。

- [slides/](slides/)：Slidev 簡報，共 109 張。線上版：https://seanyeh77.github.io/cluster-slurm-slides/
- [SCRIPT.md](SCRIPT.md)：逐張投影片的筆記與講稿。投影片本身不含講者備註。
- 指令清單：https://seanyeh77.github.io/cluster-slurm-slides/commands.html ，由 `slides/scripts/gen-commands.mjs` 在 build 時從 Ch 4 的投影片自動產生。

## 簡報

```bash
cd slides
npm install
npm run dev      # 本機預覽，按 p 開講者模式
npm run build    # 輸出靜態網頁到 slides/dist
npm run tokens   # 從 ui-design-system 更新 styles/tokens.css
```

| 檔案 | 內容 |
| --- | --- |
| `slides.md` | 設定與封面，依序引入 `pages/` |
| `pages/00-intro.md` ~ `11-summary.md` | 學習目標、Ch 1 到 Ch 9、總結 |
| `layouts/` | Textbook 版型：cover、textbook、section、quiz、compare、focus、figure、reference、bento 等 |
| `components/` | `TerminalTyping`、`AnnotatedCommand`、`ConfigDiff`、`Note`、`Tile`，以及分步圖 `Stepper` 與 `Dg*` |
| `styles/` | 版型樣式；`tokens.css` 來自 ui-design-system |

## 主題

配色與字型來自 [seanyeh77/ui-design-system](https://github.com/seanyeh77/ui-design-system) 的 `teaching` preset：暖灰中性色、Inter 加思源黑體、Geist Mono，搭配青綠強調色 `#0f766e`、直角與細線邊框。`setup/main.ts` 在根元素設定 `data-theme="teaching"`，樣式只讀 token 名稱；GitHub Actions 每次建置前會以 `scripts/sync-tokens.mjs` 取得最新的 `tokens.css`。

push 到 main 且 `slides/` 有變動時，GitHub Actions 會自動建置並部署到 GitHub Pages。
