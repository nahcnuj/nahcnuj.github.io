---
description: "nahcnuj.github.io プロジェクトアーキテクチャと設計方針。コンテンツソース、ビルドプロセス、テスト戦略、CI/CD ワークフロー、およびデータフローの完全なガイド。"
---

# nahcnuj.github.io プロジェクトアーキテクチャ

## 📐 プロジェクト概要

**www.nahcnuj.work** は以下の技術で構成された静的サイトジェネレータです：

| 項目 | 技術/ツール |
|-----|---------|
| **フレームワーク** | Hono + Honox（SSG） |
| **ビルドツール** | Vite |
| **コンテンツ形式** | MDX（Markdown + JSX） |
| **コンテンツソース** | Google Drive（www.nahcnuj.work フォルダ） |
| **数式レンダリング** | KaTeX（TeX → HTML） |
| **スタイリング** | Inline CSS in Hono components |
| **ホスティング** | GitHub Pages （source ブランチ） |
| **Node.js** | 24.x |

## 🔄 データフロー

```
Google Drive (www.nahcnuj.work)
    ↓
prepare ジョブ: rclone で MDX 同期
    ↓
    **/*.mdx ファイル + public/**images/**
    ↓
build ジョブ: Vite でビルド
    ├─ MDX → HTML に変換（@mdx-js/rollup）
    ├─ KaTeX で数式をレンダリング（remark-math, rehype-katex）
    ├─ Frontmatter メタデータ抽出
    └─ 静的 HTML ファイル生成
    ↓
dist/ フォルダ に HTML 出力
    ↓
test ジョブ: vitest（単体テスト）
e2e ジョブ: Playwright（機能テスト）
vrt ジョブ: Playwright（ビジュアル回帰テスト）
    ↓
全テスト合格
    ↓
GitHub Pages へ デプロイ（別ワークフロー）
```

## 📁 プロジェクト構成

### ディレクトリ構成

```
.
├── .github/
│   ├── actions/                    # Custom GitHub Actions
│   │   └── sync-mdx-from-gdrive    # Google Drive 同期アクション
│   ├── instructions/               # このファイル群
│   ├── workflows/
│   │   ├── ci.yml                  # メイン CI ワークフロー
│   │   ├── prepare.yml             # Google Drive 同期専用
│   │   └── update.yml              # デプロイ更新
│   └── skills/
│       └── capture-command-output/ # スキル定義
│
├── app/
│   ├── client.ts                   # Vite client entry
│   ├── server.ts                   # Hono/Honox server
│   ├── types.ts                    # 型定義
│   ├── components/                 # React コンポーネント
│   ├── routes/                     # ページルート（MDX ファイル）
│   ├── lib/                        # ユーティリティ
│   ├── islands/                    # インタラクティブコンポーネント
│   └── fixtures/                   # テストデータ
│
├── public/
│   ├── img/                        # 静的画像
│   └── nuxt-multibyte-url-demo/   # ケーススタディ
│
├── tests/
│   ├── ogp.integration.test.ts    # OGP タグ検証
│   ├── RelatedArticles.test.ts    # コンポーネント単体テスト
│   └── e2e/
│       └── math-rendering.vrt.test.ts  # VRT テスト
│
├── renderers/                      # MDX カスタムレンダラー
├── bin/                            # CLI スクリプト
├── docs/                           # ドキュメント
│
├── playwright.config.ts            # VRT/E2E テスト設定
├── vitest.config.e2e.ts            # E2E テスト設定
├── vite.config.ts                  # Vite 設定（ビルド）
├── tsconfig.json                   # TypeScript 設定
├── package.json                    # 依存関係・スクリプト
└── biome.json                      # Biome 開発環境設定
```

### Google Drive コンテンツソース

```
Google Drive (www.nahcnuj.work)
├── _config/                        # サイト設定
├── _inbox/                         # 未公開ドラフト
├── diary/                          # 日記エントリ
│   └── 2024/02/24.md             → essays/diary/...
├── essays/                         # エッセイ/技術記事
│   ├── math/
│   │   └── is-sqrt-of-squared-x-pm-x.md
│   ├── programming/
│   └── feel/
├── works/                          # ポートフォリオ
└── images/                         # 画像（public/img に同期）
```

