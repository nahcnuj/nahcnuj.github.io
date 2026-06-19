# usemath フロントマター自動更新ツール

## 概要

このツールは MDX ファイルの `usemath` フロントマターを自動で更新します：

- **`$ ... $` または `$$ ... $$`** を含むファイル → `usemath: true` に設定
- **数式を含まないファイル** → `usemath` フロントマターを削除

## 使用方法

```bash
npm run update:usemath
```

## 機能

- ✅ 数式の有無を自動検出
- ✅ YAML フロントマターの元のフォーマットを保持
- ✅ `app/fixtures/` ディレクトリをスキップ
- ✅ 変更したファイルのみを更新

## 例

### 数式あり（更新される）
```mdx
---
id: article-001
title: My Article
---

数式の例：

$$
\begin{align}
E = mc^2
\end{align}
$$
```
↓ 自動更新
```mdx
---
id: article-001
title: My Article
usemath: true
---
...
```

### 数式なし（usemath が削除される）
```mdx
---
id: article-002
title: No Math Article
usemath: true
---

ここに通常のテキストがあります。
```
↓ 自動更新
```mdx
---
id: article-002
title: No Math Article
---
...
```

## 対応する数式形式

- `$...$` - インライン数学
- `$$...$$` - ディスプレイ数学

## 備考

- スクリプトは `app/routes/**/*.mdx` ファイルをすべて処理します
- `app/fixtures/` 配下のテストファイルはスキップします
- 既に正しい `usemath` 設定がある場合は変更しません
