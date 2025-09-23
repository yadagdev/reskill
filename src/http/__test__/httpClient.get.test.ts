import { describe, it, expect, vi, afterEach } from "vitest";
import { createHttpClient, HttpClient } from "../HttpClient";

afterEach(() => {
    vi.restoreAllMocks()
})

const BASE: string = 'https://api.example.com';

describe('HttpClient.get', () => {
    it('Network: fetchがrejectされたら type=Network でエラー', async () => {
        // fetchを呼び出すモック
        // mockRejectedValueを使いawaitでメソッドを呼んだ時の結果をNetworkエラーにする。
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(
            new TypeError('Network down')
        );

        // createHttpClientの呼び出しをしてHttpClient型のhttpを作成
        const http: HttpClient = createHttpClient(BASE);

        // getを実行してresponseを作成
        // TODO: TODO: responseの型を定義
        const response = await http.get<unknown>('/users');

        // アサーション
        // Networkエラーになるようモックを作っているのでresponse.okがfalseになる
        expect(response.ok).toBe(false);
        // response.okがtrueになる時
        if (!response.ok) {
            // response.error.typeがNetworkになる
            expect(response.error.type).toBe('Network');
            // response.error.messageが/network/iになる
            expect(response.error.message).toMatch(/network/i)
        };
    });

    it('Http: 404 + JSONに本文がある時は Http statusとJsonのmessageを抽出', async () =>{
        // fetchで404が返ってくるmockを作成
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ message: 'not found'}), {
                status: 404,
                statusText: 'Not Found',
                headers: {
                    'content-type': 'application/json'
                },
            })
        );

        // createHttpClientの呼び出しをしてHttpClient型のhttpを作成
        const http: HttpClient = createHttpClient(BASE);

        // getを実行してresponseを作成
        const response = await http.get<unknown>('/users/xxx');

        // 404が返るからresponse.okはfalseが期待される
        expect(response.ok).toBe(false);
        // response.okがtrueになる時
        if (!response.ok && response.error.type === 'Http') {
            expect(response.error.type).toBe('Http');
            expect(response.error.status).toBe(404);
            expect(response.error.message).toBe('not found');
        }

    });

    it('Parse: content-typeはJSONだがjson()が失敗しthrowされた時', async () => {
        // mock作成
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => { throw new SyntaxError('bad json')}
            } as unknown as Response
        );

        // createHttpClientの呼び出しをしてHttpClient型のhttpを作成
        const http = createHttpClient(BASE);

        // getを実行してresponseを作成
        const response = await http.get<unknown>('/weird');

        expect(response.ok).toBe(false);
        if (!response.ok) {
            expect(response.error.type).toBe('Parse');
            expect(response.error.message).toMatch(/json|syntax|parse/i);
        }
    });

    it('Http status 204: value: undefined', async () => {
        // パターン1: 204 mock作成
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(
                null, { status: 204 }
            )
        );
        
        // createHttpClientの呼び出しをしてHttpClient型のhttpを作成
        const http = createHttpClient(BASE);
        const response204 = await http.get<unknown>('/no-content');
        expect(response204.ok).toBe(true);
        if (response204.ok) {
            expect(response204.value).toBeUndefined();
        }

        // パターン2: Content-Length:0 mock作成
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response('', {
                status: 200,
                headers: {
                    'content-length': '0'
                }
            })
        );

        // createHttpClientの呼び出しをしてHttpClient型のhttpを作成
        const responseCL0 = await http.get<unknown>('/zero')
        expect(responseCL0.ok).toBe(true);
        if (responseCL0.ok) {
            expect(responseCL0.value).toBeUndefined();
        }

    });
});