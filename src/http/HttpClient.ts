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

// 通信の入口を一本化するインターフェース
export interface HttpClient {
    get<T>(url: string, init?: RequestInit): Promise<Result<T>>;
    post<T, B>(url: string, body: B, init?: RequestInit): Promise<Result<T>>;
    // TODO: put/deleteを追加
}

// 具象実装ファクトリ（本体は未実装）
// joinルール: baseUrlは末尾の/を削除、urlは先頭に/を付与（なければ）、`${baseUrl}${url}` で連結
// 例) baseUrl: "https://api.example.com", url:"users" -> "https://api.example.com/users"
export function createHttpClient(baseUrl: string): HttpClient {
/*  TODO: baseUrl を正規化（末尾の"/"を削る）

    TODO: 1) baseUrlとurlの連結ルール（スラッシュ重複回避）を決める
        baseUrlとurlをjoinする時にbaseUrlの末尾の/とurlの頭の/を連結しないように
    TODO: 2) 共通ヘッダ（Content-Type, Authorization）をどう与えるか方針を書く
        - Accept: application/json を基本付与
        - POST時は Content-Type: application/json（JSON.stringify(body)）
        - Authorizationは今回: 呼び出し側が init.headers で渡す。毎回ヘッダ設定の重複/付け忘れリスク（今回はシンプルさを優先）
        - 204/Content-Length:0 は JSONを読まない。valueは undefined とする（UI側で「成功だけどデータなし」扱い）
        - レスポンスJSONのパース失敗や契約ズレ（キー欠落/型不一致）は Parse として返す
        - 400系は Http(status) として返す（入力不正はParseではない）

    TODO: 3) fetchのtry-catchでNetworkエラーに丸める
        try-catchでNetworkエラーをエラーとして丸めて画面に返す
        タイムアウト: 今回は未実装（別タスク）。将来はAbortControllerで X 秒で中断
        if (!response.ok) の中で:
            1) JSON本文の {message} or {error:{message}} を最優先
            2) なければ response.statusText
            3) それも無ければ "Request failed"

    TODO: 4) res.ok判定→falseならHttpエラー化（statusと開発者向けmessage）
        responseの判定でfalseを返す時、statusに応じて出力するエラーメッセージを切り替える

    TODO: 5) res.json()失敗時はParseエラー

    TODO: 6) 成功時は { ok:true, value: data as T } を返す
        responseに問題がなければジェネリクスを返す

    TODO: 7) post<T,B>はbodyをJSON.stringifyして送る（型B）。getはbodyなし。
        postのbodyはJSON.stringifyに変換する

    return {

        TODO: fetch(joinUrl(baseUrl, url), { method: 'GET', headers: { Accept:'application/json', ...init?.headers }, ...init })
        async get<T>(url: string, init?: RequestInit): Promise<Result<T>> {
            1)  const fullUrl = joinUrl(baseUrl, url);
            2)  const headers = {
                    Accept:'application/json',
                    ...(init?.headers ?? {})
                }

            TODO: try/catch → Network に丸める（catch で { ok:false, error:{type:'Network', message} }）
            3)  try {
                const response = await fetch(
                        fullUrl, {
                            method:'GET',
                            ...init, headers
                        }
                    )
                } catch(e) {
                    return {
                        ok:false,
                        error:{
                            type:'Network',
                            message: String(e)
                        }
                    }
                }

            TODO: 204 / Content-Length:0 → JSONを読まない。value は undefined as T の方針をコメントで明記
            4)  if(response.status === 204 || response.headers.get('content-length') === '0') {
                    // JSONは読まない
                    return {
                        ok: true,
                        value: undefined as T
                    }
                }

            const parsedBody = content-type が JSON のときだけ json(); 失敗は Parse（この if では失敗させない）
            const message = extractErrorMessage(response, parsedBody)

            TODO: !response.ok → 可能なら本文をJSONとして読み、extractErrorMessageで message を得て Http(status,message)
            5) if(!response.ok) {
                    可能ならJSONを読み、extractErrorMessage(response, body)でmessageを決定
                    return {
                        ok: false,
                        error: {
                            type: 'Http',
                            status: response.status,
                            message
                        }
                    }
                }

            6)  TODO: content-typeがapplication/jsonの時だけjson()。失敗したらParse エラーに丸める。

            7)  成功:
                return {
                    ok: true,
                    value: data as T
                }

        NOTE: (get) Network=catch, Http=!ok, Parse=json失敗。Authorization=B案。Timeoutは将来 AbortController。
        NOTE: (get) Network判定は try/catch。Parse判定は content-type が JSON のときの json() 失敗。
                    Authorization は呼び出し側（B案）。Timeout は将来 AbortController。
        HINT: (get) ヘッダは呼び出し側優先でマージ。204/CL:0 は JSON を読まない。

        async post<T, B>(url: string, body: B, init?: RequestInit): Promise<Result<T>> {
            1) const fullUrl = joinUrl(baseUrl, url)

            2) const headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(init?.headers ?? {})
                }

            TODO: try/catch → Network に丸める（catch で { ok:false, error:{type:'Network', message} }）
            3)  try {
                    const response = await fetch(
                        fullUrl,
                        {
                            method: 'POST',
                            body: JSON.stringify(body),
                            ...init, headers
                        }
                    )
                } catch (e) {
                        return {
                            ok: false,
                            error: {
                                type:'Network',
                                message: String(e)
                            }
                        }
                    }
            TODO: 204 / Content-Length:0 → JSONを読まない。value は undefined as T
            4)  if(response.status === 204 || response.headers.get('content-length') === '0') {
                // JSONは読まない
                return {
                    ok: true,
                    value: undefined as T
                }
            }

            const parsedBody = content-type が JSON のときだけ json(); 失敗は Parse（この if では失敗させない）
            const message = extractErrorMessage(response, parsedBody)

            TODO: !response.ok → extractErrorMessage で Http(status,message)
            5) if (!response.ok) {
                    可能ならJSONを読み、extractErrorMessage(response, body)でmessageを決定
                    return {
                        ok: false,
                        error: {
                            type: 'Http',
                            status: response.status,
                            message
                        }
                    }
                }
            TODO: content-typeがapplication/jsonの時だけjson()。失敗したらParse エラーに丸める。
            6) // JSON判定→json()、失敗なら Parse、成功なら { ok:true, value as T }

            TODO: 成功 → { ok:true, value: data as T }
            POST時は Content-Type: application/json（JSON.stringify(body)）
            7)  成功:
                return {
                    ok: true,
                    value: data as T
                }
        }
    }
    
    NOTE: (post) 上と同じ方針。POSTは body を JSON.stringify + 'Content-Type: application/json'
    NOTE: (post) Network=catch, Http=!ok, Parse=json失敗。Authorization=B案。Timeoutは将来AbortController。
    HINT: (post) 204/CL:0 あり得る（作成APIでも No Content はあり得る）
}


    ここでは{} as HttpClientのダミーだけ返す。
    ※ ビルドを通したい場合のみ、一時的にダミー return を自分で入れてOK:
*/
    return {} as unknown as HttpClient;//ビルドを通すための仮置き
};

/*
    NOTE:    createHttpClient の戻りは { get, post } を持つ具象オブジェクト。
    NOTE:    Authorization は呼び出し側（B案）。タイムアウトは将来 AbortController。
    HINT: RequestInit の headers は呼び出し側優先でマージ（AuthorizationはB案：呼び出し側が渡す）
    HINT: タイムアウトは未実装（将来 AbortController）
*/

