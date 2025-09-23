import { describe, it, expect, vi, afterEach } from "vitest";
import { createHttpClient, HttpClient } from '../HttpClient';
import { create } from "domain";

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
    })

})