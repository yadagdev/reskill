import { describe, it, expect, vi, afterEach } from "vitest";
import { createHttpClient, HttpClient } from "../HttpClient";

afterEach(() => {
    vi.restoreAllMocks()
})

const BASE: string = 'https://api.example.com';

describe('HttpClient.post', ()=> {

    // ネットワークエラー: オフライン
    it('Network: fetchがrejectされたら type=Network でエラー', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(
            new TypeError('offline')
        );

        const http: HttpClient = createHttpClient(BASE);
        const result = await http.post<unknown, {x:number}>('/any', { x: 1 });

        // TODO: ok=false / error.type==='Network' / messageにoffline
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.type).toBe('Network');
            expect(result.error.message).toMatch(/offline/i);
        };
    });
    
    it ('Http: 404 + JSONに本文がある時は Http statusとJsonのmessageを抽出', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ message: 'bad'}), {
                status: 404,
                statusText: 'Not Found',
                headers: {
                    'content-type': 'application/json'
                },
            })
        )
        const http: HttpClient = createHttpClient(BASE);
        const result = await http.post<unknown, {x:number}>('/any', { x:1 });

        // TODO: ok=false / error.type==='Http' / status===404 / message==='bad'
        expect(result.ok).toBe(false);
        if (!result.ok && result.error.type === 'Http') {
            expect(result.error.type).toBe('Http');
            expect(result.error.status).toBe(404);
            expect(result.error.message).toBe('bad');
        }
    });

    it ('Parse: content-typeはJSONだがjson()が失敗しthrowされた時', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => { throw new SyntaxError('oops')}
            } as unknown as Response
        );

        const http: HttpClient = createHttpClient(BASE);
        const result = await http.post<unknown, {x:number}>('/any', { x:1 });

        // TODO: ok=false / error.type==='Parse'
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.type).toBe('Parse');
        }
    });

    it ('Http status 204: value: undefined / Content-Lengsh:0', async () => {
        // 204の時
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(
                null, { status: 204}
            )
        );

        const http: HttpClient = createHttpClient(BASE);
        const result204 = await http.post<unknown, {x:number}>('/no-content', {x:1});

        // TODO: result204.ok===true, result204.value===undefined
        expect(result204.ok).toBe(true);
        if (result204.ok) {
            expect(result204.value).toBeUndefined();
        }

        // Content-Length:0の時
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response('', {
                status: 200,
                headers: {
                    'content-length': '0'
                }
            })
        )

        const resultCL0 = await http.post<unknown, {x:number}>('/zero', {x:1});
        // TODO: r2.ok===true, r2.value===undefined
        expect(resultCL0.ok).toBe(true);
        if (resultCL0.ok) {
            expect(resultCL0.value).toBeUndefined();
        }
    });

    it ('送信検証: fetch の第2引数の method/headers/body', async () => {
        const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            // fetchの戻り（Response）をモックとして作成。本文は { ok:true }, 200, application/json
            new Response(
                JSON.stringify({ ok:true}), {
                    status: 200,
                    headers: { 'content-type': 'application/json' }
                }
            )
        );

        // 被テスト対象のHttpClientを作成
        const http = createHttpClient(BASE);
        // 送信ボディを用意
        const dto = { email: 'a@b.com', name: 'A' };

        // 実際にPOSTを呼ぶ（awaitで非同期にすることで呼び出し完了を保証）
        await http.post<{ ok:boolean }, typeof dto>('/users', dto);

        // fetchが期待通りに飛ばれたかを検証する
        expect(spy).toHaveBeenCalledWith(
            // 第1引数: URL（joinUrlの結果） 文字列であればOK
            expect.any(String),
            // 第2引数: initオブジェクトの部分一致（全部一致でなくて良い）
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }),
                // 送信ボディがJSON化された文字列になっていること
                body: JSON.stringify(dto),
            })
        )

    });

});