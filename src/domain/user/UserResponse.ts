// サーバーから来る生のJSONの最小形(契約メモ)
// NOTE: ここはサービスのメモ用途。必要に応じて拡張
export type UserResponse = {
    id: string;
    email: string;
    name: string;
    created_at: string; // ISO
    updated_at?: string; // ISO(optional: 任意)
};