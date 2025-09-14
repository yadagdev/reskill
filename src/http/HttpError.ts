export type HttpError = {
    // TODO: 具体的なエラー 
    type: 'Network';
    message: string;
} | {
    // TODO: 具体的なエラー
    // 401 Unauthorized(未ログイン) ログインしていない旨を表示しログイン画面にリダイレクト
    // 403 Forbidden(閲覧許可がないURL) 閲覧権限がない旨を表示
    // 404 Not Found(存在しないページ) ページが存在しない旨を表示,トップ画面に戻る or 戻るボタンを表示
    // 500 Internal Server Error(サーバー側で処理ができない、サーバーが落ちている時) アクセスできない旨を表示
    // 502 Bad Gateway(無効なレスポンス) 入力値が無効な値である旨を表示
    // 503 Service Unavaileble メンテナンス中かサーバーに負荷がかかりすぎている,時間をおいてから再度読み込んでくださいのメッセージ表示
    // 504 Gateway Timeout サーバーとの通信がタイムアウト,再読み込みボタンを表示するかトップページにリダイレクト
    type: 'Http';
    status: number;
    message: string;
} | {
    // TODO: JSONの値が不適切な時
    type: 'Parse';
        message: string;
}

// HINT:
// - UIは type を見て再試行/再ログイン/問い合わせ誘導を決める方針。
// - messageは開発者向け。ユーザー向け文言は別テーブルで対応（i18n前提）。