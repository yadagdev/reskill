// NOTE:
// サービス層の責務
//  - 入出力の最終バリデーション（UIだけに依存しない）
//  - API呼び出し順序/組み合わせの制御（ユースケースの流れ）
//  - サーバレスポンス→フロントモデルへのマッピング
// 非責務
//  - 低レベルHTTPの詳細（ヘッダ・エラー整形）→ HttpClientへ委譲
//  - UIの文言決定（i18n）→ UI側の責務
// NOTE:
// UserServiceは HttpClient を“利用”してユースケースを組み立てる。ヘッダ/例外の整形はやらない
// 5xxはサーバ障害 → 時間をおいて再試行／ステータスページ案内。
// import type { HttpClient } from '../../http/HttpClient';
// import type { Result } from '../../domain/common/Result';
// import type { User } from '../../domain/user/User';
// import type { CreateUserDto } from '../../domain/user/CreateUserDto';

/*export class UserService {
    constructor(
        private readonly http: HttpClient
    ){}

    // TODO: const BASE = '/api/users'; // `createUser`: POST BASE, `getById`: GET `${BASE}/${id}`

    // TODO: Response例:
    //  POST /api/users -> { id, email, name, created_at } を受け取り User へ { createdAt } に変換
    //  GET  /api/users/:id -> 同上。404は HttpError{ type:'Http', status:404 }
    // /api/users へPOSTして作成。成功: Result<User> (201 / 200) , 失敗: Result<HttpError>
    // TODO: マッピング方針（コメントのみ）:
    //  - created_at -> createdAt (string ISO)
    //  - updated_at -> updatedAt (採用する場合)
    // TODO: サーバ { updated_at } -> User { updatedAt } へマッピング
    // POST /api/users -> { id, email, name, created_at, updated_at? } -> User { createdAt, (updatedAt) }
    async createUser(dto: CreateUserDto): Promise<Result<User>> {
        // TODO: 事前バリデーション（email/name/password)
        // TODO: this.http.post<User, CreateUserDto>('/api/users', dto)
        // TODO: サーバーキー名->User型へのマッピング（created_at　-> createdAt等）
        // TODO: HttpErrorのtypeでUIが分岐できるよう、Resultで返す（throwしない）
        // TODO: 同一メールの重複（409想定）のUI方針: 入力されたメールアドレスは既に利用されていますのメッセージ表示
    }
    
    // TODO: Resultのエラー例:
    //  - 401/403 -> 認証/権限不足（UIで導線）
    //  - 404     -> 「見つかりません」表示
    //  - 409     -> 「メール重複」表示
    //  - 5xx     -> 「時間をおいて再試行」表示
    // /api/users/:id を取得。成功: Result<User>, 404はHttpError{type:'Http',status:404}
    async getById(id: string): Promise<Result<User>> {
        // TODO: idの簡易チェック（空/空白NG）
        // TODO: this.http.get<User>(`/api/users/${id}`)
        // TODO: 404/401/403/5xxの代表ケースをコメントで書いておく
    }

    // TODO: private buildUser(resp: { id:string; email:string; name:string; created_at:string; updated_at?:string }): User
    //        - 上記のような小さなprivate関数で snake_case -> camelCase を一箇所に集約

    // TODO: private normalizeCreateUser(dto: CreateUserDto): CreateUserDto  // trim/小文字化など
}
*/