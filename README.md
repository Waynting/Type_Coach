# 智能打字訓練系統
> 本地優先的智能打字遊戲，具備弱點診斷與適應性訓練功能

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)](https://tailwindcss.com/)

## 🚀 快速開始

### 前置需求
- Node.js 18+ 
- npm

### 安裝與運行
```bash
# 複製存儲庫
git clone <repository-url>
cd Hw2

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000) 開始使用！

### 生產環境建置
```bash
# 建立最佳化版本
npm run build

# 本地運行生產版本
npm start
```

## 🚀 核心功能

### 遊戲體驗
- **MonkeyType 風格介面**：流暢的文字滾動，游標始終保持在中間行
- **多種練習模式**：
  - **標準測試**：60 秒快速評估
  - **自訂計時器**：設定任意時長（10 秒 - 30 分鐘）進行計時或適應性訓練
  - **段落模式**：經典段落打字，自然換行
  - **文章練習**：使用真實文章內容練習
  - **適應性訓練**：AI 生成針對個人弱點的練習內容

### 進階分析
- **即時指標**：即時顯示 WPM、準確度和反應時間
- **弱點診斷**：
  - 個別按鍵效能分析，使用 EWMA 演算法追蹤反應時間
  - 雙字母組合分析，識別字母配對弱點
  - 混淆矩陣追蹤常見打字錯誤
- **智能評分**：結合錯誤率、反應時間 Z 分數和近期錯誤的綜合弱點評分

### 適應性訓練系統
- **智能文字生成**：變長度詞彙（不只是 3 字符標記）
- **針對性練習**：生成專注於最弱按鍵和雙字母組合的訓練
- **漸進式難度**：適應您的技能水平，目標速度 675 CPM
- **數字模式**：所有練習模式可選擇包含數字（0-9）

### 使用者體驗
- **本地優先**：所有數據使用 IndexedDB 和 localStorage 本地儲存
- **即時開始**：開始打字即可，無需點擊開始按鈕
- **視覺回饋**：即時錯誤高亮和流暢轉場效果
- **無障礙設計**：符合 WCAG 2.1 AA 標準，支援螢幕閱讀器
- **響應式設計**：在桌面和移動設備上無縫運作

## 🏗️ 技術架構

### 前端技術棧
```
Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
```

### 資料儲存
- **IndexedDB（透過 Dexie）**：會話歷史和打字分析
- **localStorage**：使用者檔案和設定
- **無需伺服器**：完全離線可用的應用程式

### 核心引擎組件

#### 1. 按鍵分析 (`/src/engine/keystats.ts`)
- 將鍵盤事件處理為詳細的效能指標
- 使用標準 5 字符單詞測量計算 WPM
- 字符級別的準確度追蹤
- 實作 EWMA 進行平滑反應時間追蹤
- 更新雙字母統計分析

#### 2. 弱點檢測 (`/src/engine/weakness.ts`)
- **弱點評分演算法**：`0.6×錯誤率 + 0.3×反應時間Z分數 + 0.1×近期錯誤`
- 識別最弱的按鍵和字母組合
- 生成常見打字錯誤的混淆矩陣
- 提供可操作的改善建議

#### 3. 適應性文字生成 (`/src/engine/scheduler.ts`)
- 基於弱點分析的智能訓練生成
- 變長度詞彙庫提供豐富練習內容
- 字符到鍵碼轉換確保準確輸入驗證
- 支援混合內容和可選數字包含

### UI/UX 特色

#### MonkeyType 風格文字顯示
```typescript
// 智能文字視窗與換行刷新
const getTextWindow = () => {
  const charsPerLine = 65
  const currentGlobalLine = Math.floor(currentIndex / charsPerLine)
  const windowStartLine = Math.max(0, currentGlobalLine - 1)
  // 保持打字位置在中間行，流暢滾動
}
```

#### 即時輸入處理
- 首次按鍵立即開始遊戲
- 字符級別驗證與視覺回饋
- 流暢錯誤高亮和恢復
- 支援退格和修正

## 🛠️ 開發指南

### 可用腳本
```bash
npm run dev      # 啟動開發伺服器
npm run build    # 建立生產版本
npm start        # 運行生產版本
npm run lint     # 執行 ESLint
npm run type-check # 執行 TypeScript 編譯器檢查
```

## 📁 專案結構

```
src/
├── app/                 # Next.js 應用路由頁面
│   ├── page.tsx        # 儀表板首頁
│   ├── play/           # 主要打字介面
│   └── review/         # 會話結果和分析
├── components/         # 可重用 UI 組件
│   ├── ui/            # shadcn/ui 基礎組件
│   ├── CustomTimerDialog.tsx
│   ├── ArticleSelectionDialog.tsx
│   └── HelpButton.tsx
├── engine/            # 核心打字遊戲邏輯
│   ├── keystats.ts   # 效能指標計算
│   ├── weakness.ts   # 弱點分析演算法
│   ├── scheduler.ts  # 適應性文字生成
│   └── types.ts      # TypeScript 類型定義
├── lib/              # 工具函數
│   ├── db.ts        # IndexedDB 資料庫層
│   ├── articles.ts  # 文章內容管理
│   └── utils.ts     # 通用工具
└── styles/          # 全域 CSS 和 Tailwind 配置
```

## 🧠 關鍵演算法

### 弱點評分
弱點檢測系統使用精密的評分演算法：

```typescript
function weaknessScore(stat: KeyStat): number {
  const errorRate = stat.errors / Math.max(1, stat.attempts)
  const rtZScore = (stat.ewmaRt - globalMeanRt) / globalStdRt
  const recentErrorPenalty = stat.recentErrors * 0.1
  
  return 0.6 * errorRate + 0.3 * rtZScore + recentErrorPenalty
}
```

### 適應性文字生成
內容即時適應使用者表現：

1. **弱點分析**：識別前 10 個最弱的按鍵和雙字母組合
2. **內容混合**：平衡針對性練習與多樣化詞彙
3. **動態長度**：生成符合會話時長的內容（675 CPM 目標）
4. **智能詞彙**：使用多樣化詞長而非重複短標記

### 效能指標
- **WPM 計算**：`(正確字符數 / 5) / (經過分鐘數)`
- **準確度**：`(正確字符數 / 總字符數) × 100`
- **反應時間**：可配置 alpha 因子的 EWMA 平滑
- **進度追蹤**：逐次會話改善分析

## 🎯 使用指南

### 入門指引
1. **首頁儀表板**：查看統計資料並選擇練習模式
2. **開始打字**：立即開始 - 無需點擊按鈕
3. **即時回饋**：觀看 WPM 和準確度即時更新
4. **檢視結果**：分析表現並獲得個人化建議

### 練習模式
- **標準測試**：快速 60 秒評估
- **自訂計時器**：設定偏好的時長和選項
- **段落**：自然文字流的延伸練習
- **文章**：使用真實世界內容練習
- **適應性訓練**：針對弱點的目標改善

### 最大化改善效果
1. 使用**適應性訓練**專注於特定弱點
2. 啟用**數字模式**進行全面練習
3. 檢視**混淆矩陣**識別常見錯誤
4. 定期使用不同內容長度練習

## 🔒 隱私與資料

- **100% 本地**：資料絕不離開您的設備
- **無分析追蹤**：無追蹤或遙測
- **離線可用**：無需網路連線即可運作
- **資料控制**：完全控制您的練習資料

## 🤝 貢獻

本專案遵循現代 React/Next.js 最佳實踐：
- 組件組合優於繼承
- TypeScript 確保類型安全
- 無障礙設計模式
- 效能最佳化渲染

## 📄 授權

MIT 授權 - 歡迎用於學習或個人用途。

---

使用 Next.js 15、TypeScript 和現代網路技術精心打造 ❤️