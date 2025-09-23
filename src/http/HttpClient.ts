/*
本モジュールの責務（do）
    - HTTP呼び出しの入口を統一（fetch/axios等の実装差を隠蔽）
    - 共通ヘッダ付与（Accept, 必要時 Content-Type）、認証ヘッダの方針統一（今回はB: 呼び出し側渡し）
    - エラー整形（Network/Http/Parse への正規化とメッセージ抽出）
    - 空レスポンス(204/Content-Length:0)の扱いを統一

本モジュールの非責務（don't）
    - スキーマ検証（Zod等）は上位層で実施予定
    - 自動リトライ/バックオフ（将来必要なら別レイヤで）
    - ビジネスロジック（ユースケース）は保持しない
    - 認可判定やUI文言の最終決定（UI側/i18n側で実施）

DI前提: createHttpClientで作ったインスタンスをサービス層に注入して使う（HttpClientは下位の詳細を隠蔽）
*/

import type { Result } from '../domain/common/Result';
import { joinUrl } from './internal/joinUrl';
import { extractErrorMessage } from './internal/extractErrorMessage';
import { isJsonResponse } from './internal/isJsonResponse';

// 通信の入口を一本化するインターフェース
export interface HttpClient {
    get<T>(url: string, init?: RequestInit): Promise<Result<T>>;
    post<T, B>(url: string, body: B, init?: RequestInit): Promise<Result<T>>;
    delete<T>(url: string, init?: RequestInit): Promise<Result<T>>;
    // TODO: putを追加
}

// 具象実装ファクトリ（本体は未実装）
// joinルール: baseUrlは末尾の/を削除、urlは先頭に/を付与（なければ）、`${baseUrl}${url}` で連結
// 例) baseUrl: "https://api.example.com", url:"users" -> "https://api.example.com/users"
export function createHttpClient(baseUrl: string): HttpClient {
    // 0) baseUrl を正規化（末尾の"/"を削る）
    const normalizedBase = baseUrl.replace(/\/+$/, '');

    return {
        // =================
        // GET
        // =================
        async get<T>(url: string, init?: RequestInit): Promise<Result<T>> {
            const fullUrl = joinUrl(normalizedBase, url);

            // 2) 呼び出し側のheadersを尊重しつつ Accept を付与
            const headers: HeadersInit = {
                Accept: 'application/json',
                ...(init?.headers ?? {}),
            };

            let response: Response;
            try {
                response = await fetch(fullUrl, {
                    method: 'GET',
                    ...init,
                    headers, // ここで上書きされないように最後に流す
                });
            } catch (e: unknown) {
                // 3) Networkへ丸める (rejectのケース)
                const message = (e as Error)?.message ?? String(e);
                return { ok: false, error: { type: 'Network', message } };
            }

            // 4) 204 or Content-Length:0はJSONを読まずに成功扱い
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return { ok: true, value: undefined as T};
            };

            // 5) 成功(2xx)系と失敗(4xx/5xx)系で分岐
            if (response.ok) {
                // 5-1) 成功側: JSONならjson()実施、それ以外はundefinedを返す
                if (isJsonResponse(response)) {
                    try {
                        const data = await response.json();
                        return { ok: true, value: data as T };
                    } catch (err: unknown) {
                        // 5-2) JSONだがparse失敗 -> Parse
                        const message = (err as Error)?.message ?? String(err);
                        return { ok: false, error: { type: 'Parse', message } };
                    }
                } else {
                    // JSON以外は今回はundefinedを返してOK（要件外）
                    return { ok: true, value: undefined as T };
                }
            } else {
                // 5-3) 失敗側: 可能なら本文JSONを読み、extractErrorMessageを文言を決めてHttpに丸める
                let parsed: unknown = undefined;
                if (isJsonResponse(response)) {
                    try {
                        parsed = await response.json();
                    } catch {
                        // ここでparse失敗してもHttpにする（テストの想定）
                    }
                }
                const message = extractErrorMessage(response, parsed);
                return { ok: false, error: { type: 'Http', status: response.status, message} };
            }
        },

        // =========================
        // POST
        // =========================
        async post<T, B>(url:string, body: B, init?: RequestInit): Promise<Result<T>> {
            const fullUrl = joinUrl(normalizedBase, url);

            // 6) POSTはContent-Type: application/json を付与し body をJSON文字列か
            const headers: HeadersInit = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(init?.headers ?? {}),
            };

            let response: Response;
            try {
                response = await fetch(fullUrl, {
                    method: 'POST',
                    body: JSON.stringify(body),
                    ...init,
                    headers,
                });
            } catch (e: unknown) {
                const message = (e as Error)?.message ?? String(e);
                return { ok: false, error: { type: 'Network', message } };
            }

            // 7) 204 or Content-Length:0 はJSONを読まずに成功扱い（value: undefined)
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return { ok: true, value: undefined as T };
            }

            if (response.ok) {
                if (isJsonResponse(response)) {
                    try {
                        const data = await response.json();
                        return { ok: true, value: data as T };
                    } catch (err: unknown) {
                        const message = (err as Error)?.message ?? String(err);
                        return { ok: false, error: { type: 'Parse', message } }
                    }
                } else {
                    return { ok: true, value: undefined as T };
                }
            } else {
                let parsed: unknown = undefined;
                if (isJsonResponse(response)) {
                    try {
                        parsed = await response.json();
                    } catch {
                        // 失敗してもHttpとして処理
                    }
                }
                const message = extractErrorMessage(response, parsed);
                return { ok: false, error: { type: 'Http', status: response.status, message } };
            }
        },

        // =================
        // DELETE
        // =================
        async delete<T>(url: string, init?: RequestInit): Promise<Result<T>> {
            const fullUrl = joinUrl(normalizedBase, url);
            const headers: HeadersInit = {
                Accept: 'application/json',
                ...(init?.headers ?? {}),
            };

            try {
                // response
                const res = await fetch(fullUrl, {
                    method: 'DELETE',
                    ...init,
                    headers
                });
                // 成功のHTTP/Parseは追加実装予定
                return { ok: true, value: undefined as T };
            } catch (e: unknown) {
                const message = (e as Error)?.message ?? String(e);
                return { ok: false, error: { type: 'Network', message }}
            }
        },

    };
}
