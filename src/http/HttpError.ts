export type HttpError = {
    // TODO: 具体的なエラー
    // DNS失敗 / オフライン / TCPタイムアウト / TLS失敗
    // UIアクション -> 再試行ボタン表示 / オフライン検出時は案内 / リトライ回数の上限をUIで管理 / ステータスページへのリンク表示
    type: 'Network';
    message: string;
} | {
    // TODO: 具体的なエラー（UI表示）
    // 400系（入力不正など）は Http の status 400 として扱い、Parse ではない
    // 401 Unauthorized(未ログイン) ログインしていない旨を表示しログイン画面にリダイレクト
    // 403 Forbidden(閲覧許可がないURL) 閲覧権限がない旨を表示
    // 404 Not Found(存在しないページ) ページが存在しない旨を表示,トップ画面に戻る or 戻るボタンを表示
    // 429 Too Many Requests（レート制限）も Http として扱い、UIは待機/再試行案内
    // 500 Internal Server Error(サーバー側で処理ができない、サーバーが落ちている時) アクセスできない旨を表示
    // 502 Bad Gateway(無効なレスポンス) 上流サーバの応答不正である旨を表示
    // 503 Service Unavailable メンテナンス中かサーバーに負荷がかかりすぎている,時間をおいてから再度読み込んでくださいのメッセージ表示
    // 504 Gateway Timeout サーバーとの通信がタイムアウト,再読み込みボタンを表示するかトップページにリダイレクト
    type: 'Http';
    status: number;
    message: string;
} | {
    // TODO: JSONの値が不適切な時
    // UIアクション -> 「形式が不正です」＋再読み込み/お問い合わせ導線（開発用messageはログに送る）
    //                  JSONのメッセージが取得できればJSONのメッセージを使用。なければstatusTextのHTTPステータスを参照。なければ固定のメッセージを作成し使用し画面表示
    type: 'Parse';
    message: string;
};

// NOTE: サーバ独自の { code: string, message: string } を受けた場合、messageは開発者向けに保持。
//       ユーザ向け文言はUI側のi18nテーブルで type/status に応じて決める。