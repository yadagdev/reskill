# Q&A: HTTP Foundation

## Q1. Low-level HTTP とは？

### Model Answer 1 (30–90s)

低レベルHTTPは通信の下回りです。URL結合、ヘッダ付与、status/ok判定、Content-Type確認、JSONパース、そして例外を`Result`に正規化する、といった処理を指します。これらはHttpClientに閉じ込め、上位は“水道の蛇口”のように安心して使えるようにします。

### Key Points 1

- 配管/電気配線＝低レベル、蛇口＝UIの比喩
- HttpClientに集約して再利用・一貫性
- 上位はビジネス手順に集中

## Q2. Orchestration（オーケストレーション）とは？

### Model Answer 2

目的達成のための手順を正しい順序で“指揮”することです。フロントではサービス層が担当し、入力最終バリデ→API呼び出し→マッピング→`Result`返却、という流れを組み立てます。Kubernetesでも「望ましい状態へ複数要素を自動調整」する指揮という意味で使われます。

### Key Points 2

- 指揮者の比喩
- サービス層＝手順の組み立て
- K8sでも同語感（文脈は違う）

## Q3. 今回のユースケース例は？

### Model Answer 3

「ユーザー登録」と「ユーザー詳細取得」です。登録は、入力最終バリデ→CreateUserDto整形→POST→サーバJSONをUserへマッピング→`Result`返却。詳細取得は、IDチェック→GET→マッピング→`Result`返却です。

### Key Points 3

- 目的単位の一連の手順
- 入力→呼び出し→変換→返却
- UIは`Result`で分岐

## Q4. DTO と UI Model を分ける理由は？

### Model Answer 4

入力（Request）と出力（UI表示）で責務が異なるからです。`password`の混入防止、変更影響の局所化、テスト容易性のために分けます。必要なら`UserResponse`→`User`へサービス層でマッピングします。

### Key Points 4

- セキュリティ（password混入防止）
- 変更影響の局所化
- テスト容易性

## Q5. Mapping とは？どこで行う？

### Model Answer 5

サーバの生JSONをUIで使いやすい形へ変換することです（例: `created_at`→`createdAt`）。場所はサービス層で、専用のprivate関数にまとめると保守しやすいです。

### Key Points 5

- snake_case→camelCase
- サービス層で一箇所に集約
- private関数で見通しUP

## Q6. 例外を`Result`に“畳む”とは？

### Model Answer 6

`throw`をUIまで流さず、HttpClient/サービス層で`{ ok:false, error }`の形に**正規化**して返すことです。UIは例外処理ではなく`error.type`で分岐でき、分かりやすく安全です。

### Key Points 6

- 例外→データ化
- UIは型分岐で処理
- 一貫したエラーハンドリング

## Q7. Network と 5xx の違い（UI文言観点）

### Model Answer 7

Networkはオフライン/名前解決/タイムアウト等、通信経路の問題。UIは接続確認/再試行を促します。5xxはサーバ障害で、時間を置いて再試行やステータスページ案内を出します。文言を分けるのが重要です。

### Key Points 7

- 経路の問題 vs サーバ障害
- 文言・導線が異なる
- `error.type`で分けやすい

## Q8. 204 No Content の扱いは？

### Model Answer 8

本文のない成功なのでJSONを読もうとしません。`value`は`undefined`として返し、UIでは「成功だがデータなし」として扱います。

### Key Points 8

- JSONパースをしない
- `ok:true, value: undefined`
- UIは“データなし”表示

## Q9. `extractErrorMessage` を切り出す利点は？

### Model Answer 9

エラーメッセージの決定を一箇所に集約でき、重複をなくし一貫性が保てます。単体テストも容易で、サーバのフォーマット変更時もここだけ直せば全体が追随します。

### Key Points 9

- 一貫性と重複排除
- 単体テスト容易
- 変更点の局所化

## Q10. Authorization を呼び出し側で渡すB案のトレードオフは？

### Model Answer 10

シンプルで依存が薄い反面、ヘッダ付け忘れリスクがあります。逆に自動付与は便利ですが、HttpClientに認証取得の依存が入りがち。今回は“まず動く・分かりやすい”を優先してB案にしています。

### Key Points 10

- B案：単純だが付け忘れ注意
- 自動付与：便利だが依存が太る
- 今回はB案でスタート

## Q11. Optional `?` の意味は？

### Model Answer 11

その引数やプロパティが任意であることです。未指定でもコンパイルエラーになりません。例：`init?: RequestInit`。

### Key Points 11

- 任意指定
- コンパイル時に必須ではない
- 呼び出しの柔軟性

## Q12. AbortController は何に使う？

### Model Answer 12

リクエストの中断/タイムアウトに使います。`controller.abort()` で`fetch`をキャンセルでき、ユーザーキャンセルや一定時間での切断に役立ちます（実装は将来対応）。

### Key Points 12

- 中断/タイムアウト
- ユーザーキャンセル反映
- 将来の拡張点
