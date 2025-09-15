# Project Rules (Frontend HTTP Layer)

## Branch naming (prefix)

- `feature/<topic>`: 新機能・大きめ追加（例: `feature/http-client-min`）
- `fix/<topic>`: バグ修正
- `docs/<topic>`: ドキュメントのみの変更
- `chore/<topic>`: ツール設定や微調整（非機能）
- `refactor/<topic>`: 振る舞いを変えない整理
- `test/<topic>`: テスト追加・修正
- `ci/<topic>` / `build/<topic>` / `perf/<topic>`: 必要に応じて

## Trunk-based Development

- `main` を唯一の“正”。短命ブランチ→PR→**Squash merge**で `main` に取り込む
- `develop` ブランチは作らない（必要になったら検討）

## Commit message (Conventional Commits)

- `feat: ...` / `fix: ...` / `docs: ...` / `chore: ...` / `refactor: ...` / `test: ...` / `ci: ...` / `build: ...` / `perf: ...`
- 例: `fix(http): unify error label to 'Http'`

## Pull Request

- 小さく速く：1 PR ≒ 1 目的
- タイトルは動詞で（例）`feat(http): scaffold get/post`
- 説明には Done 条件 ／ 影響範囲 ／ テスト観点を簡潔に

## PR / Merge policy

- 原則 **Squash merge**（履歴を1コミットに圧縮）
- `main` は保護。`feature/*` から PR → レビュー → Squash
- **Fast-forward only** を推奨（線形履歴を維持）
- 小さく出して小さくマージ（レビュー容易性重視）
- Squash merge時にリモートブランチは削除(gh pr merge --squash --delete-branch)
- Revert 方針：問題があれば **Squash された1コミット**を revert する
