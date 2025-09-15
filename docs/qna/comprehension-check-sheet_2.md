# Q&A: HTTP Foundation

## Q11. Optional `?` の意味は？

### Model Answer 11

その引数やプロパティが任意であることです。未指定でもコンパイルエラーになりません。例：`init?: RequestInit`。

### Key Points 11

- 任意指定
- コンパイル時に必須ではない
- 呼び出しの柔軟性

### Follow-ups 11 (深掘り例)

- `exactOptionalPropertyTypes` が true の時、`{x?: number}` と `{x: number | undefined}` の違いは？
- 関数引数の `?` とオブジェクトプロパティの `?` の違いを具体例で説明して。
- Optional を増やしすぎたときに UI 側での分岐が複雑化する対策は？

## Q12. AbortController は何に使う？

### Model Answer 12

リクエストの中断/タイムアウトに使います。`controller.abort()` で`fetch`をキャンセルでき、ユーザーキャンセルや一定時間での切断に役立ちます（実装は将来対応）。

### Key Points 12

- 中断/タイムアウト
- ユーザーキャンセル反映
- 将来の拡張点

### Follow-ups 12 (深掘り例)

- `AbortController` を使った **タイムアウト実装**の擬似コードを書いて（GET/POST 共通化）。
- ユーザーの画面遷移（アンマウント）時に未完了の fetch を **一括中断**する設計は？
- abort と Network エラーが同時に起きたとき、UI にどう伝える？（優先度や文言）

## Q13. fast-forward only を使う理由は？

### Model Answer 13 (30–60s)

fast-forward only は、ローカルがリモートの祖先にある場合に履歴を直線で前進させ、意図しないマージコミットを防ぎます。分岐している場合は失敗するので、rebase か明示マージを自分で選べます。main を綺麗に保つための安全装置です。

### Key Points 13

- 履歴を直線に保つ
- 勝手なマージコミットを防止
- 分岐時は失敗→自分でrebase/merge選択

### Follow-ups 13 (深掘り例)

- `--ff-only` で止まったときの安全手順（`fetch` → `rebase` → 解決 → `push --force-with-lease`）を説明して。
- チームで「線形履歴」を崩さざるを得ない例と、その時のポリシー（例：マージコミット許可の条件）。
- public 履歴で **rebase を避けるべき状況**は？代わりに何を使う？

## Q14. GET と POST の違いは？

### Model Answer 14 (30–60s)

GET は取得（副作用なし・ボディなし・キャッシュ対象）、POST は作成/送信（副作用あり・JSONボディ・`Content-Type: application/json`）。HttpClient では method とヘッダ/ボディの扱いが異なります。

### Key Points 14

- GET: 取得・ボディなし
- POST: 送信・JSONボディ
- ヘッダ/ボディ取り扱いの差

### Follow-ups 14 (深掘り例)

- GET の **キャッシュ戦略**（ETag/If-None-Match）をどう設計する？
- **冪等性**が必要な操作は GET/POST/PUT/PATCH どれで設計する？
- クエリ vs ボディ：どちらに置くべきかの判断基準（サイズ・秘匿性・ブックマーク性）。

## Q15. 例外を Result に“畳む”利点は？

### Model Answer 15 (30–60s)

throw を UI まで流さず `{ ok:false, error }` に正規化すると、UIは `error.type`（Network/Http/Parse）で型安全に分岐できます。try/catch の散在を防ぎ、文言/導線の一貫性とテスト容易性が上がります。

### Key Points 15

- 例外→データ化（型分岐）
- try/catch散在を防ぐ
- 文言・導線の一貫性、テスト容易

### Follow-ups 15 (深掘り例)

- どんなエラーは `throw` してもよい？（例：**プログラマブルエラー**）それを Result と区別する基準は？
- `Result<T, E>` に拡張するときの E のバリアント設計（`HttpError` 以外が増えたら？）
- ログ基盤連携：Result でも **重要エラーはログ送出**したい。どの層で行う？

## Q16. なぜ 204 / Content-Length: 0 の時に JSON を読みにいかないのか？UI から見た成功/失敗の扱いと、Result の返し方を説明して。

### Model Answer 16

`204 No Content` と `Content-Length: 0` は「**本文が存在しないこと**」が仕様です。ここで `response.json()` を呼ぶと **パース例外**になる可能性があるので、最初から **読みに行かない**のが正解。  
UI 的には **成功**（ただしデータ無し）として扱います。Result は `ok: true` で `value` は `undefined`（または `void` とみなす）を返します。失敗ではないので `ok:false` にしません。

```ts
// 擬似コード
if (res.status === 204 || res.headers.get('content-length') === '0') {
  return { ok: true, value: undefined as T };
}
```

### Key Points 16

