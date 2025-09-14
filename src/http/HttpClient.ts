import type { Result } from '../domain/common/Result';

// 通信の入口を一本化するインターフェース
export interface HttpClient {
    get<T>(url: string, init?: RequestInit): Promise<Result<T>>;
    post<T, B>(url: string, body: B, init?: RequestInit): Promise<Result<T>>;
    // TODO: put/deleteを追加
}

// 具象実装ファクトリ（本体は未実装）
export function createHttpClient(baseUrl: string): HttpClient {
    // TODO: 1) baseUrlとurlの連結ルール（スラッシュ重複回避）を決める
    // baseUrlとurlをjoinする時にbaseUrlの末尾の/とurlの頭の/を連結しないように
    // joinルール: baseUrlは末尾の/を削除、urlは先頭に/を付与（なければ）、`${baseUrl}${url}` で連結
    // 例) baseUrl: "https://api.example.com", url:"users" -> "https://api.example.com/users"

    // TODO: 2) 共通ヘッダ（Content-Type, Authorization）をどう与えるか方針を書く
    // - Accept: application/json を基本付与
    // - POST時は Content-Type: application/json（JSON.stringify(body)）
    // - Authorizationは今回: 呼び出し側が init.headers で渡す
    // 204/Content-Length:0 は JSONを読まない。valueは undefined とする（UI側で「成功だけどデータなし」扱い）
    // 渡されたJsonが壊れていたらParseしてエラーを返す

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

    // ここでは{} as HttpClientのダミーだけ返す。
    return {} as unknown as HttpClient;
};