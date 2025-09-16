import { describe, it, expect } from 'vitest';              // テストで使用するAPI読み込み
import { mapUser } from '../mapUser';                       // テスト対象の関数を読み込み

describe('mapUser', () => {                                 // mapUserに関するテストグループ
    it('updated_atがないときはupdatedAtを付けない', () => {   // updated_atがないときのテストケース
        // サーバーから生JSONを受け取った想定
        const response = mapUser({
            id: 'u1',
            email: 'a@b.com',
            name: 'A',
            created_at: '2025-01-01T00:00:00Z',
            // updated_atはこのケースではなし
        });

        // 期待: created_atがcamelCaseに変換されていること、updatedAtはなし
        expect(response).toEqual({
            id: 'u1',
            email: 'a@b.com',
            name: 'A',
            createdAt: '2025-01-01T00:00:00Z',
            // updatedAtはつかない
        });

        // updatedAtがないことを二重で確認, プロパティ存在を明示的に否定
        expect('updatedAt' in response).toBe(false);
    });

    it('updated_atがある時はupdatedAtを付ける', () => {         // updated_atがある時のテストケース
        // サーバーからupdated_atも入っている生JSONを受け取った想定
        const response = mapUser({
            id: 'u1',
            email: 'a@b.com',
            name: 'A',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-02T00:00:00Z',               // updated_atをresponseに含めておく
        });

        // updated_atがありcamelCaseに変換されていることを確認
        expect(response.updatedAt).toBe('2025-01-02T00:00:00Z')
    });
})