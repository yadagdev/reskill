import type { HttpError } from "../../http/HttpError";

export type Result<T> = {
    // TODO: valueの例
    // User { id: string, name: string, email: string }
    ok: true;
    value: T;
} | {
    // TODO: 代表エラー3種のUIハンドリング案をコメントに書く
    // Network: 再読み込みボタン or 更新ボタン
    // Http: 401 -> 再ログイン/ログイン画面リダイレクト 403 -> 閲覧できませんの案内表示
    //       404 -> ページが存在しませんの表示
    //       5xx系 -> ページが読み込めません。しばらく経ってからもう一度試してくださいの表示
    // Parse: システムに不具合が発生しましたの画面 or 入力形式が不正ですの画面
    ok: false;
    error: HttpError;
};
// TODO: Result<T, E=HttpError> の形に拡張する余地メモ（今日はTのみで進める）

// HINT:
// - UIまでthrowを流さず、境界でResultに畳み込む方針。
// - 呼び出し側は if (res.ok) { ... } else { switch(res.error.type) { ... } } で型安全分岐。
// - 補助: ok(value), err(error) のユーティリティは別途検討。