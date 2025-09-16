import { defineConfig } from 'vitest/config';       // Vitestの設定ヘルパを読み込み

export default defineConfig({                       // 設定オブジェクトをエクスポート（Vitestが自動で読む）
    test: {                                         // testを読む込む設定
        environment: 'node',                        // 実行環境。DOMが不要なら'node'が軽量（デフォルトはjsdom）
        include: ['src/**/*.{test,spec}.ts'],       // どのファイルをテストとして疲労のかのglob
        coverage: {                                 // カバレッジ計測の設定
            provider: 'v8',                         // v8エンジンベースのカバレッジ（速い&設定少なめ）
            reportsDirectory: './coverage',         // 出力ディレクトリ（ルートからの相対パス）
        },
    },
});