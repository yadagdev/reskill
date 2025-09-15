# Frontend HTTP Layer Policy

## Goals

- 型安全・一貫したエラー整形・UI分岐の単純化。

## Layering

- UI: 表示/文言/操作。`Result` の `ok` / `error.type` で分岐。
- Service: 最終バリデ、API呼び出し順序、**サーバJSON→UI Model** のマッピング。
- HttpClient: 低レベルHTTP（URL結合、ヘッダ、status/ok判定、Content-Type確認、JSONパース、例外→`Result`）。

## Error Model

- `HttpError = Network | Http(status:number) | Parse`
- UIは `error.type` で分岐。メッセージは i18n（開発用messageはログへ）。

## URL Join

- `baseUrl` 末尾の `/` を削る + `url` 先頭に `/` を付与 → 連結。

## Headers & Auth

- 既定: `Accept: application/json`
- POST: `Content-Type: application/json`
- Auth: 呼び出し側が `init.headers.Authorization` を渡す（B案）。書き忘れリスクと引き換えにシンプルさを優先。

## Response Handling

- 204 / `Content-Length: 0`: JSONを読まない。`value` は `undefined`。
- JSON判定: `content-type` に `application/json` を含む場合のみ `json()`。
- Parse: `json()` 失敗や契約ズレ（キー欠落/型不一致）は `Parse`。

## Error Message Extraction

1. `body.error.message` or `body.message`
2. `response.statusText`
3. `"Request failed"`

## Timeout (Future)

- `AbortController` で中断。将来の課題。

## Testing Pointers

- `joinUrl`: 末尾/先頭スラッシュの組み合わせ表でケース網羅。
- `extractErrorMessage`: 優先順位の表でケース網羅（message優先→statusText→固定文言）。
- `HttpClient`: 204/5xx/Network/Parse の分岐をモックして検証。
