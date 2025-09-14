// NOTE:
// サービス層の責務
//  - 入出力の最終バリデーション（UIだけに依存しない）
//  - API呼び出し順序/組み合わせの制御（ユースケースの流れ）
//  - サーバレスポンス→フロントモデルへのマッピング
// 非責務
//  - 低レベルHTTPの詳細（ヘッダ・エラー整形）→ HttpClientへ委譲
//  - UIの文言決定（i18n）→ UI側の責務
// import type { HttpClient } from '../../http/HttpClient';
// import type { Result } from '../../domain/common/Result';
// import type { User } from '../../domain/user/User';
// import type { CreateUserDto } from '../../domain/user/CreateUserDto';

/*export class UserService {
    constructor(
        private readonly http: HttpClient
    ){}

    // /api/users へPOSTして作成。成功: Result<User> (201 / 200) , 失敗: Result<HttpError>
    async createUser(dto: CreateUserDto): Promise<Result<User>> {
        // TODO: 事前バリデーション（email/name/password)
        // TODO: this.http.post<User, CreateUserDto>('/api/users', dto)
        // TODO: サーバーキー名->User型へのマッピング（created_at　-> createdAt等）
        // TODO: HttpErrorのtypeでUIが分岐できるよう、Resultで返す（throwしない）
        // TODO: 同一メールの重複（409想定）のUI方針: 入力されたメールアドレスは既に利用されていますのメッセージ表示
    }
    
    // /api/users/:id を取得。成功: Result<User>, 404はHttpError{type:'Http',status:404}
    async getById(id: string): Promise<Result<User>> {
        // TODO: idの簡易チェック（空/空白NG）
        // TODO: this.http.get<User>(`/api/users/${id}`)
        // TODO: 404/401/403/5xxの代表ケースをコメントで書いておく
    }
}
*/