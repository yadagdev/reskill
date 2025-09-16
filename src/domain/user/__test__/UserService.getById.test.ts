import { describe, it, expect } from 'vitest';
import { UserService } from '../UserService';
import type { HttpClient } from '../../../http/HttpClient';
import type { UserResponse } from '../UserResponse';

// HttpClientのスタブ作成をする関数
function makeHttp(stub: {
    get?: <T>(url: string) => Promise<{ ok: true; value: T} | { ok: false; error: any}>;
}): HttpClient {
    return {
        // getが渡されていなければNetworkエラーを返す既定の実装
        get: stub.get ?? (async () => ({
            ok: false,
            error: {
                type: 'Network' as const,
                message: 'stub'
            }
        })),
        // このテストではpostはしないのでダミーとして置いておく
        post: async () => ({
            ok: false,
            error: {
                type: 'Network' as const,
                message: 'not-used'
            }
        }),
    };
}

describe('UserService.getById', () => {
    it('空ID -> Parseを返す', async () => {
        const http = makeHttp({});
        const userService = new UserService(http);
        const response = await userService.getById(' ');    // 空文字をIDとしてgetById()の引数に入れて実行

        // responseが空白になるのでokはfalseになる, 失敗することが期待
        expect(response.ok).toBe(false);
        // responseが空なのにokがtrueになるとき
        if(!response.ok) {
            // errorのtypeがParse、messageは必須がでる
            expect(response.error.type).toBe('Parse');
            expect(response.error.message).toMatch(/id is required/);
        }
    });

    it('200 -> マッピング成功', async () => {
        // getを成功スタブに差し替え
        const http = makeHttp({
            get: async <T>() => {
                const value: UserResponse = {
                    id: 'u1',
                    email: 'a@b.com',
                    name: 'A',
                    created_at: '2025-01-01T00:00:00Z',
                };
            return {ok: true, value: value as unknown as T };
            },
        });

        const userService = new UserService(http);
        const response = await userService.getById('u1');

        expect(response.ok).toBe(true);
        if (response.ok) {
            expect(response.value).toEqual({
                id: 'u1',
                email: 'a@b.com',
                name: 'A',
                createdAt: '2025-01-01T00:00:00Z',
            });
        }
    });

    // getに404を入れる
    it('404 -> Http エラーをそのまま返す', async () => {
        const http = makeHttp({
            get: async () => ({
                ok: false,
                error: {
                    type: 'Http',
                    status: 404,
                    message: 'not found'
                }
            }),
        });

        const userService = new UserService(http);
        const response = await userService.getById('missing');

        expect(response.ok).toBe(false);
        if (!response.ok) {
            expect(response.error.type).toBe('Http');
            // 型ガードで'Http'を絞り込んでから.statusに触る
            // デモのために意図的に型エラーを@ts-expect-errorで抑制
            // @ts-expect-error
            expect(response.error.status).toBe(404);
        }
    });
});

