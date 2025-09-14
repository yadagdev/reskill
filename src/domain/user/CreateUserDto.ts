export interface CreateUserDto {
    email: string;
    name: string;
    password: string;
}
// passwordはDTOだけ／UI+サービスで二重バリデーション
// TODO: バリデーション方針（UIとサービス層で二重化）
//  - email: フォーマット / trim / 小文字化（必要なら）
//  - name: trim / 空はNG
//  - password: 8文字以上・英数混在など（UIで即時、サービス層で最終チェック）
// TODO: セキュリティ: passwordはDTOにのみ存在。User（読み取りモデル）に載せない。
// TODO: 不正値はこの層ではthrowせず、サービス層でResult<HttpError>に畳み込む方針。
// NOTE: Request DTO(入力用) 。Response/表示用のUserとは分離（passwordは絶対に混ぜない）
// NOTE: 409(Conflict) 例: email重複。サービス層で HttpError(Http/409) に畳み、UIで文言出し分け
// NOTE: passwordはログ/分析に出さない（console.log/analytics送信を禁止）。送信後は即クリアする運用