export function extractErrorMessage(response: Response, body: unknown): string {
    // TODO: bodyがオブジェクトなら'message' または 'error.message'を最優先で取り出す
    // TODO: それがなければ response.statusTextを使う
    // TODO: それもなければ "Request failed"を返す
    // HINT: typeof body === 'object' && body !== null でのナローイング
    // HINT: (body as any)?.error?.message || (body as any)?.messageの順で安全に確認
    return {} as unknown as string;//ビルドを通すための仮置き
}
// TEST: error.message > message > statusText > "Request failed" の優先順位を網羅
// NOTE: この関数は "既に得られた body" から文言だけ選ぶ。json() の実行や失敗判定は HttpClient 側で行う