export function extractErrorMessage(response: Response, body: unknown): string {

    // 1) bodyがobjectかナローイング
    if (typeof body === 'object' && body != null) {
        const object = body as any;
        // 2) error.message -> messageの順で安全に参照
        const message =
            (object?.error?.message as unknown ) ?? (object.message as unknown);
        
        if(typeof message === 'string' && message.trim() !== '') {
            return message;
        }
    }

    const string = (response.statusText ?? '').trim();
    // 3) 見つからなければ response.statusText\
    // 4) さらになければ "Request failed"
    if(string !== '') return string;
        return 'Request failed';
}
    // NOTE: bodyがstringした場合は今回は無視
    //      ここは「既に得られた body から文言を選ぶだけ」。json() を呼ぶのは HttpClient 側。
    //      body が string だった場合はその文字列を返す選択肢もあるが、今回は object のみを対象。
    // TEST: error.message > message > statusText > "Request failed" の優先順位を網羅
