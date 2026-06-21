# 出差報帳 · biz_bill

三秒記帳的出差報帳小工具 — 多幣別、自動換算 TWD。手機可「加入主畫面」當 App 用。

線上版:<https://ellyfd.github.io/biz_bill/>

## 功能

- 數字鍵盤快速記一筆,選類別 / 幣別 / 付款方式 / 人數 / 收據狀態 / 備註
- 多幣別即時小計 + 自動換算這趟總計(TWD)
- **點清單任一筆可編輯**,右側 ✕ 可刪除
- **資料持久化**:記的帳存在手機瀏覽器(localStorage),重整或重開不會掉
- **PWA**:可加入主畫面、全螢幕、離線可用

## 部署(GitHub Pages)

GitHub Pages 直接服務 repo 根目錄,**不需要建置步驟**。根目錄就是上線檔案:

- `index.html` — 自包含的 App(JS/CSS 全部內嵌)
- `manifest.webmanifest`、`sw.js`、`icon-192.png`、`icon-512.png`、`apple-touch-icon.png` — PWA 資產

Settings → Pages → Source: `main` 分支 `/ (root)`。

## 原始碼與重新建置

`source/` 是完整的 Vite + React 專案(原始碼)。改完功能後重新建置:

```bash
cd source
npm install
npm run build        # 用 vite-plugin-singlefile 產生 dist/index.html(單檔內嵌)
```

接著把產物覆蓋到根目錄上線:

```bash
cp dist/index.html ../index.html
cp -r public/* ..        # manifest / sw / icons
```

> 註:根目錄的 `index.html` 是建置產物。若只是小修,也可直接改 `source/` 再重建,
> 不要手改根目錄的壓縮檔。
