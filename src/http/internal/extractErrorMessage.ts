export function extractErrorMessage(response: Response, Body: unknown): string {
    // TODO: bodyがオブジェクトなら'message' または 'error.message'を最優先で取り出す
    // TODO: それがなければ response.statusTextを使う
    // TODO: それもなければ "Request failed"を返す
    // HINT: typeof body === 'object' && body !== null でのナローイング
    // HINT: (body as any)?.error?.message || (body as any)?.messageの順で安全に確認
    return {} as unknown as string;//ビルドを通すための仮置き
}