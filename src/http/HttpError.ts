export type HttpError = 
  | {type: 'Network'; message: string} // TODO: どういう時にNetworkにするか書く(タイムアウト/オフライン)
  | {type: 'Http'; status: number; message: string} // TODO: 代表的なstautsとUIの挙動を書く（401/403/404/500)
  | {type: 'Parse'; message: string} // TODO: JSON壊れ/shape不一致などのケースでParseにするか書く

// HINT:
// - UIは type を見て再試行/再ログイン/問い合わせ誘導を決める方針。
// - messageは開発者向け。ユーザー向け文言は別テーブルで対応（i18n前提）。