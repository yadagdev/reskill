# Git Cheatsheet (This Project)

## 基本フロー

```bash
# 1) 最新取得（ローカル枝の掃除込み）
git fetch --all --prune

# 2) 作業ブランチ作成
git switch -c feature/http-client-min

# 3) 変更 → ステージング → コミット
git add -A
git commit -m "feat(http): scaffold get/post flow with comments"

# 4) 初回 push（上流設定）
git push -u origin feature/http-client-min

# 5) PR 作成（GitHub CLI）
gh pr create --base main --head <branch> --fill

# 6) レビュー後 Squash merge & ブランチ削除
gh pr merge --squash --delete-branch

# 7) mainブランチに変更内容を反映させる
git fetch origin
git pull        # fast-forward できるときだけ進める
# もし「fast-forward不可」になったら、mainにローカルコミットがあるので↓で揃える
git reset --hard origin/main   # main を完全にリモートと一致させる（※ローカルmainの差分は消えます）
```

## よく使うオプション

```bash
git pull --ff-only
# fast-forward の場合のみマージ（線形履歴を壊さない）

git fetch -p
# --prune リモートで消えた枝をローカルの「リモート追跡ブランチ」からも削除

git add -A
# 変更/新規/削除を一括ステージング
```

## upstream 設定エラー対処

```bash
# "There is no tracking information ..." と言われたら
git branch --set-upstream-to=origin/<branch> <local-branch>
# 例
git branch --set-upstream-to=origin/feature/http-client-min feature/http-client-min
```

## Policy

- 1PRは1トピック
- 小さく出して早めにレビュー
- Rebaseは必要最小限（Conflicts回避のため）
