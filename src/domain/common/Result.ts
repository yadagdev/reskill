import type { HttpError } from "../../http/HttpError";

export type Result<T> = {
    // TODO: valueの例
    // User { uuid: string, id: string, name: string, email: srging }
    ok: true;
    value: T;
} | {
    // TODO: 代表エラー3種のUIハンドリング案をコメントに書く
    // Network: 再読み込みボタン or 更新ボタン
    // Http: 再ログイン or ログイン画面リダイレクト
    // Parse: システムに不具合がしましたの画面 or 入力された値は無効ですの画面
    ok: false;
    error: HttpError;
}

// HINT:
// - UIまでthrowを流さず、境界でResultに畳み込む方針。
// - 呼び出し側は if (res.ok) { ... } else { switch(res.error.type) { ... } } で型安全分岐。
// - 補助: ok(value), err(error) のユーティリティは別途検討。