export function joinUrl(baseUrl: string, url: string): string {
    //TODO: baseUrl の末尾の "/" を 1 個だけに正規化（末尾の "/" を削る）
    //TODO: urlの先頭に"/"を付与（無ければ） ※ "//" にならないように
    //TODO: 例: baseUrl "https://api.example.com/" + "users" -> "https://api.example.com/users"
    //TODO: クエリや # は url 側に含める前提。ここでは「結合」だけを担当（テスト用語の“結合テスト”の意ではない）
    return {} as unknown as string; //ビルドを通すための仮置き
}
// TEST: 末尾/先頭スラッシュの全組合せを網羅する（表で考える）