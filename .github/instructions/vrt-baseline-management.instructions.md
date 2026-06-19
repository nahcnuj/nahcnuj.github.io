---
description: VRT（Visual Regression Testing）のベースラインスナップショット管理ワークフロー
applyTo: "**/*.vrt.test.ts,playwright.config.ts,tests/e2e/"
---

# VRT ベースラインスナップショット管理

VRT（Visual Regression Testing）の期待値（ベースラインスナップショット）を安全に管理するための指針。

## 📋 原則

**VRT スナップショットは手動レビューを経てからコミットする**

- ✅ **DO**: ローカルで `npm run test:vrt -- --update-snapshots` を実行して変更を確認
- ✅ **DO**: スナップショット差分を視覚的に検証してからステージング
- ✅ **DO**: コミットメッセージで変更理由を説明
- ❌ **DON'T**: CI 環境で自動的にスナップショットをコミット
- ❌ **DON'T**: 確認なしに `tests/e2e/**/*.png` をコミット
- ❌ **DON'T**: プラットフォーム固有ベースラインを勝手に統合

## 🔄 ワークフロー

### 1. ローカル開発時（UI 変更検出）

```bash
# 変更を実装した後、ローカルで VRT 実行
npm run test:vrt

# テスト失敗時：差分を確認してから期待値を更新
npm run test:vrt -- --update-snapshots

# 更新結果を視覚的に確認
npx playwright show-report
```

**重要**: 
- Playwright HTML レポートで差分を必ず確認
- 期待外の変更がないか確認

### 2. ステージング前チェック

```bash
# 差分確認（git diff）
git diff tests/e2e/**/*.png

# または Playwright Reporter で確認
npx playwright show-report
```

意図しない変更がある場合：
1. 変更をリセット: `git checkout tests/e2e/**/*.png`
2. 原因を調査・修正
3. ステップ 1 から再実行

### 3. コミット時

ベースラインスナップショット更新は明示的に:

```bash
git add tests/e2e/**/*.png
git commit -m "test(vrt): update snapshots for [reason]

- [具体的な変更内容]
- Platform: [win32/linux/darwin]
- Visual changes verified in Playwright Reporter"
```

### 4. プルリクエスト時

PR 説明に VRT 変更を明記:

```markdown
### VRT Changes
- Updated baselines for [screen size]
- Reason: [layout change/font update/etc]
- Verified: [yes/reference to report]
- Platforms affected: [win32/linux/darwin]
```

## 🛑 CI での実行方針

`.github/workflows/ci.yml` の `e2e` ジョブについて：

- ✅ **VRT テストは CI でも必ず実行**（スキップしない）
- ✅ **Windows 環境での実行を検討**（プラットフォーム固有差異を最小化）
- ❌ VRT 失敗時に自動的にベースラインをコミット
- ❌ スナップショット差分を確認せずにプッシュ
- ❌ プラットフォーム固有スナップショットの無条件マージ

**CI テスト失敗時の手順**:
1. CI artifacts （`vrt-test-results-*`、`vrt-baselines-*`）をダウンロード
2. Playwright Reporter で差分を検証
3. 差分が意図的な場合のみスナップショット更新
4. 手動で `git add` → `git commit` → `git push`

## 🔍 プラットフォーム固有スナップショット

VRT では `snapshotPathTemplate: '{testFileName}-{platform}{ext}'` で プラットフォーム固有ベースラインをサポート:

```
tests/e2e/math-rendering.vrt.test.ts-snapshots/
├── math-page-mobile-375-win32.png      # Windows
├── math-page-mobile-375-linux.png      # Linux  
├── math-page-mobile-375-darwin.png     # macOS
└── ...
```

**管理方針**:
- 開発環境のプラットフォーム（Windows）で更新したら `-win32.png` のみコミット
- Linux ベースライン（CI 環境）は CI 実行結果を検証してから手動追加
- 複数プラットフォーム対応時は、それぞれのプラットフォームで更新・検証

## ⚠️ 注意事項

### プラットフォーム環境

VRT はプラットフォーム固有フォント差異の影響を受けます：

**Windows 開発環境（推奨）**:
- 主要開発環境として位置付け
- `-win32.png` スナップショットを基準に
- ローカル検証・更新の中心

**Linux CI 環境**:
- CI で VRT を実行する場合、同じ `-linux.png` ベースラインを管理
- Windows と異なる フォント差異が発生する可能性
- 差分が大きい場合は、CI を **Windows 環境で実行**することも検討

### 大幅な UI 変更時

複数の VRT テストスナップショットが変わる場合：

1. **変更内容を文書化**: コミットメッセージに詳細を記述
2. **影響範囲を明確化**: どの画面サイズ/コンポーネントが変わったか
3. **レビュー担当者に通知**: PR で詳しく説明
4. **段階的にコミット**: 関連する複数の変更を 1 コミットで（ただしコメント付き）

## 📚 関連ファイル

- [playwright.config.ts](../../../playwright.config.ts) - VRT 設定
- [ci-workflow.instructions.md](./ci-workflow.instructions.md) - CI/CD ワークフロー
- [tests/e2e/math-rendering.vrt.test.ts](../../../tests/e2e/math-rendering.vrt.test.ts) - VRT テスト定義
