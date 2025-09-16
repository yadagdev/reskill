// NOTE:
// サービス層の責務
//  - 入出力の最終バリデーション（UIだけに依存しない）
//  - API呼び出し順序/組み合わせの制御（ユースケースの流れ）
//  - サーバレスポンス→フロントモデルへのマッピング
// 非責務
//  - 低レベルHTTPの詳細（ヘッダ・エラー整形）→ HttpClientへ委譲
//  - UIの文言決定（i18n）→ UI側の責務
// HttpClientはDI。mapUserで生JSON -> UIに変換。

import type { HttpClient } from '../../http/HttpClient';
import type { Result } from '../../domain/common/Result';
import type { User } from '../../domain/user/User';
import type { CreateUserDto } from '../../domain/user/CreateUserDto';
import type { UserResponse } from './UserResponse';
import { mapUser } from './mapUser';

// NOTE: サービス層は「ユースケースの手順」を組む（低レベルHTTPはHttpClientへ委譲）
export class UserService {

    private static readonly BASE = '/api/users';

    constructor(private readonly http: HttpClient){}

    // POST /api/users
    async createUser(dto: CreateUserDto): Promise<Result<User>> {
        // 入力の軽い正規化
        const clean: CreateUserDto = {
            email: dto.email.trim(),
            name: dto.name.trim(),
            password: dto.password, // 必要ならポリシーに合わせて強度チェックを追加
        }

        const response = await this.http.post<UserResponse, CreateUserDto>(
            UserService.BASE,
            clean
        );

        if (!response.ok) return response; // エラーはそのまま返すHttpErrorをそのまま返す

        return {
            ok: true,
            value: mapUser(response.value)
        };
    }
    
    // GET /api/users/:id
    async getById(id: string): Promise<Result<User>> {
        // 1) idの簡易バリデーション（空/空白NG）
        const trimmed = (id ?? '').trim();
        if (!trimmed) {
            // サーバーに到達する前の入力不正 -> 今回はParseとして返す
            return {
                ok: false,
                error: {
                    type: 'Parse',
                    message: 'id is required'
                },
            };
        }

        const response = await this.http.get<UserResponse>(
            `${UserService.BASE}/${encodeURIComponent(trimmed)}`
        )
        // 失敗時
        if (!response.ok) return response;
        // 成功時 マッピングして返す
        return {
            ok: true,
            value: mapUser(response.value)
        };
    }
}