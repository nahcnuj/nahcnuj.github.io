# Agent Guidelines

## 見た目の変更について / Visual Changes

見た目が変化する変更（CSS・レイアウト・コンポーネントなど）を加えたときは、様々な画面サイズにおけるスクリーンショットをPRに添付してください。

When making changes that affect the visual appearance (CSS, layout, components, etc.), attach screenshots at various screen sizes to the PR.

### スクリーンショット取得手順 / How to Take Screenshots

日本語テキストを正しくレンダリングするために、スクリーンショットを撮る前に日本語フォントのインストールが必要です。

Japanese fonts must be installed before taking screenshots to render Japanese text correctly.

```bash
sudo apt-get install -y fonts-noto-cjk
```

その後、プロジェクトをビルドしてからスクリーンショットを撮ってください。

Then build the project and take screenshots:

```bash
npm run build
```

### 確認すべき画面サイズ / Screen Sizes to Check

| サイズ / Size | 幅 / Width | 用途 / Use case |
|---|---|---|
| モバイル / Mobile | 375px | スマホ表示 |
| 中PC / Medium PC | 1280px | サイドバー1列 |
| 広PC / Wide PC | 1440px | サイドバー両側・コンテンツ中央 |
