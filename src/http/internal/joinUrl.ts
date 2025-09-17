//  NOTE: 末尾/先頭スラッシュを正規化して結合するユーティリティ機能
//  仕様:
//    - baseUrlの末尾の"/"を除去
//    - urlが空なら base をそのまま返す
//    - "//"を作らないようにする
//    - クエリや # はurl側に含める前提（ここでは結合責務のみ）
export function joinUrl(baseUrl: string, url: string): string {
    // baseUrl の末尾の "/" を 1 個だけに正規化（末尾の "/" を削る）
    const base = baseUrl.replace(/\/+$/, '');
    // urlが空の時はbaseをそのまま返す
    if (!url) return base;

    // urlの先頭に / が入っていればurlをそのままpathに代入し、そうでなければ先頭に / を入れてpathを作る
    const path = url.startsWith('/') ? url : `/${url}`;

    // base + path で通信先のエンドポイントを作成
    return `${base}${path}`;
}
// TEST: 末尾/先頭スラッシュの全組合せを網羅する（表で考える）
