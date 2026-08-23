# ST Pocket UI

為 SillyTavern 製作的響應式雙端擴充介面。

## 專案資訊

- Project ID：`st-pocket-ui`
- Canonical Path：`D:\AI-Projects\st-pocket-ui`
- 專案狀態：ACTIVE

## 已確認方向

- 以 SillyTavern Extension（擴充）形式開發，不直接修改 SillyTavern 核心程式。
- 「雙端」指手機與電腦。
- 介面預設依螢幕尺寸自動調整，提供適合手機與電腦的響應式版面。
- 保留手動切換手機／電腦介面模式的能力，讓使用者能覆蓋自動判斷。

## 初步設計原則

1. 優先遵循 SillyTavern Extension 的載入方式與公開介面。
2. 共用功能與資料狀態，避免手機版和電腦版演變成兩套難以同步的程式。
3. 以響應式版面作為基礎，手動切換作為明確的使用者偏好設定。
4. 不在需求尚未確認前擅自加入框架、資料庫或部署服務。
5. 不把憑證、Token、API Key 或個人登入資訊提交到專案。

## 第一版範圍

- 從聊天主畫面開始：訊息區、輸入列、左右側面板。
- 手機版以單手閱讀、輸入、發送與開關側欄為第一個驗收目標。
- iPhone 使用 CSS safe-area 安全區域，避開動態島／瀏海與底部手勢區。
- 提供自動、手機、電腦三種顯示模式，選擇會保存在目前瀏覽器。
- 電腦模式維持 SillyTavern 原有桌面操作習慣。

## 目前檔案

- `manifest.json`：SillyTavern Extension 描述檔。
- `index.js`：模式切換與偏好保存。
- `style.css`：聊天主畫面的響應式與 iPhone 安全區域樣式。
- `preview.html`：不需安裝 SillyTavern 即可開啟的獨立預覽頁。
- `preview.css`、`preview.js`：僅供預覽使用的裝置畫框、模擬介面與操作。

## 開啟預覽

直接使用瀏覽器開啟 `preview.html`。預覽頁可切換 iPhone／電腦畫框，以及自動／手機／電腦顯示模式；手機畫框中的左右按鈕可測試抽屜式側欄。

預覽頁只用於確認外觀與基本操作感，不代表已完成 SillyTavern 的 DOM、主題及其他擴充相容性驗證。

## 下一步待確認

- 需要支援的 SillyTavern 最低版本與目標瀏覽器。
- 安裝至實際 SillyTavern 後，確認目前版本的 DOM 結構與既有主題是否需要相容調整。

目前已建立可安裝的最小 Extension 骨架；完成實機安裝與操作驗收前，狀態為 IMPLEMENTED。
