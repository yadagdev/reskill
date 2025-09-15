# Q&A: HTTP Foundation

## Q1. Low-level HTTP とは？

### Model Answer 1 (30–90s)

低レベルHTTPは通信の下回りです。URL結合、ヘッダ付与、status/ok判定、Content-Type確認、JSONパース、そして例外を`Result`に正規化する、といった処理を指します。これらはHttpClientに閉じ込め、上位は“水道の蛇口”のように安心して使えるようにします。

### Key Points 1

- 配管/電気配線＝低レベル、蛇口＝UIの比喩
- HttpClientに集約して再利用・一貫性
- 上位はビジネス手順に集中

### Follow-ups 1 (深掘り例)

- fetch と axios の扱い差をどこで吸収する？
- Content-Length: 0 と chunked の違いで実装は変わる？
- CORS 失敗は Network/Http/Parse のどれ？

## Q2. Orchestration（オーケストレーション）とは？

### Model Answer 2

目的達成のための手順を正しい順序で“指揮”することです。フロントではサービス層が担当し、入力最終バリデ→API呼び出し→マッピング→`Result`返却、という流れを組み立てます。Kubernetesでも「望ましい状態へ複数要素を自動調整」する指揮という意味で使われます。

### Key Points 2

- 指揮者の比喩
- サービス層＝手順の組み立て
- K8sでも同語感（文脈は違う）

### Follow-ups 2 (深掘り例)

- 失敗時の巻き戻し（UI 状態・トースト・フォーム）をどの層で？
- 並列化と直列化をどう切り替える？
- K8s のオーケストレーションとの共通点/相違点を1分で。

## Q3. 今回のユースケース例は？

### Model Answer 3

「ユーザー登録」と「ユーザー詳細取得」です。登録は、入力最終バリデ→CreateUserDto整形→POST→サーバJSONをUserへマッピング→`Result`返却。詳細取得は、IDチェック→GET→マッピング→`Result`返却です。

### Key Points 3

- 目的単位の一連の手順
- 入力→呼び出し→変換→返却
- UIは`Result`で分岐

### Follow-ups 3 (深掘り例)

- 「登録→即ログイン」の一連をどの層で組む？
- 冪等性が必要なユースケースの例は？
- 途中失敗時に UI へどの粒度で情報を返す？

## Q4. DTO と UI Model を分ける理由は？

### Model Answer 4

入力（Request）と出力（UI表示）で責務が異なるからです。`password`の混入防止、変更影響の局所化、テスト容易性のために分けます。必要なら`UserResponse`→`User`へサービス層でマッピングします。

### Key Points 4

- セキュリティ（password混入防止）
- 変更影響の局所化
- テスト容易性

### Follow-ups 4 (深掘り例)

- 機密情報が UI Model に紛れた場合の事故例は？
- モデルのバージョニングはどう運用する？
- フォームの双方向バインドに DTO を使わない理由は？

## Q5. Mapping とは？どこで行う？

### Model Answer 5

サーバの生JSONをUIで使いやすい形へ変換することです（例: `created_at`→`createdAt`）。場所はサービス層で、専用のprivate関数にまとめると保守しやすいです。

### Key Points 5

- snake_case→camelCase
- サービス層で一箇所に集約
- private関数で見通しUP

### Follow-ups 5 (深掘り例)

- マッピング関数のテスト戦略（境界値/欠損キー）
- Zod 等でのスキーマ検証とマッピングの順序
- 小さなprivate ヘルパに分割する基準

## Q6. 例外を`Result`に“畳む”とは？

### Model Answer 6

`throw`をUIまで流さず、HttpClient/サービス層で`{ ok:false, error }`の形に**正規化**して返すことです。UIは例外処理ではなく`error.type`で分岐でき、分かりやすく安全です。

### Key Points 6

- 例外→データ化
- UIは型分岐で処理
- 一貫したエラーハンドリング

### Follow-ups 6 (深掘り例)

- 畳まない場合のUI 側の負債は？
- Result<T, E> の E を差し替える設計例
- ログ送出はどの層が責任を持つ？

## Q7. Network と 5xx の違い（UI文言観点）

### Model Answer 7

Networkはオフライン/名前解決/タイムアウト等、通信経路の問題。UIは接続確認/再試行を促します。5xxはサーバ障害で、時間を置いて再試行やステータスページ案内を出します。文言を分けるのが重要です。

### Key Points 7

- 経路の問題 vs サーバ障害
- 文言・導線が異なる
- `error.type`で分けやすい

### Follow-ups 7 (深掘り例)

- 再試行はどちらに適用？回数/間隔は？
- 5xx の機能停止スイッチ（メンテナンス表示）は？
- オフライン時のローカルキャッシュ表示はやる？

## Q8. 204 No Content の扱いは？

### Model Answer 8

本文のない成功なのでJSONを読もうとしません。`value`は`undefined`として返し、UIでは「成功だがデータなし」として扱います。

### Key Points 8

- JSONパースをしない
- `ok:true, value: undefined`
- UIは“データなし”表示

### Follow-ups 8 (深掘り例)

- 204 でもヘッダは見る？（ETag など）
- 204 と 202 Accepted の違いを UI はどう表現？
- HEAD レスポンスの扱いは？

## Q9. `extractErrorMessage` を切り出す利点は？

### Model Answer 9

エラーメッセージの決定を一箇所に集約でき、重複をなくし一貫性が保てます。単体テストも容易で、サーバのフォーマット変更時もここだけ直せば全体が追随します。

### Key Points 9

- 一貫性と重複排除
- 単体テスト容易
- 変更点の局所化

### Follow-ups 9 (深掘り例)

- サーバごとにフォーマット差がある場合の拡張（プラガブル化）
- i18n キーへのマッピング戦略
- 「ユーザー向け／開発者向け」二層の文言分離

## Q10. Authorization を呼び出し側で渡すB案のトレードオフは？

### Model Answer 10

シンプルで依存が薄い反面、ヘッダ付け忘れリスクがあります。逆に自動付与は便利ですが、HttpClientに認証取得の依存が入りがち。今回は“まず動く・分かりやすい”を優先してB案にしています。

### Key Points 10

- B案：単純だが付け忘れ注意
- 自動付与：便利だが依存が太る
- 今回はB案でスタート

### Follow-ups 10 (深掘り例)

- 付け忘れを型で防ぐ（例：AuthorizedHttpClient）には？
- 自動付与案の token refresh をどこでやる？
- 監査ログの設計（誰がいつ何を叩いたか）
