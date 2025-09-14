import type { Result } from '../domain/common/Result';

type RequestInitLike = {
    header?: Record<string, string>;
    // TODO: 必要になったらmethod / dody / signalなど最小限を段階的に足す
} & Record<string, unknown>;

// 通信の入口を一本化するインターフェース
export interface HttpClient {
    get<T>(url: string, init?: RequestInitLike): Promise<Result<T>>;
    post<T, B>(url: string, body: B, init?: RequestInitLike): Promise<Result<T>>;
    // TODO: put/deleteを追加
}

// 具象実装ファクトリ（本体は未実装）
export function createHttpClient(baseUrl: string): HttpClient {
  // TODO: 1) baseUrlとurlの連結ルール（スラッシュ重複回避）を決める
  // TODO: 2) 共通ヘッダ（Content-Type, Authorization）をどう与えるか方針を書く
  // TODO: 3) fetchのtry/catchでNetworkエラーに丸める
  // TODO: 4) res.ok判定→falseならHttpエラー化（statusと開発者向けmessage）
  // TODO: 5) res.json()失敗時はParseエラー
  // TODO: 6) 成功時は { ok:true, value: data as T } を返す
  // TODO: 7) post<T,B>はbodyをJSON.stringifyして送る（型B）。getはbodyなし。
  // ここでは{} as HttpClientのダミーだけ返す。
    return {} as unknown as HttpClient;
}