export const hasNoContent = (response: Response): boolean => {
    // 1) 204 なら即 true
    if (response.status === 204) {
        return true;
    }

    // 2) content-length を取り出す (string | null)
    const contentLength = response.headers.get('content-length');

    // 3) null でなければ trim して '0'と比較
    if (contentLength !== null && typeof contentLength === 'string') {
        if (contentLength.trim() === '0') {
            return response.status === 204 || (contentLength !== null && contentLength.trim() === '0');
        }
    }

    // 4) それ以外はfalse
    return false;
}