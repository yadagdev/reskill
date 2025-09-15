export function extractErrorMessage(response: Response, body: unknown): string {
/*  NOTE: ここは「既に得られた body から文言を選ぶだけ」。json() を呼ぶのは HttpClient 側。
            statusText が空文字のサーバもあるため、最終フォールバック "Request failed"
    TODO: bodyがオブジェクトなら'message' または 'error.message'を最優先で取り出す
    TODO: それがなければ response.statusTextを使う
    TODO: それもなければ "Request failed"を返す
*/
    return {} as unknown as string;//ビルドを通すための仮置き
}
/*
    TEST: error.message > message > statusText > "Request failed" の優先順位を網羅
    HINT: typeof body === 'object' && body !== null でのナローイング
    HINT: (body as any)?.error?.message || (body as any)?.messageの順で安全に確認
    HINT: body が string だった場合はその文字列を返す選択肢もあるが、今回は object のみを対象。
*/