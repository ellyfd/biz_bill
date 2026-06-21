# 出差報帳 · biz_bill

**把出差報帳,變成「拍張照」的事。**

多幣別、隨拍隨記、自動換算台幣的出差記帳 App。打開網頁就能用,還能加到手機主畫面像原生 App 一樣 —— 不用註冊、不用後端,資料只留在你自己手機裡。

👉 **立即試用:<https://ellyfd.github.io/biz_bill/>**

---

## 出差最痛的,不是花錢,是回來對帳

> 一疊皺掉的收據、三種貨幣、看不懂的匯率、Excel 拉到天荒地老⋯⋯

biz_bill 把這整件事壓縮成 **三秒一筆**:

- 🧾 **隨拍隨記** — 拍下收據,金額和日期自動帶入,你只要確認。
- 💱 **多幣別自動換算** — EUR / PLN / USD⋯⋯即時換成 TWD,這趟總共花多少一眼看到。
- 🖨️ **拍了就是有收據,沒拍的自動標「要印」** — 報帳前該補印哪幾張,清清楚楚。

## ✨ 亮點

| | |
|---|---|
| 🏠 **多趟出差,各自分開** | 巴黎、東京、波蘭⋯⋯每趟一本帳,首頁總計一目了然 |
| 👥 **不同人各記各的** | 一支手機多個使用者,點名字進去,帳目互不混淆 |
| 🤖 **收據 OCR(手機本地)** | 拍完自動讀金額 / 日期,辨識在你手機上跑,**照片不外傳** |
| 🔍 **收據隨點隨看** | 每筆都留著照片,點一下放大檢視 |
| 📝 **聰明備註** | 選「車資」自動提示「地鐵票、計程車」,報帳寫得清楚 |
| ✏️ **隨手改、隨手刪** | 點任一筆就能改,記錯不卡關 |
| 📱 **加到主畫面當 App** | 全螢幕、可離線,跟原生 App 一樣順 |

## 🔒 你的帳,只在你手機裡

沒有後端、沒有帳號、沒有雲端資料庫。所有資料(含收據照片)都存在你自己的瀏覽器裡(localStorage),OCR 也在裝置本地完成。**不用把商務收據交給任何人。**

## 🚀 30 秒記一筆

1. 選一趟出差(或新增一趟)
2. 拍下收據 → 金額 / 日期自動帶入
3. 選類別、確認金額 → 存下這筆

完成。這趟花了多少、哪幾張要補印,首頁直接看。

## 🎯 為誰打造

- 常出國出差、回來要報帳的人
- 一趟跑好幾國、收據幣別一團亂的人
- 受不了 Excel、只想拍照記帳的人

---

## 🛠 給開發者

### 部署(GitHub Pages,零建置)

GitHub Pages 直接服務 repo 根目錄,**不需要建置步驟**。根目錄就是上線檔案:

- `index.html` — 自包含的 App(JS / CSS 全部內嵌)
- `manifest.webmanifest`、`sw.js`、`icon-192.png`、`icon-512.png`、`apple-touch-icon.png` — PWA 資產

Settings → Pages → Source:`main` 分支 `/ (root)`。

### 原始碼與重新建置

`source/` 是完整的 Vite + React 專案(原始碼)。改完功能後重新建置:

```bash
cd source
npm install
npm run build        # 用 vite-plugin-singlefile 產生 dist/index.html(單檔內嵌)
cp dist/index.html ../index.html
cp -r public/* ..    # manifest / sw / icons
```

> 註:根目錄的 `index.html` 是建置產物。若只是小修,也可直接改 `source/` 再重建,
> 不要手改根目錄的壓縮檔。

### 技術

React + Vite + Tailwind,打包成單一 HTML;PWA(service worker,network-first,離線可用);收據 OCR 採 [Tesseract.js](https://github.com/naptha/tesseract.js)(裝置端執行)。

---

夠用、好看、放口袋。出差愉快 ✈️
