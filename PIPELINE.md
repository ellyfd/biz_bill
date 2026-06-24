# 專案 Pipeline 說明

這份文件把 biz_bill 目前的運作拆成兩條 pipeline:**開發→上線**、**App 內部資料流**,並誠實記錄目前的現況落差。

---

## A. 開發 → 上線 Pipeline

```
①改 index.html → ②無頭瀏覽器驗證 → ③commit/push 分支 → ④PR→Merge 進 main → ⑤GitHub Pages → ⑥手機
```

| 階段 | 做什麼 | 細節 |
|---|---|---|
| ① 改碼 | 直接改**根目錄 `index.html`**(自包含建置檔,React / JS / CSS 全內嵌,約 200KB) | 開發環境裝不了 npm、連不到 CDN,**跑不了 `vite build`**,所以無法從 `source/` 重新產生 |
| ② 驗證 | 用 Playwright 無頭 Chromium 起本地 server,截圖 + 斷言 | 確保不白畫面、零 console error 才提交 |
| ③ 版本 | `git commit` → `git push` 到分支 `claude/github-pages-deploy-fcck32` | |
| ④ 合併 | 開 Pull Request → **人工按 Merge** 進 `main` | |
| ⑤ 部署 | GitHub Pages 服務 `main` 的**根目錄** | 約 1 分鐘上線 `https://ellyfd.github.io/biz_bill/` |
| ⑥ 取得 | 手機開啟 | Service Worker(`sw.js`)採 network-first,通常自動抓新版 |

**根目錄 = GitHub Pages 直接服務的檔案：**
- `index.html` — 自包含 App(上線主體)
- `manifest.webmanifest`、`sw.js`、`icon-192.png`、`icon-512.png`、`apple-touch-icon.png` — PWA 資產

---

## B. App 內部資料 Pipeline(使用者操作流)

```
登入選人 → 選/開出差 → 記一筆(拍照→OCR / 手動)→ 存 localStorage(鎖匯率)→ 流水帳 / 報表 / 要印 → 匯出 CSV
```

### 儲存層(localStorage keys)

| Key | 內容 |
|---|---|
| `bb_users` | 使用者清單 `[{id,name}]` |
| `bb_cur` | 目前登入的使用者 id |
| `bb_trips_<uid>` | 某使用者的所有出差 `[{id,name,period,range,flags,currencies,cur0}]` |
| `bb_exp_<uid>_<tid>` | 某趟的所有帳;每筆含 `twd`(存檔當下鎖定的台幣值) |
| `bb_rates` | 自訂匯率(各幣別對 TWD) |
| `bb_curlist` | 啟用中的幣別清單 |
| `biz_bill_v1` | 舊版單一行程資料 → 首次載入自動遷移成「我」+ Paris & Poland |

### 關鍵設計

- **鎖匯率**:每筆記帳當下就把台幣金額存進 `twd`;之後改匯率不會動到歷史帳,報表/總計優先用 `twd`。
- **OCR**:拍收據後在**手機本地**用 Tesseract.js 辨識金額/日期(唯一會連 CDN `jsdelivr` 的功能;其餘全內嵌、可離線)。收據照片壓縮後存本機,不外傳。

---

## C. ⚠️ 現況落差(重要)

**目前真正的 source of truth 是根目錄 `index.html`,不是 `source/`。**

- `source/`(完整 Vite + React 專案)**已落後**:只含「單一行程的記帳畫面」+ 螢幕層的零星改動;**沒有**多行程 / 登入 / 首頁 / 報表 / 匯率設定 / 新版記帳版面——這些都是**直接在 `index.html` 上做的**。
- 也就是說:目前是「**手維護建置檔**」流程,**不是**「source → build → deploy」。

### 不能做的事
- **不要**設「自動 `vite build` 覆蓋 `index.html`」的 CI/CD——會用落後的 `source/` **覆蓋退版**現在的 App。

### 要恢復「source → build → deploy」的話(未來工程)
1. 把 `source/src/App.jsx` 補回與 `index.html` 一致(多行程、登入、報表…全部),在**本機或 CI** 用 `npm install && npm run build` 驗證。
2. 確認 `vite build` 產出的 `dist/index.html` 與現行上線版一致後,才考慮自動化部署。

---

## 指令備忘(本機重建,環境允許時)

```bash
cd source
npm install
npm run build        # vite-plugin-singlefile 產生單檔 dist/index.html
cp dist/index.html ../index.html
cp -r public/* ..    # manifest / sw / icons
```

> 注意:在「現況落差」未解決前,上面這個重建會把線上版**退回舊的單一行程版**,勿直接執行。
