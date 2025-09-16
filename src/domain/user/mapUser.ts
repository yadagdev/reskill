import type { User } from './User';
import type { UserResponse } from './UserResponse';

// Json(UserResponse) -> UIモデル（User）の変換
// TODO: snake_case => camelCase
// TODO: updated_atがない場合の扱い（User側に追加するならnull/undefined方針を決める）
// TODO: 日付はstringで保持して表示時にDate型にする（責務はUIが担う）
// NOTE: 実装は後続タスク。
export function mapUser(response: UserResponse): User {
    return {
        id: response.id,
        email: response.email,
        name : response.name,
        createdAt: response.created_at,
        ...(response.updated_at !== undefined
            ? { updatedAt: response.updated_at }
            : {}),
    }
}