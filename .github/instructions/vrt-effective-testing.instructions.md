---
description: VRT（Visual Regression Testing）が見た目の回帰を効果的に検出するためのテスト設計原則
applyTo: "**/*.vrt.test.ts,tests/e2e/**"
---

# VRT 効果的なビジュアル回帰テスト

VRT（Visual Regression Testing）は**ビジュアル回帰検出**のためのテストです。機能テストではなく、見た目の予期しない変化を検出することが目的です。

## 🎯 VRT の定義と境界

### ✅ VRT がテストするもの（VISUAL のみ）

- **レイアウト**: 要素の位置、サイズ、間隔、配置
- **スタイリング**: 色、フォント、境界線、背景、シャドウ、透明度
- **テキストレンダリング**: フォント変更、行高、テキスト配置
- **画像・コンテンツ**: 数式（KaTeX）、画像の表示、表示/非表示
- **レスポンシブ**: 各ブレークポイント（375px, 1280px, 1440px）での見た目

### ❌ VRT がテストしないもの（機能テストの領域）

- ❌ **リンクが動作するか**: 機能テスト
- ❌ **クリックで状態が変わるか**: 機能テスト  
- ❌ **フォーム送信が機能するか**: 機能テスト
- ❌ **API レスポンスが正しいか**: 機能テスト
- ❌ **JavaScript イベントが発火するか**: 機能テスト
- ❌ **アクセシビリティ属性が存在するか**: アクセシビリティテスト

**"VRT は見た目だけ。機能テストではない" を貫く**

## 🔍 効果的なテスト設計の原則

### 原則 1: 明確な初期状態を指定する

VRT テストは**固定状態の見た目**をテストします。アニメーションや変動する状態は避けます。

```typescript
// ✅ DO: 明確な初期状態
test('homepage renders with correct layout on mobile', async ({ page }) => {
  await page.goto('/') // 明確な URL
  await page.waitForLoadState('networkidle') // ネットワーク完了を待機
  await expect(page).toHaveScreenshot()
})

// ❌ DON'T: 変動する状態
test('homepage looks good', async ({ page }) => {
  await page.goto('/')
  // ← 不確定：ローディング中かもしれない、アニメーション途中かもしれない
  await expect(page).toHaveScreenshot()
})
```

### 原則 2: 各ブレークポイントで個別テストを作成する

1 つのテストで複数の画面サイズをテストしないこと。各サイズで**分離した**テストを書きます。

```typescript
// ✅ DO: ブレークポイント別に分離
test('essay renders correctly on mobile (375px)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  // ... test
})

test('essay renders correctly on medium PC (1280px)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1024 })
  // ... test
})

// ❌ DON'T: 1 つのテストで複数サイズ（スナップショット 1 つでは不十分）
test('essay renders at all sizes', async ({ page }) => {
  for (const size of [375, 1280, 1440]) {
    await page.setViewportSize({ width: size, height: 1024 })
    await expect(page).toHaveScreenshot()
  }
})
```

### 原則 3: maxDiffPixels は意図的に設定し、過度に大きくしない

`maxDiffPixels` は**許容できる差分ピクセル数**です。小さい値ほど厳密です。

```typescript
// ✅ DO: 意図的な値
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,  // フォント微調整レベル
    },
  },
})

// ❌ DON'T: 過度に大きい値（テストの意味がなくなる）
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 50000,  // 差分をほぼ無視 → VRT の効果がない
    },
  },
})
```

**ガイドライン:**
- `maxDiffPixels: 50-100` → 厳密（フォント・配置の微調整も検出）
- `maxDiffPixels: 100-300` → バランス型（明らかなレイアウト変化を検出）
- `maxDiffPixels: 300+` → 緩すぎる（大幅な変化を見逃す可能性）

### 原則 4: テスト名で何をテストしているか明確に

テスト名から**ページ、画面サイズ、ターゲット要素**が分かるようにします。

```typescript
// ✅ DO: 明確
test('math page renders correctly on mobile (375px)', async ({ page }) => { })
test('homepage header layout on wide PC (1440px)', async ({ page }) => { })
test('diary list card styling on medium PC (1280px)', async ({ page }) => { })

// ❌ DON'T: 曖昧
test('rendering works', async ({ page }) => { })
test('layout test', async ({ page }) => { })
test('screenshot', async ({ page }) => { })
```

### 原則 5: テスト対象を段階的に拡大する

新しい VRT テストは段階的に追加します。不要なテストで CI 負荷を増やさない。

```typescript
// ✅ DO: 段階的追加
// Phase 1: 重要なページのみ（homepage, main essays）
test('homepage on mobile', ...)
test('essay on desktop', ...)

// Phase 2: 複雑なコンポーネント (math rendering)
test('math display on multiple sizes', ...)

// Phase 3: 必要に応じて詳細テスト

// ❌ DON'T: 片っ端からテスト追加
test('sidebar on mobile', ...)
test('footer on mobile', ...)
test('button on mobile', ...)
// → 結果として変更検出が難しくなる
```

## ⚠️ テスト失敗時の対処

### 1. 差分をちゃんと確認する

```bash
npm run test:vrt
# → 失敗時は Playwright Reporter で**必ず視覚的に確認**
npx playwright show-report
```

**重要**: テキスト出力だけで判断しない。Playwright Reporter で実際の差分画像を見ます。

### 2. 意図した変更か、バグか判定する

| パターン | 対応 |
|---------|-----|
| **意図した UI 変更** | ベースライン更新 (`--update-snapshots`) してコミット |
| **予期しない差分**（バグ） | コードを修正して再テスト |
| **プラットフォーム固有の差分** | プラットフォーム別ベースライン確認 |
| **フォント微調整による差分**（許容範囲） | ケース判定（通常は更新） |

### 3. 過度な maxDiffPixels 調整を避ける

差分が出たからといって `maxDiffPixels` を大きくしてはいけません。

```typescript
// ❌ DON'T: 差分回避で threshold を上げる
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 50000,  // 「テストをパスさせるため」に上げた
    },
  },
})

// ✅ DO: 差分の原因を確認してから判断
// 1. Playwright Reporter で差分を確認
// 2. 意図した変更なら update-snapshots
// 3. バグなら修正
// 4. threshold は変更しない
```

## 📝 VRT テスト追加チェックリスト

新しい VRT テストを追加する際のチェックリスト：

- [ ] テスト名は「ページ/コンポーネント + 画面サイズ」を含む？
- [ ] テスト対象は**ビジュアル**のみか？（機能テストになっていないか？）
- [ ] `waitForLoadState('networkidle')` で確定状態を待つ？
- [ ] 各ブレークポイント（375px, 1280px, 1440px）で分離テストがあるか？
- [ ] `maxDiffPixels` は意図的に設定されているか（過度に大きくないか？）
- [ ] ベースラインスナップショットは Playwright Reporter で確認済みか？
- [ ] コミットメッセージで変更理由を説明しているか？

## 🔗 関連ファイル

- [vrt-baseline-management.instructions.md](./vrt-baseline-management.instructions.md) - スナップショット管理ワークフロー
- [tests/e2e/math-rendering.vrt.test.ts](../../../tests/e2e/math-rendering.vrt.test.ts) - VRT テスト実装例
- [playwright.config.ts](../../../playwright.config.ts) - Playwright 設定
- [AGENTS.md](../../../AGENTS.md) - 推奨スクリーンサイズ
