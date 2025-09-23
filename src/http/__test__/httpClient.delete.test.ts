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

})