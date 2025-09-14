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
    // baseUrlには/が入るように、urlの頭には/が入らないようにurlの頭に/がないかをif文で判定してからjoinする

    // TODO: 2) 共通ヘッダ（Content-Type, Authorization）をどう与えるか方針を書く
    // 204 No Content / Content-Length:0の場合はJSONを読み込まない
    // 渡されたJsonが壊れていたらParseしてエラーを返す
    // NOTE: Authorization付与方針: 呼び出し側が毎回 init.headers.Authorization を渡す

    // TODO: 3) fetchのtry-catchでNetworkエラーに丸める
    // try-catchでNetworkエラーをエラーとして丸めて画面に返す
    // タイムアウト: 今回は未対応（別タスク）。将来はAbortControllerで実装。
    // JSONの {message} or {error:{message}} > res.statusText > "Request failed"

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