**注**: Google Drive 上の `.md` ファイルは **CI prepare ジョブで `.mdx` に変換** されて GitHub リポジトリと同期されます。

## 🔨 ビルドパイプライン

### 1. Prepare Job（準備）
- **トリガー**: PR 時
- **環境**: Ubuntu
- **処理**:
  - rclone で Google Drive から MDX ファイルをダウンロード
  - `public/**/images/**` を同期
  - Artifacts に保存

### 2. Build Job（ビルド）
- **トリガー**: Prepare 完了後
- **環境**: Ubuntu
- **処理**:
  1. `npm run build --mode client`: Client-side assets 生成
  2. `npm run build`: SSG で静的 HTML 生成
     - MDX パース → `@mdx-js/rollup`
     - 数式レンダリング → `remark-math` + `rehype-katex`
     - Frontmatter 抽出 → メタデータ生成
     - 静的ファイルとして出力 → `dist/`
- **出力**: `dist/` → Artifacts に保存

### 3. Test Jobs（テスト）
平行実行される複数のテストジョブ：

| ジョブ | 環境 | テスト対象 |
|------|------|---------|
| **test** | Ubuntu | 単体テスト (vitest) |
| **e2e** | Ubuntu | E2E テスト (Playwright) |
| **vrt** | Windows | Visual Regression (Playwright) |
| **lint** | Ubuntu | Biome linter |

### 4. VRT（Visual Regression Testing）の詳細

```typescript
// playwright.config.ts の構成
snapshotPathTemplate: '{snapshotDir}/{snapshotName}-{platform}{ext}'

// 例: math-rendering.vrt.test.ts の場合
tests/e2e/math-rendering.vrt.test.ts-snapshots/
├── math-rendering.vrt-math-page-renders-correctly-on-mobile-375px-win32.png
├── math-rendering.vrt-math-page-renders-correctly-on-medium-pc-1280px-win32.png
├── math-rendering.vrt-math-page-renders-correctly-on-wide-pc-1440px-win32.png
└── ...
```

**VRT テスト戦略**:
- **プラットフォーム**: Windows（日本語フォント差異を最小化）
- **ブレークポイント**: 375px（モバイル）, 1280px（タブレット/小 PC）, 1440px（デスクトップ）
- **テスト対象**: KaTeX 数式レンダリング + レイアウト整合性
- **Threshold**: `maxDiffPixels: 100`（フォント微調整レベルの差異を検出）

## 📦 重要な依存関係

### コンテンツ処理
- `@mdx-js/rollup` - MDX パーサー
- `remark-math` - LaTeX 数式構文解析
- `rehype-katex` - KaTeX レンダリング
- `remark-frontmatter` - Frontmatter メタデータ
- `katex` - 数式 HTML 生成

### スタイリング・レンダリング
- `rehype-slug` - ヘッダー ID 生成
- `rehype-external-links` - 外部リンク処理
- `@resvg/resvg-js` - SVG レンダリング

### テスト
- `@playwright/test` - VRT/E2E フレームワーク
- `vitest` - 単体テストフレームワーク

### 開発ツール
- `biome` - Linter + Formatter（Rust ベース）

## ⚙️ npm スクリプト

```json
{
  "dev": "vite",                                    # 開発サーバー起動
  "dev:expose": "vite --host",                     # ネットワーク外部公開
  "build": "vite build --mode client && vite build", # SSG ビルド
  "lint": "biome lint .",                          # Linting
  "lint:fix": "npm run lint:biome:fix",
  "test": "vitest run",                            # 単体テスト
  "test:e2e": "vitest run --config vitest.config.e2e.ts",
  "test:vrt": "playwright test --config playwright.config.ts"  # VRT テスト
}
```

## 🔐 CI/CD シークレット要件