- 204/CL:0 = ボディ無し → json()しない
- UI は「成功（データ無し）」として表示
- Result は ok:true／value: undefined

### Follow-ups 16 (深掘り例)

- 202 Accepted は「非同期受理」。UI はどう表現する？ポーリング/プログレス表示はどの層？
- 204 でも ETag/Location 等の ヘッダ活用は？どの層で読む？
- void を返すユースケースの型設計（Result<void> or Result<undefined>）の流儀は？

## Q17. Network / Http / Parse の境界はどこ？具体的に「try/catch」「!response.ok」「json() 失敗」がどの分類に対応するか

### Model Answer 17 (30–60s)

- try/catch で fetch が throw → Network（オフライン・DNS 失敗・TLS 失敗・タイムアウトなど経路問題）。
- !response.ok（2xx 以外の HTTP ステータス）→ Http（401/403/404/409/5xx など）。
- json() 失敗（Content-Type: application/json を確認した上でのパース失敗・契約ズレ）→ Parse。

```ts
try {
  const res = await fetch(url, init);
  if (!res.ok) return { ok:false, error:{ type:'Http', status: res.status, message } };
  // Content-Type が JSON のときのみ:
  try { const data = await res.json(); return { ok:true, value: data as T }; }
  catch { return { ok:false, error:{ type:'Parse', message: 'Invalid JSON' } }; }
} catch (e) {
  return { ok:false, error:{ type:'Network', message: String(e) } };
}
```

### Key Points 17

- throw は Network／!ok は Http／json() 失敗は Parse
- JSON を読むのは Content-Type を確認してから
- CORS 失敗は実装的に Network 扱いになることが多い

### Follow-ups 17 (深掘り例)

- 429 Too Many Requests はどの分類？UI のクールダウン導線は？
- CORS エラー時に より良いユーザ文言を出すにはどの層で判定すべき？
- Parse とスキーマ検証エラー（Zod等）はどの層で分担する？

## Q18. init（RequestInit）で最低限どのプロパティを今回使っている？GET と POST での違いも添えて

### Model Answer 18 (30–60s)

- 共通：headers（Accept: application/json、呼び出し側の上書き可）、将来用に signal（中断/タイムアウト）。
- GET：method: 'GET'（省略でもOK）、body なし。
- POST：method: 'POST'、headers に Content-Type: application/json、body: JSON.stringify(...)。

```ts
// GET
fetch(url, { headers: { Accept: 'application/json', ...init?.headers }, ...init });

// POST
fetch(url, { method: 'POST',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
  body: JSON.stringify(payload),
  ...init
});
```

### Key Points 18

- GET は body なし／POST は JSON ボディ + Content-Type
- headers は 呼び出し側優先でマージ
- signal は将来の AbortController 導入余地

### Follow-ups 18 (深掘り例)

- credentials: 'include' を使うべき要件は？セッション系とトークン系の違いは？
- cache/keepalive を SPA で使うときの注意点は？
- Accept/Content-Type を固定しない柔軟な設計（XML/CSV 等対応）の型設計は？

## Q19. Fast-forward only のメリットは？

### Model Answer 19

fast-forward only は「自分のローカルがベースブランチの直系の祖先にある場合だけ」前に進めます。これにより余計なマージコミットが作られず、履歴が一直線に保たれます。もし分岐していたら pull が失敗するので、その時だけ自分で rebase か通常マージを選べます。結果として main の履歴が読みやすく、バグの追跡も簡単になります。
（※GitHubの PR マージ方式とは別軸。ここで言うのは「ローカルでの pull ポリシー」）

### Key Points 19

-余計なマージコミットを作らない
-直線（線形）な履歴＝ blame / bisect が楽
-分岐時は明示的に rebase/merge を選べる

### Follow-ups 19

- 「fast-forward できない」と出た時、安全に最新へ追随する手順は？
- --ff-only と --rebase を 同時に使う運用の是非は？
- チームで 線形履歴を守れないケース（長期ブランチなど）への対処は？

## Q20. 今回の RequestInit（init）で最小限使うキーは？

### Model Answer 20

- GET: headers（Accept を基本、呼び出し側の上書き可）、必要なら signal。
- POST: method: 'POST', headers（Accept, Content-Type: application/json）、body: JSON.stringify(...)、必要なら signal。
- credentials や cache は要件次第。まずは最小で始め、必要になったら広げます。

### Key Points 20

- GET は body なし／POST は JSON body + Content-Type
- headers は呼び出し側優先のマージ方針
- signal（将来のタイムアウト／キャンセル）を想定

### Follow-ups 20

- credentials: 'include' を使うべきケースは？
- SPA での cache/keepalive の使い所は？
- Accept を application/json に固定する利点と欠点は？