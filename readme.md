# 🧠 次世代タイプ診断（mbti2-app）

> **3分で判定！認知科学に基づいた本格的性格分析アプリ**

<div align="center">

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

</div>

---

## ✨ 主要機能

### 🎯 **科学的診断システム**
- **高精度判定**: 4軸スコアから16の詳細タイプへマッピング
- **適応型質問**: 回答パターンを学習して最適化
- **信頼度算出**: 回答一貫性による結果の信頼性評価

### 🧠 **深層分析コンテンツ**
- **認知機能解説**: 主機能・補助機能・劣勢機能の詳細分析
- **ストレスパターン**: 個別化されたストレス管理アドバイス
- **成長段階**: 年代別の発達課題と成長計画
- **実践ガイド**: 人間関係・仕事・学習での活用法

### 📊 **高度な分析機能**
- **リアルタイム統計**: タイプ分布・完了率・パフォーマンス指標
- **カテゴリ別分析**: 気質・思考スタイル・ワークスタイル・コミュニケーション
- **時系列追跡**: 日次・週次・月次のトレンド分析
- **レイテンシ分析**: 回答速度パターンと意思決定スタイル

### 💼 **キャリア・成長支援**
- **相性診断**: タイプ間の相性とチーム構成最適化
- **キャリアガイダンス**: 理想的な職場環境・役割・成長機会
- **個別ロードマップ**: 1ヶ月・3ヶ月・1年の成長計画

### 🛠️ **技術的特徴**
- **ローカル開発**: Supabase Local Development対応
- **高速UI**: キーボード操作・プログレッシブUI
- **データ永続化**: LocalStorage + Supabase ハイブリッド
- **分析ダッシュボード**: 管理者向けリアルタイム監視

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
supabase start

# スキーマ適用とデータ投入
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/schema.sql
npm run seed:content

# ダミーデータ投入（開発・テスト用）
npm run seed:dummy

# 開発サーバー起動
npm run dev
```

**☁️ クラウド版（本番デプロイ用）:**
1. [Supabase](https://supabase.com) でプロジェクト作成
2. 環境変数を`.env.local`に設定:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
3. データベーススキーマとデータを投入:
```bash
# SQL Editor で supabase/schema.sql の内容を実行
# またはCLI経由で:
supabase db push

# シードデータ投入
node scripts/seed_content.mjs
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

**✨ アクセス可能なページ:**
- `/` - メイン診断
- `/analytics` - 高度な分析ダッシュボード
- `/category-analysis` - カテゴリ別詳細分析
- `/types` - 全タイプ一覧（相性・キャリア情報付き）

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

### 📁 環境ファイル構成

```
.env.example           # テンプレートファイル（Git管理対象）
.env                   # デフォルト設定（リモートSupabase）
.env.local             # 本番用設定（Git管理対象外）
.env.development.local # ローカル開発用設定（Git管理対象外）
```

### 🏠 ローカル開発環境

**`.env.development.local`（ローカルSupabase使用時）:**
```bash
# ローカルSupabase設定
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# シードスクリプト用
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_URL=http://127.0.0.1:54321
```

### ☁️ 本番環境

**`.env.local`（リモートSupabase使用時）:**
```bash
# 本番Supabase設定
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# シードスクリプト用（必要に応じて）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 🤖 AI分析機能（オプション）

```bash
# OpenAI API設定
OPENAI_API_KEY=your-openai-api-key-here

# オプション（デフォルト値あり）
ANALYZE_CACHE_TTL_MS=3600000     # キャッシュ有効期間（1時間）
ANALYZE_RETRY_ATTEMPTS=3         # リトライ回数
ANALYZE_TIMEOUT_MS=15000         # タイムアウト（15秒）
```

### 🔄 環境切り替え手順

**ローカル開発に切り替え:**
```bash
# 1. ローカルSupabaseを起動
supabase start

# 2. .env.development.localがあることを確認
ls -la .env*

# 3. 開発サーバー起動（自動的に.env.development.localを使用）
npm run dev
```

**本番ビルドテスト:**
```bash
# 1. .env.localに本番設定があることを確認
cat .env.local

# 2. 本番用ビルド（.env.localを使用）
npm run build

# 3. プレビュー
npm run preview
```

> ⚠️ **重要**: 
> - `.env.development.local` - 開発時（`npm run dev`）に使用
> - `.env.local` - ビルド時（`npm run build`）に使用
> - 環境変数変更後は開発サーバーを再起動してください

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

## ✅ 動作確認手順

### 📋 ローカル環境での確認

```bash
# 1. Supabaseの稼働確認
supabase status
# ✅ API URL: http://127.0.0.1:54321 が表示されること

# 2. データベース接続確認
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT COUNT(*) FROM personas;"
# ✅ 28行が返されること

# 3. ダミーデータ確認（投入している場合）
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT COUNT(*) FROM results;"
# ✅ 100行が返されること（ダミーデータ投入後）

# 3. アプリケーション起動確認
npm run dev
# ✅ http://localhost:5175 でアプリが表示されること

# 4. データ保存確認（実際に診断を1つ完了してみる）
# ✅ 診断結果が表示され、Supabase Studioでデータ確認可能
```

### 🌐 本番環境での確認

```bash
# 1. 本番用ビルド
npm run build
# ✅ エラーなくビルド完了

# 2. プレビュー起動
npm run preview
# ✅ http://localhost:4173 で本番ビルドが動作

# 3. リモートSupabaseでのデータ保存確認
# ✅ .env.localのリモート設定で診断完了＆データ保存確認
```

### 🛠️ Supabase Studio での確認

1. http://127.0.0.1:54323 を開く（ローカル）
2. 以下のテーブルにデータが存在することを確認:
   - `personas` - 28行
   - `persona_keywords` - 72行  
   - `type_relationships` - 192行
   - `sessions`, `answers`, `results` - 診断完了後にデータ追加

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