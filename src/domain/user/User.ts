export type User = {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt?: string;
}
// createdAtはISO文字列／UI表示でDateに変換／書き換えない
// TODO: updatedAt(ISO文字列) を採用する場合: Userに追加。サーバーのupdated_atをサービス層でマッピング
// TODO: サーバー契約が変わってもUserのプロパティは最小限で安定させる（表示とテストの安定性のため）。
// TODO: createdAtはUI表示時にDateへ変換する(toLocaleStringなど)。保持はstringのままにする。
// TODO: サーバーのkey名が異なる場合(ex: created_at) -> 受信後にマッピングするのはサービス層。
//       例: { created_at: "2024-01-02T03:04:05Z" } -> { createdAt: "2024-01-02T03:04:05Z" }
// TODO: Userは読み取り専用。更新系は専用のDTOを用意し、User自体は不変扱い。
// TODO: UserResponse(サーバの生JSON) -> User(フロント用) の変換はサービス層で実施（snake_case→camelCase）
// TODO: updatedAt を採用する場合は string(ISO)。サーバの updated_at をサービス層で mapped
// TODO: idは安定識別子（主キー）。UIのキー/キャッシュ/比較はid基準で行う
// TODO: UserResponse(例: {id,email,name,created_at,updated_at?}) -> User({createdAt,(updatedAt)}) の写像をここに例示