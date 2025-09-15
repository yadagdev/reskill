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

// NOTE: createHttpClient の戻りは { get, post } を持つ具象オブジェクト
//       今日は "処理の段取り" をコメントで固める（完成コードは書かない）
import type { Result } from '../domain/common/Result';
// import { joinUrl } from './internal/joinUrl';
// import { extractErrorMessage } from './internal/extractErrorMessage';

// 通信の入口を一本化するインターフェース
export interface HttpClient {
    get<T>(url: string, init?: RequestInit): Promise<Result<T>>;
    post<T, B>(url: string, body: B, init?: RequestInit): Promise<Result<T>>;
    // TODO: put/deleteを追加
}

// 具象実装ファクトリ（本体は未実装）
export function createHttpClient(baseUrl: string): HttpClient {
    // TODO: baseUrl を正規化（末尾の"/"を削る）

    // TODO: 1) baseUrlとurlの連結ルール（スラッシュ重複回避）を決める
    // baseUrlとurlをjoinする時にbaseUrlの末尾の/とurlの頭の/を連結しないように
    // joinルール: baseUrlは末尾の/を削除、urlは先頭に/を付与（なければ）、`${baseUrl}${url}` で連結
    // 例) baseUrl: "https://api.example.com", url:"users" -> "https://api.example.com/users"

    // TODO: 2) 共通ヘッダ（Content-Type, Authorization）をどう与えるか方針を書く
    // - Accept: application/json を基本付与
    // - POST時は Content-Type: application/json（JSON.stringify(body)）
    // - Authorizationは今回: 呼び出し側が init.headers で渡す。毎回ヘッダ設定の重複/付け忘れリスク（今回はシンプルさを優先）
    // - 204/Content-Length:0 は JSONを読まない。valueは undefined とする（UI側で「成功だけどデータなし」扱い）
    // - レスポンスJSONのパース失敗や契約ズレ（キー欠落/型不一致）は Parse として返す
    // - 400系は Http(status) として返す（入力不正はParseではない）

    // TODO: 3) fetchのtry-catchでNetworkエラーに丸める
    // try-catchでNetworkエラーをエラーとして丸めて画面に返す
    // タイムアウト: 今回は未実装（別タスク）。将来はAbortControllerで X 秒で中断
    // if (!response.ok) の中で:
    // 1) JSON本文の {message} or {error:{message}} を最優先
    // 2) なければ response.statusText
    // 3) それも無ければ "Request failed"

    // TODO: 4) res.ok判定→falseならHttpエラー化（statusと開発者向けmessage）
    // responseの判定でfalseを返す時、statusに応じて出力するエラーメッセージを切り替える

    // TODO: 5) res.json()失敗時はParseエラー

    // TODO: 6) 成功時は { ok:true, value: data as T } を返す
    // responseに問題がなければジェネリクスを返す

    // TODO: 7) post<T,B>はbodyをJSON.stringifyして送る（型B）。getはbodyなし。
    // postのbodyはJSON.stringifyに変換する

/*return {
        async get<T>(url: string, init?: RequestInit): Promise<Result<T>> {
        TODO: try/catch → Network に丸める（catch で { ok:false, error:{type:'Network', message} }）
        TODO: fetch(joinUrl(baseUrl, url), { method: 'GET', headers: { Accept:'application/json', ...init?.headers }, ...init })
        TODO: 204 / Content-Length:0 → JSONを読まない。value は undefined as T の方針をコメントで明記
        TODO: !response.ok → 可能なら本文をJSONとして読み、extractErrorMessageで message を得て Http(status,message)
        TODO: json() 失敗 → Parse エラーに丸める
        TODO: 成功 → { ok:true, value: data as T }
        HINT: RequestInit の headers は呼び出し側優先でマージ（AuthorizationはB案：呼び出し側が渡す）
        HINT: タイムアウトは未実装（将来 AbortController）
        NOTE: Network判定: fetch が throw したら Network として畳み込む（catch 節で Result<never> を返す方針）
        NOTE: Parse判定: JSONを読む前に content-type を確認。json() 失敗は Parse で返す
        NOTE: 204/Content-Length:0 は JSON を読まない。value は undefined とする（UIは「成功だがデータなし」）
        },

        async post<T, B>(url: string, body: B, init?: RequestInit): Promise<Result<T>> {
            TODO: 上記 get と同様の流れ。method:'POST'
            TODO: body は JSON.stringify(body)。Content-Type:'application/json' を付与
            TODO: !response.ok → extractErrorMessage で Http(status,message)
            TODO: json() 失敗 → Parse
            TODO: 成功 → { ok:true, value: data as T }
        }
    };

    // ここでは{} as HttpClientのダミーだけ返す。
    // ※ ビルドを通したい場合のみ、一時的にダミー return を自分で入れてOK:
*/
    return {} as unknown as HttpClient;//ビルドを通すための仮置き
};