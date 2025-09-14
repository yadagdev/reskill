export type User = {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    // updatedAt: string;
}
// createdAtはISO文字列／UI表示でDateに変換／書き換えない
// TODO: updatedAt(ISO文字列) を採用する場合: Userに追加。サーバーのupdated_atをサービス層でマッピング
// TODO: サーバー契約が変わってもUserのプロパティは最小限で安定させる（表示とテストの安定性のため）。
// TODO: createdAtはUI表示時にDateへ変換する(toLocalStringなど)。保持はstringのままにする。
// TODO: サーバーのkey名が異なる場合(ex: created_at) -> 受信後にマッピングするのはサービス層。
// TODO: Userは読み取り専用。更新系は専用のDTOを用意し、User自体は不変扱い。