# Add @codex comment

GitHubのPull Requestに、拡張機能のアイコンを1回押すだけで `@codex` とコメントするChrome拡張です。

## インストール

1. このリポジトリをダウンロードする
2. Chromeで `chrome://extensions` を開く
3. 「デベロッパー モード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」から、このリポジトリのフォルダを選ぶ

## 使い方

1. GitHubのPull Requestで「Conversation」タブを開く
2. ツールバーの拡張機能アイコンを押す

`@codex` だけがPRコメントとして投稿されます。GitHubへの追加の認証やトークン設定は不要です。

## 権限

- `activeTab`: アイコンを押したGitHubのタブだけを操作するため
- `scripting`: そのタブのコメント欄へ `@codex` を投稿するため
