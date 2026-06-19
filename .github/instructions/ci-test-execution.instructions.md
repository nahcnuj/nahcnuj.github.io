---
description: "CI workflow に於いて、テストをスキップする設定（if: false など）を禁止。常に CI で全テストを実行すること。"
applyTo: ".github/workflows/**/*.yml,.github/workflows/**/*.yaml"
---

# CI テスト実行ルール

## 📋 原則

**CI 環境ではすべてのテストを必ず実行する。テストをスキップする設定を追加してはいけません。**

- ✅ **DO**: CI で全テストを実行する設定にする
- ✅ **DO**: 必要に応じて条件を整理して正しい状態で実行する
- ❌ **DON'T**: `if: false` でテストをスキップする
- ❌ **DON'T**: `if: never` でテストを無視する
- ❌ **DON'T**: 条件付きテスト実行を部分的に無効にする

## ❓ なぜ重要か

- **品質保証**: すべてのテストが毎回実行されることで、予期しない回帰を防ぐ
- **信頼性**: CI の結果が信頼できなくなり、バグを見落とすリスクが高まる
- **デバッグの困難化**: スキップされたテストによる問題が後で発覚すると対応が難しい
- **メンテナンス性**: スキップ条件が増えると、ワークフロー管理が複雑になる

## ❌ 避けるべきパターン

```yaml
# ❌ これはダメ：テストが実行されない
- name: Run tests
  if: false
  run: npm run test

# ❌ これもダメ：条件を満たさないと実行されない
- name: Run tests
  if: never
  run: npm run test

# ❌ 開発中の一時的なスキップもダメ
- name: Run tests
  if: ${{ false }}  # 後で有効化忘れの原因に
  run: npm run test
```

## ✅ 正しいパターン

```yaml
# ✅ 無条件にテストを実行
- name: Run tests
  run: npm run test

# ✅ 必要に応じて事前チェックはできるが、テスト実行は保証
- name: Prepare environment
  if: steps.something.outputs.needed == 'true'
  run: npm run setup

- name: Run tests
  run: npm run test  # 常に実行

# ✅ キャッシュヒット時は処理をスキップしても、テストは別に実行
- name: Build
  if: steps.cache.outputs.cache-hit != 'true'
  run: npm run build

- name: Run tests
  run: npm run test  # Build の結果に関わらず実行
```

## 🔍 CI でテストをスキップしたい場合

テストを実行すべきでない正当な理由がある場合は、以下を検討してください：

1. **そもそもテストが必要か？** → テストが不要なら削除する
2. **条件が本来あるべきか？** → ワークフロー自体を分割する
3. **デバッグ用の一時的なものか？** → ローカルでのみ実行、CI には入れない

## 🎯 チェックリスト

ワークフローファイルを修正するときは：

- [ ] テスト実行ステップに `if: false` などのスキップ条件がないか確認
- [ ] `if: never` が使われていないか確認
- [ ] 条件付き実行は、テスト自体ではなく「準備」「事前チェック」に限定
- [ ] CI での全テスト実行が保証されている
