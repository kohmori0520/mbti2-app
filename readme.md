### 次世代タイプ診断（mbti2-app）

- **技術**: Vite + React + TypeScript
- **機能**: 4軸スコアから12タイプへマッピング / キーボード操作 / バック・スキップ / 回答の自動復元 / 重み付きスコアリング / 信頼度スコア / AI分析 / ログ出力と解析 / 動的OG画像

---

### セットアップ

```bash
npm i
```

---

### 開発（ローカル）

- フロントエンド（Vite）
```bash
npm run dev
# http://localhost:5173
```

- AI分析API（Express）
```bash
npm run api:dev
# http://localhost:8787 に /api/analyze が立ち上がります
# Vite は /api を 8787 にプロキシします（vite.config.ts）
```

- Edge OG画像のローカル確認（任意）
  - `api/og.tsx` は Vercel の Edge Function 用です。Vite の `npm run dev` では動きません。
  - ローカルで試す場合は `vercel dev` を利用してください。

---

### 必要な環境変数（.env）

- `OPENAI_API_KEY`（AI分析で必須）
- 任意調整用
  - `ANALYZE_CACHE_TTL_MS`（デフォルト 3600000ms）
  - `ANALYZE_RETRY_ATTEMPTS`（デフォルト 3）
  - `ANALYZE_TIMEOUT_MS`（デフォルト 15000）

`.env` を用意後、ローカルAPIを再起動してください。

---

### データスキーマ検証（開発時）

`src/main.tsx` で `zod` により以下JSONを起動時チェックします（DEVのみ）:
- `src/data/personality_questions.json`
- `src/data/persona_details.json`

不整合がある場合はブラウザコンソールに警告が出ます。

---

### 診断フローの主な仕様

- A/B キーは内部的に `'A'|'B'` を使用（UIの 1/2 キー押下は `A/B` にマップ）
- 質問には `weight` を設定可能（集計時に反映）
- 軸ごとの回答数に基づく正規化 + 信頼度スコア算出
- 回答・結果は `localStorage` にログ保存（UI から CSV 出力可能）
- 「もう一度」ボタンは `localStorage` をクリアして最初からやり直し

---

### ログ解析と重み更新

1) UI の結果画面から「ログをCSVで保存」

2) 解析（デフォルトの最小サンプル数 minN=20。小さくするなら第2引数）
```bash
npm run analyze:logs -- \
  "/path/to/personality_logs.csv" 10
# 出力: weight_suggestions.json
```

3) 提案の適用（`src/data/personality_questions.json` を更新。バックアップ自動作成）
```bash
npm run apply:weights
```

Tips:
- サンプルが少ないと `No suggestions to apply` になります。`minN` を下げるか、データを集めてください。
- zsh でスペースや括弧があるパスは必ずクォートしてください。

---

### 共有とOG画像（画像の事前用意は不要）

- 画像は `api/og.tsx` が動的生成します。以下URLをそのまま開いて確認できます：
```
https://<your-domain>/api/og?title=タイプT1&subtitle=共感的リーダー&accent=%23007AFF
```
  - 色の `#` は `%23` にエンコードしてください。

- 共通OG画像を使う（最短）
  - `index.html` の `<head>` に以下を追加（例）：
```html
<meta property="og:title" content="次世代タイプ診断" />
<meta property="og:description" content="あなたのタイプを3分で診断。" />
<meta property="og:image" content="https://<your-domain>/api/og?title=次世代タイプ診断&subtitle=3分で判定&accent=%23007AFF" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
```

- タイプ別にOGを変える（本格運用）
  - SPAはクローラーがJSを実行しないため、共有用のサーバールート（例 `https://<domain>/share/T1`）を Edge/Functions で用意し、そのHTMLの `<head>` にタイプ別の `og:*` を埋め込み、`og:image` に `/api/og?...` を指定してください。

---

### デプロイ（Vercel）

- `vercel.json`（ビルド: `npm run build`, 出力: `dist/`）
- API
  - `api/analyze.ts`: サーバレス関数（再試行・タイムアウト・簡易キャッシュ）
  - `api/og.tsx`: Edge Function（動的OG画像）
- Git連携
  - Production Branch に指定したブランチへ push で自動デプロイ
  - 環境変数は Vercel の Project Settings → Environment Variables で設定

---

### よくあるエラーと対処

- Vite の `/api/analyze` が `ECONNREFUSED`
  - `npm run api:dev` を別ターミナルで起動していません。起動してください。

- OG 画像が色指定で反映されない
  - `#` を `%23` にエンコードしてください（例: `#007AFF` → `%23007AFF`）。

- zsh でファイルパスが壊れる（スペースや括弧）
  - パスをクォート（`"/path/with (1).csv"`）するか、適切にエスケープしてください。

---

### ライセンス

内部利用前提の試作。外部配布時はコンテンツ（質問文・タイプ記述等）の権利表記に留意してください。