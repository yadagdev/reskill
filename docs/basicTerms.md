# 開発する上での基本的な用語

- 低レベルHTTP(Low-level HTTP)
  - URL組み立て、メソッド/ヘッダ設定、status判定、Content-Type確認、JSONパース、例外→型正規化など通信の下回り。

- オーケストレーション(Orchestration)
  - 目的達成のための手順を正しい順序で“指揮”すること。Kubernetesでも同義の比喩。
- オーケストラの指揮
  - 複数の手順や呼び出しを正しい順序で動かし、全体として1つの目的（ユースケース）を達成すること
  - フロントエンドではサービス層が担当

- ユースケース（Use Case）
  - ユーザーの目的単位の処理（例: ユーザー登録、ユーザー詳細取得）。

- DTO (Data Transfer Object)
  - 境界越えのデータ定義。Request/Responseで責務を分ける。

- UI Model
  - 画面表示に都合のよい型（例: `User`）。サーバJSONからマッピングする。

- マッピング(Mapping)
  - サーバの生JSON → UI Model への変換（snake_case → camelCase など）。

- サービス層(Service Layer (Front))
  - ユースケースの指揮。最終バリデ、API呼び出し順序、マッピングを担当。

- HttpClient
  - 低レベルHTTPを集約する層。ヘッダ付与、例外→`Result`正規化、204/Parseの扱いなど。

- Result`<T>`
  - 成功/失敗を型で表すユニオン。`{ ok:true, value:T } | { ok:false, error:HttpError }`

- HttpError
  - `Network | Http(status) | Parse` の三分類。UIは `type` で分岐。

- 204 No Content
  - 本文なしの成功。JSONを読まない。UIは「成功だがデータなし」扱い。

- AbortController
  - HTTPリクエストを中断する仕組み。将来のタイムアウト実装に利用予定。

- Optional `?`
  - 引数やプロパティが任意であること（未指定でも良い）。

- Generics `<T>`
  - 型パラメータで汎用化。`get<T>()` など。

- Union `|`
  - いずれかの型、という選択肢の表現。`Network | Http | Parse`。

- RequestInit
  - `fetch` のオプション（method、headers、signal など）。

- 409 Conflict
  - 競合（例: メール重複）。UIはフィールドエラーで案内。

- 5xx
  - サーバ障害。UIは時間を置いて再試行/ステータスページ案内。

- Network
  - 通信路の失敗（DNS/オフライン/タイムアウト等）。UIは接続確認/再試行。

- ユーザー登録
  - 入力最終バリデーション -> DTO整形 -> API POST -> サーバーJSON -> UIモデルへマッピング -> Resultで返却 -> UIが結果で分岐

- ユーザー詳細取得
  - IDチェック -> API GET -> マッピング -> Resultで返却
  - 単なる「リクエストを出してレスポンスを受け取る」ではなく、**目的を達成するための一連の段取り**がユースケース

## Narrowing（ナローイング）

条件分岐などで変数の型をより狭い型に確定させること。
例: `if (typeof x === 'object' && x !== null) { /* ここで x は object */ }`

## Parse / Parsing（パース）

文字列やバイト列を構造化データに解釈すること。
例: `await response.json()` は JSON 文字列 → JS オブジェクトへのパース。

## Mapping（マッピング）

取得したデータを UI で使いやすい形に組み替えること。
例: `created_at` → `createdAt`（snake_case → camelCase 変換）。

## Optional Chaining（オプショナルチェイニング）

`a?.b?.c` のように、途中が `null/undefined` でも例外を出さず安全に辿る構文。

## Nullish Coalescing（null 合体演算子）

`x ?? y` は x が `null/undefined` のときだけ y を使う。

## unknown

"安全な any"。使う前に型チェックが必須になる特殊なトップ型。

## HttpClient / Service / UI の責務

- HttpClient: 低レベルHTTPの共通入口（URL結合、共通ヘッダ、Network/Http/Parse 正規化）
- Service: ユースケースの手順（最終バリデ→API呼び出し→マッピング→Result返却）
- UI: 表示・文言・分岐（Result を受けて導線を決める）

## Fallback（フォールバック）

第一候補が使えない時に、次の安全策へ切り替えること。
例: `error.message` が無ければ `statusText`、それも無ければ固定文言。

## Result 型（成功/失敗の包み）

- 成功: `{ ok: true, value: T }`
- 失敗: `{ ok: false, error: { type: 'Network' | 'Http' | 'Parse', ... } }`
UI は `error.type` で分岐できる。
