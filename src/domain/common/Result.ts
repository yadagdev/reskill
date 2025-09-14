// 使用場所メモ: サービス層/UI層/テストで使う型。Result自体はHTTPやUIに依存しない。
import type { HttpError } from "../../http/HttpError";

export type Result<T> = {
    // TODO: valueの例
    // User { id: string, name: string, email: string }
    ok: true;
    value: T;
} | {
    // TODO: 代表エラー3種のUIハンドリング案をコメントに書く
    // Network: 再読み込みボタン。再試行でも改善しなければステータスページや回線確認の案内
    // Http: 401 -> 再ログイン/ログイン画面リダイレクト
    //       403 -> 閲覧できませんの案内表示
    //       404 -> ページが存在しませんの表示
    //       5xx系 -> ページが読み込めません。しばらく経ってからもう一度試してくださいの表示
    // Parse: システムに不具合が発生しましたの画面 or 入力形式が不正ですの画面
    ok: false;
    error: HttpError;
};
// TODO: Result<T, E=HttpError> の形に拡張する余地メモ（今日はTのみで進める）

/* 疑似実装
    const http =  createHttpClient('baseUrl');
    const response = await http.get<User>(`/api/users/xx`);
    if(response.ok) {
        response.valueをUIに渡す
    } else {
        switch(res.error.type){
            分岐: エラーコード等をJSONで渡す
        }
    };
*/
// NOTE:
// - UIまでthrowを流さず、境界でResultに畳み込む方針。
// - 呼び出し側は if (res.ok) { ... } else { switch(res.error.type) { ... } } で型安全分岐。
// - 補助: ok(value), err(error) のユーティリティは別途検討。
// - Result<T> はドメイン共通型。HTTP層やUI層に依存させない（importもしない）