`.github/workflows/` が参照する必須シークレット（リポジトリ設定で定義）：

| シークレット | 用途 | 形式 |
|-----------|------|------|
| `RCLONE_CONFIG_BASE64` | Google Drive rclone 設定 | base64 エンコード |
| `SERVICE_ACCOUNT_KEY_JSON_BASE64` | Google Service Account | base64 エンコード |
| `SLACK_WEBHOOK_URL` | CI 失敗通知先 | Slack webhook URL |

## 🚀 ワークフロー実行フロー

### PR 作成時の自動実行

```
PR created/updated on source branch
  ↓
GitHub Actions: ci.yml triggered
  ├─ prepare job (重要: Google Drive 同期)
  │   ├─ Checkout
  │   ├─ rclone で MDX 同期
  │   └─ Artifacts に保存
  │
  ├─ build job (needs: prepare)
  │   ├─ Artifacts ダウンロード
  │   ├─ npm run build
  │   └─ dist/ を Artifacts に保存
  │
  ├─ test job (needs: prepare)
  │   ├─ vitest 実行
  │   └─ 単体テスト検証
  │
  ├─ e2e job (needs: build)
  │   ├─ dist/ ダウンロード
  │   ├─ npm run test:e2e
  │   └─ 機能テスト検証
  │
  ├─ vrt job (needs: build) ★重要
  │   ├─ dist/ ダウンロード
  │   ├─ npm run test:vrt (Windows)
  │   └─ スナップショット比較
  │
  ├─ lint job (needs: prepare)
  │   └─ Biome linting
```

**重要**: VRT テストは **Windows 環境で実行** され、スナップショット比較に失敗すると CI は失敗します。

## 🔍 問題解決ガイド

### VRT テスト失敗時
1. **ローカルで確認**: Windows で `npm run test:vrt` 実行
2. **差分を視覚化**: `npx playwright show-report` で詳細確認
3. **原因判定**:
   - 🎨 意図した UI 変更？ → ベースライン更新
   - 🐛 予期しない差分？ → コード修正
   - 🖥️ プラットフォーム差異？ → `-win32.png` 確認

### Build 失敗時
1. ローカルで `npm run build` 実行
2. TypeScript エラーまたは MDX パースエラーを確認
3. `app/routes/` 配下の `.mdx` ファイル構造を検証

### Google Drive 同期失敗時
1. `.github/actions/sync-mdx-from-gdrive` の実装確認
2. `RCLONE_CONFIG_BASE64` と `SERVICE_ACCOUNT_KEY_JSON_BASE64` が正しく設定されているか確認
3. Google Drive フォルダアクセス権限を確認

## 📚 関連指示ファイル

- [ci-workflow.instructions.md](./ci-workflow.instructions.md) - CI ワークフロー実行手順
- [vrt-baseline-management.instructions.md](./vrt-baseline-management.instructions.md) - VRT ベースライン管理
- [vrt-effective-testing.instructions.md](./vrt-effective-testing.instructions.md) - VRT テスト設計原則
- [AGENTS.md](../../../AGENTS.md) - スクリーンショット取得ガイド

## 🎯 開発ワークフロー（一般的な流れ）

1. **ローカル開発**
   ```bash
   npm run dev              # 開発サーバー起動
   # 修正・追加作業
   npm run build           # ビルド確認
   npm test                # テスト実行
   npm run test:vrt        # VRT テスト（Windows）
   ```

2. **コミット・プッシュ**
   ```bash
   git add .
   git commit -m "feat: Add new essay"
   git push origin feat/new-essay
   ```

3. **PR 作成**
   - GitHub で PR を作成
   - CI が自動実行を開始
   - すべてのチェックが ✅ になるまで待機

4. **CI 失敗時**
   - ログを確認
   - ローカルで修正・テスト
   - 再プッシュ（自動で CI 再実行）

5. **マージ・デプロイ**
   - すべてのチェック合格後、PR マージ
   - 別ワークフロー（update.yml）が実行
   - GitHub Pages へデプロイ
