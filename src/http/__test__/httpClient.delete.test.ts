import { describe, it, expect, vi, afterEach } from "vitest";
import { createHttpClient, HttpClient } from '../HttpClient';

afterEach(() => vi.restoreAllMocks());

const BASE = 'http://api.example.com';

describe('HttpClient.delete', () => {

    it('Network: fetch が reject されたら type=Network エラーになる', async () => {
        // 1) fetchをNetworkエラーにするモック
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'));

        // 2) SUT 準備
        const http: HttpClient = createHttpClient(BASE);

        // 3) 実行 (型 T は unknown で ok)
        const result = await http.delete<unknown>('/any');

        // 4) テスト
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.type).toBe('Network');
            expect(result.error.message).toMatch(/offline/);
        }
    });

    it('204: contentがなしは ok=true & value===undefined', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(null, { status: 204 })
        );

        const http: HttpClient = createHttpClient(BASE);
        const result = await http.delete<unknown>('/no-content');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value).toBeUndefined();
        }
    });

    it('Content-Length:0: contentがなしは ok=true & value===undefined', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response('', { status: 200, headers: { 'content-length': '0'} })
        );

        const http: HttpClient = createHttpClient(BASE);
        const result = await http.delete<unknown>('/zero');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value).toBeUndefined();
        }
    });

    it('Http: 404 + JSON 本文ありなら Http(status,message) で失敗', async () => {
        // 1) 404レスポンスを返すモック
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ message: 'not found'}), {
                status: 404,
                statusText: 'Not Found',
                headers: { 'content-type': 'application/json'},
            }),
        );

        // 2) STU準備
        const http = createHttpClient(BASE);

        // 3) 実行
        const result = await http.delete<unknown>('/users/xxx');

        // 4)
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.type).toBe('Http');
            // @ts-expect-error statusはHttp型のみ
            expect(result.error.status).toBe(404);
            expect(result.error.message).toBe('not found');
        }
    });

    it('200 + application/json の本文なら ok=true で value にJSONを入れる', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(
                JSON.stringify({ ok: true}), {
                status: 200,
                headers: { 'content-type': 'application/json' }
            })
        );

        const http: HttpClient = createHttpClient(BASE);
        const result = await http.delete<{ ok: boolean}>('/users/123');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value).toEqual({ ok: true })
        }
    })

    it('200 + text/plain の本文なら ok=true & value===undefined (本文は読まない)', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(
                'delete',
                {
                    status: 200,
                    headers: { 'content-type': 'text/plain'}
                }
            )
        );

        const http: HttpClient = createHttpClient(BASE);
        const result = await http.delete<unknown>('/users/123');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value).toBeUndefined();
        }
    })

})