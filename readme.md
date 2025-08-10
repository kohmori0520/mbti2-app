# 🧠 次世代タイプ診断（mbti2-app）

> **3分で判定！あなたの性格タイプを AI が科学的に分析**

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-React-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.5-blue)
![AI Powered](https://img.shields.io/badge/AI-Powered-green)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

</div>

---

## ✨ 特徴

| 機能 | 説明 |
|------|------|
| 🎯 **高精度診断** | 4軸スコアから12の独自タイプへマッピング |
| 🤖 **AI分析** | OpenAI による詳細な性格分析 |
| ⚡ **高速操作** | キーボード操作対応（1/2キー、矢印キー） |
| 💾 **自動復元** | 回答の自動保存・復元機能 |
| 📊 **データ分析** | リアルタイム統計・カテゴリ別分析 |
| 🗄️ **Supabase統合** | クラウドデータベース・分析ダッシュボード |
| 💕 **相性診断** | タイプ間の相性とチーム構成分析 |
| 💼 **キャリア支援** | 詳細なキャリアガイダンス・成長アドバイス |
| 🖼️ **動的OG画像** | 結果に応じた共有用画像を自動生成 |
| 📱 **レスポンシブ** | PC・スマホ対応 |

---

## 🚀 クイックスタート

### 1️⃣ 基本セットアップ
```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.local に必要な環境変数を設定
```

### 2️⃣ Supabaseの設定

**🏠 ローカル開発（推奨）:**
```bash
# Supabase CLIをインストール（一回のみ）
brew install supabase/tap/supabase

# ローカルSupabaseを起動
npm run supabase:start

# 開発サーバー起動
npm run dev
```

**☁️ クラウド版（本番デプロイ用）:**
1. [Supabase](https://supabase.com) でプロジェクト作成
2. 環境変数を設定:
```bash
# .env.local に追加
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
3. データベーススキーマを作成:
```bash
# Supabase SQL Editor で実行
cat supabase/schema.sql
```

### 3️⃣ 開発環境の起動
```bash
# フロントエンド（React + Vite）
npm run dev
# 🌐 http://localhost:5173 で起動

# AI分析API（Express サーバー）※別ターミナルで
npm run api:dev
# 🌐 http://localhost:8787/api/analyze で起動
```

### 4️⃣ ブラウザでアクセス
🎉 `http://localhost:5173` を開いて診断開始！

**✨ 新機能:**
- `/analytics` - 分析ダッシュボード
- `/category-analysis` - カテゴリ別分析
- 詳細な相性・キャリア情報

---

## 🏗️ プロジェクト構成

```
📁 mbti2-app/
├── 📄 package.json          # 依存関係とスクリプト
├── 🌐 api/
│   ├── analyze.ts           # AI分析API（Serverless）
│   └── og.tsx              # 動的OG画像生成（Edge Function）
├── 🖥️ server/
│   └── index.js            # ローカル開発用APIサーバー
├── ⚛️ src/
│   ├── components/         # UIコンポーネント
│   ├── data/              # 質問データとタイプ定義
│   ├── logic/             # スコア計算ロジック
│   ├── pages/             # ページコンポーネント
│   └── utils/             # ユーティリティ関数
└── 🛠️ scripts/
    ├── analyze_logs.mjs    # ログ解析スクリプト
    └── apply_weight_suggestions.mjs # 重み調整スクリプト
```

---

## ⚙️ 環境変数設定

```bash
# .env ファイルに以下を設定
OPENAI_API_KEY=your-openai-api-key-here

# オプション（デフォルト値あり）
ANALYZE_CACHE_TTL_MS=3600000     # キャッシュ有効期間（1時間）
ANALYZE_RETRY_ATTEMPTS=3         # リトライ回数
ANALYZE_TIMEOUT_MS=15000         # タイムアウト（15秒）
```

> ⚠️ **重要**: `.env` 設定後は `npm run api:dev` を再起動してください

---

## 🔍 診断システムの仕組み

### 📋 診断フロー
1. **質問回答** - A/Bの二択質問に回答
2. **スコア計算** - 4軸（外向/内向、感覚/直観、思考/感情、判断/知覚）でスコアリング
3. **タイプ判定** - 12の独自タイプにマッピング
4. **AI分析** - OpenAI による詳細分析
5. **結果表示** - 強みや成長ポイントを表示

### 🎮 操作方法
| キー | 動作 |
|------|------|
| `1` or `A` | 選択肢A |
| `2` or `B` | 選択肢B |
| `←` | 前の質問 |
| `→` | 次の質問 |
| `Enter` | 確定 |

---

## 📊 データ分析機能

### ログの保存とエクスポート
診断結果画面の「**ログをCSVで保存**」ボタンからデータをダウンロード

### ログ解析による重み調整
```bash
# 1. ログファイルを解析（最小サンプル数: 20）
npm run analyze:logs -- "/path/to/personality_logs.csv" 10

# 2. 重み提案の適用（バックアップ自動作成）
npm run apply:weights
```

> 💡 **Tip**: サンプル数が少ない場合は第2引数で最小サンプル数を下げてください

---

## 🖼️ 動的OG画像

### 🎨 画像の確認方法
```
https://your-domain/api/og?title=タイプT1&subtitle=リーダー型&accent=%23007AFF
```
> ⚠️ **注意**: `#` は `%23` にエンコードしてください

### 📝 HTML設定例
```html
<meta property="og:title" content="次世代タイプ診断" />
<meta property="og:description" content="あなたのタイプを3分で診断" />
<meta property="og:image" content="https://your-domain/api/og?title=次世代タイプ診断&subtitle=3分で判定&accent=%23007AFF" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
```

---

## 🚢 デプロイ（Vercel）

### 1️⃣ Vercel設定
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/analyze.ts": { "runtime": "nodejs18.x" },
    "api/og.tsx": { "runtime": "edge" }
  }
}
```

### 2️⃣ 環境変数の設定
Vercel Dashboard → Project Settings → Environment Variables
- `OPENAI_API_KEY`
- その他のオプション変数

### 3️⃣ 自動デプロイ
メインブランチにプッシュすると自動でデプロイされます 🎉

---

## 🔧 よくある問題と解決方法

### ❌ `ECONNREFUSED` エラー
```bash
# 解決方法: APIサーバーを起動
npm run api:dev
```

### ❌ OG画像の色が反映されない
```bash
# 解決方法: # を %23 にエンコード
❌ #007AFF
✅ %23007AFF
```

### ❌ zshでファイルパスエラー
```bash
# 解決方法: パスをクォートで囲む
npm run analyze:logs -- "/path/with spaces/file.csv"
```

### ❌ データスキーマエラー
開発者コンソールで警告を確認し、以下のJSONファイルを修正：
- `src/data/personality_questions.json`
- `src/data/persona_details.json`

---

## 🧪 技術スタック

| カテゴリ | 技術 |
|----------|------|
| **Frontend** | React 18, TypeScript, Vite |
| **Backend** | Express.js, Node.js |
| **AI** | OpenAI API |
| **Deploy** | Vercel (Serverless + Edge Functions) |
| **Validation** | Zod |
| **Storage** | LocalStorage |

---

## 📄 ライセンス

内部利用前提の試作品です。外部配布時は質問文やタイプ記述等のコンテンツの権利表記にご注意ください。

---

<div align="center">

**🎯 3分で始める性格診断 - より深い自己理解へ**

[デモを見る](#) | [バグ報告](https://github.com/your-repo/issues) | [機能要望](https://github.com/your-repo/discussions)

</div>