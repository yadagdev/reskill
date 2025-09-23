import { describe, it, expect } from 'vitest';
import { isJsonResponse } from '../isJsonResponse';

//ヘッダだけ差し替えられる簡易 Response ヘルパ関数
const makeResponse = (headers: Record<string, string>) =>
    new Response('', { headers });

describe('isJsonResponse', () => {
    it('content-type に application/json を含めば true', () => {
        const res = makeResponse({
            'content-type': 'application/json; charset=utg=8'
        });
        expect(isJsonResponse(res)).toBe(true);
    });

    it('content-typeがなければ false', () => {
        const res = makeResponse({});
        expect(isJsonResponse(res)).toBe(false);
    })
});