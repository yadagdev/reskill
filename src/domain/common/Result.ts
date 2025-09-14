import type { HttpError } from "../../http/HttpError";

export type Result<T> =
  | { ok: true; value: T } // TODO: valueの例（Userなど）をコメントに書く
  | { ok: false; error: HttpError }; // TODO: 代表エラー3種のUIハンドリング案をコメントに書く

// HINT:
// - UIまでthrowを流さず、境界でResultに畳み込む方針。
// - 呼び出し側は if (res.ok) { ... } else { switch(res.error.type) { ... } } で型安全分岐。
// - 補助: ok(value), err(error) のユーティリティは別途検討。