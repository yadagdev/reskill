# reskill / HTTP 基盤ミニメモ

## 目的

- UIからのHTTP呼び出しを「型安全・一貫したエラー整形」で扱うための土台。

## ディレクトリ

- src/http: HttpClient, HttpError（通信の技術的関心）
- src/domain/common: Result`<T>`（成否の型）

## UIメッセージ方針（抜粋）

- Network: 再試行ボタン表示／オフライン案内／必要ならステータスページ誘導
- Http 401: 未認証→再ログイン導線/ログイン画面へ
- Http 403: 権限不足→案内表示（管理者連絡/申請）
- Http 5xx: サーバ障害→時間をおいて再試行
- Parse: 形式が不正→再読み込み or お問い合わせ（開発用messageはログへ）

## HttpClientの方針

- URL結合: baseUrl末尾の/削除 + url先頭に/付与 → `${baseUrl}${url}`
- 共通ヘッダ: Accept: application/json。POSTは Content-Type: application/json
- 認証: 呼び出し側が init.headers.Authorization を渡す（B案）
- エラー抽出: {message} or {error.message} → statusText → "Request failed"
- 空レス: 204/Content-Length:0 は JSON 不要。value は undefined 扱い
- タイムアウト: 未実装（将来 AbortController で対応）

## 層の責務表

- UI: 文言/表示・ユーザー操作
- Service: 最終バリデ/マッピング/ユースケース制御
- Http: 通信/共通ヘッダ/エラー正規化
