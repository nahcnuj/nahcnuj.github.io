---
description: "Google Drive コンテンツソースと GitHub リポジトリの同期メカニズム。MDX ファイル管理、編集ワークフロー、同期プロセス、およびコンテンツ構成方法。"
---

# Google Drive コンテンツソース管理

## 📍 ソースの場所

このプロジェクトのコンテンツは **2 つのソース** から管理されます：

### 1️⃣ **GitHub リポジトリ（コード）**
```
c:\Users\nahcnuj\ghq\github.com\nahcnuj\nahcnuj.github.io
```
- React コンポーネント
- ビルド・テスト・デプロイ設定
- VRT ベースラインスナップショット

### 2️⃣ **Google Drive（コンテンツ）** ⭐重要
```
Google Drive: "www.nahcnuj.work" フォルダ
```
- Markdown/MDX エッセイ
- ブログ記事
- 日記エントリ

## 🔄 同期メカニズム

### 一方向同期: Google Drive → GitHub

```
┌─────────────────────────┐
│   Google Drive          │
│  www.nahcnuj.work      │
├─────────────────────────┤
│  ├─ essays/            │
│  │   └─ math/          │
│  │       └─ *.md       │  ← ここで編集
│  ├─ diary/             │
│  └─ images/            │
└────────────┬────────────┘
             │ CI prepare job
             │ (rclone sync)
             ↓
┌─────────────────────────┐
│   GitHub repo           │
│  nahcnuj.github.io     │
├─────────────────────────┤
│  ├─ app/routes/        │
│  │   └─ *.mdx          │  ← ここで使用
│  ├─ public/images/     │
│  └─ tests/e2e/         │
└─────────────────────────┘
```

**重要なポイント**:
- ✅ Google Drive で編集 → PR でテスト → 自動同期
- ❌ GitHub リポジトリ内の MDX を直接編集しない（同期で上書きされる）
- ❌ Google Drive のファイルを削除しない（失ったファイルはリカバリ困難）

## 📁 Google Drive フォルダ構成

```
www.nahcnuj.work/
├── _config/
│   └── templates/           # ファイルテンプレート
│       ├── default.md
│       └── diary.md
├── _inbox/                  # 下書き・未公開
│   ├── 99_value-your-feelings.md
│   └── 無題のファイル.md
├── diary/                   # 日記（年月日別）
│   ├── 2024/
│   │   ├── 02/
│   │   │   ├── 24.md
│   │   │   ├── 26.md
│   │   │   └── ...
│   │   └── 10/
│   │       └── 16.md
│   └── 2026/
│       ├── 02/
│       │   ├── 2026-02-02.md
│       │   └── 2026-02-03.md
│       └── 03/
├── essays/                  # 技術記事・エッセイ
│   ├── edu/
│   │   └── arith_mul-comm.md
│   ├── feel/
│   │   ├── 2025/
│   │   └── revalue-myself/
│   │       ├── 00_intro.md
│   │       └── ...
│   ├── math/
│   │   ├── electronics/
│   │   │   ├── derive-fourier-transform-of-gaussian-filter.md  ← 本文で修正したファイル
│   │   │   └── ...
│   │   ├── curry--howard/
│   │   ├── is-sqrt-of-squared-x-pm-x.md  ← 本文で修正したファイル
│   │   └── ...
│   ├── programming/
│   │   └── functional/
│   │       └── ...
│   └── work/
│       ├── weekday-schedule.md
│       └── images/
├── works/                   # ポートフォリオ
│   ├── 2011/
│   │   ├── 01_funny-breakout.md
│   │   └── ...
│   ├── 2012/
│   │   └── ...
│   └── ...
└── images/                  # 共有画像（public/img に同期）
    └── ...
```

## ✏️ コンテンツ編集ワークフロー

### シナリオ 1: エッセイ修正（本文で行った作業）

**編集対象**: `essays/math/is-sqrt-of-squared-x-pm-x.md`

```
1. Google Drive で該当ファイルを開く
   Google Drive > www.nahcnuj.work > essays > math > is-sqrt-of-squared-x-pm-x.md

2. ブラウザで編集 or ローカルダウンロード＆編集
   修正例：
   - LaTeX コード差異の修正
   - 数式フォーマット調整
   - テキスト改善

3. Google Drive に変更を反映

4. PR 作成・コミット（ローカル git に反映）
   - GitHub リポジトリのブランチを作成
   - 修正内容をコミットメッセージで説明
   - PR 作成

5. CI が自動実行
   - prepare: Google Drive から MDX 同期
   - build: ビルド実行
   - test/e2e/vrt: テスト実行
   - ✅ すべてパス → マージ可能

6. PR マージ後、自動デプロイ
```

### シナリオ 2: 新しいエッセイ追加

```
1. Google Drive で新ファイル作成
   Google Drive > www.nahcnuj.work > essays > [category] > new-essay.md

2. Frontmatter を含めた内容を入力
   ---
   title: "記事タイトル"
   description: "説明"
   published: 2026-06-17
   usemath: true
   ---
   
   # 記事タイトル
   
   本文...

3. PR 作成・コミット

4. CI で自動テスト

5. マージ後、www.nahcnuj.work に公開
```

## 🔐 同期セットアップ

### 必要な認証情報

GitHub Actions の `prepare` ジョブが Google Drive と同期するために、以下が必要：

1. **`RCLONE_CONFIG_BASE64`** - Rclone 設定（base64 エンコード）
   ```
   [google_drive]
   type = drive
   client_id = YOUR_CLIENT_ID
   client_secret = YOUR_CLIENT_SECRET
   root_folder_id = www.nahcnuj.work_FOLDER_ID
   ```

2. **`SERVICE_ACCOUNT_KEY_JSON_BASE64`** - Google Service Account（base64 エンコード）
   ```json
   {
     "type": "service_account",
     "project_id": "...",
     "private_key_id": "...",
     ...
   }
   ```

### 同期スクリプト（`.github/actions/sync-mdx-from-gdrive`）

```yaml
# この GitHub Action が以下を実行：
1. Rclone を設定（RCLONE_CONFIG_BASE64 をデコード）
2. Google Drive から MDX ファイルをダウンロード
   rclone sync "google_drive:essays" "app/routes/essays" --filter-from .gitignore
   rclone sync "google_drive:diary" "app/routes/diary" --filter-from .gitignore
3. Public 画像もダウンロード
   rclone sync "google_drive:images" "public/img" --filter-from .gitignore
4. Artifacts に保存（次のジョブで使用）
```

## ⚠️ 重要な注意事項

### ✅ DO

- ✅ Google Drive で Markdown/MDX ファイルを編集
- ✅ ローカルで修正して Git 管理（コードのみ）
- ✅ 新しいエッセイを Google Drive フォルダに追加
- ✅ PR で CI を通してからマージ
- ✅ Google Drive のファイルをバックアップ（定期的に）

### ❌ DON'T

- ❌ GitHub リポジトリの `app/routes/**/*.mdx` を直接編集しない
  - CI の prepare ジョブで Google Drive から上書きされる
  - 編集が失われる可能性がある
- ❌ Google Drive のファイルを軽々しく削除しない
  - リカバリ手段が限定的
- ❌ GitHub と Google Drive で同じファイルを別々に編集
  - 同期競合が発生する
- ❌ 本番環境の HTML ファイル（dist/*.html）を直接修正
  - ビルドで上書きされる

## 📝 ファイル形式とメタデータ

### Frontmatter（必須）

各 Markdown ファイルの先頭に YAML メタデータを記入：

```markdown
---
title: "ページタイトル"
description: "簡潔な説明（OGP に使用）"
published: 2026-06-17              # 公開日
usemath: true                      # KaTeX 有効化（数式がある場合）
tags: []                           # オプション
aliases: []                        # オプション
---

# 記事タイトル

本文...
```

### LaTeX（数式）

KaTeX で処理されるため、LaTeX コードをそのまま記述：

```markdown
インライン数式: $x^2 + y^2 = z^2$

ディスプレイ数式:
$$\sqrt{x^2} = \left| x \right|$$

複数行環境:
$$\begin{align*}
a &= b \\
c &= d
\end{align*}$$
```

### 画像参照

```markdown
![alt text](../images/filename.png)
または
![alt text](/img/filename.png)
```

## 🔄 同期が失敗した場合

### トラブルシューティング

| 症状 | 原因 | 対応 |
|-----|-----|------|
| prepare ジョブが失敗 | 認証情報が古い | GitHub リポジトリ設定で `RCLONE_CONFIG_BASE64` を更新 |
| MDX ファイルが見つからない | Google Drive フォルダ構成が変更 | `.github/actions/sync-mdx-from-gdrive` の `rclone sync` コマンド確認 |
| ビルドが失敗（MDX パースエラー） | Frontmatter や LaTeX コード不正 | Google Drive のファイル内容を検証 |
| 画像が表示されない | images フォルダ同期に失敗 | `public/img` ディレクトリ構造を確認 |

### 手動同期方法（開発用）

```bash
# rclone インストール
brew install rclone  # macOS
# または scoop install rclone  # Windows

# 設定
rclone config

# 手動同期（ローカル開発用）
rclone sync "google_drive:essays" "app/routes/essays"
rclone sync "google_drive:diary" "app/routes/diary"
rclone sync "google_drive:images" "public/img"
```

## 📚 関連ドキュメント

- [project-architecture.instructions.md](./project-architecture.instructions.md) - 全体アーキテクチャ
- [ci-workflow.instructions.md](./ci-workflow.instructions.md) - CI/CD ワークフロー
- [vrt-baseline-management.instructions.md](./vrt-baseline-management.instructions.md) - VRT テスト管理
