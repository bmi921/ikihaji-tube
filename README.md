# IkihajiTube 📺

[![LICENSE](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)

IkihajiTube は、YouTube の視聴履歴（生き恥）を友達と共有し、友情を深める discord bot です。
- 複数人が視聴した動画を共有する
- 誰かが視聴した動画をランダムに共有する

機能を好きなサーバーで定期実行できます。


![thumbnail-ikihajitube](https://github.com/user-attachments/assets/d80ae3db-79e2-4be0-a246-2d95371c317e)




## ☘️ 使い方
[最新リリース](https://github.com/bmi921/ikihaji-tube/releases/tag/v0.1.0)からchrome拡張機能である`scrobble-chrome-extension.crx`をダウンロードしてください。そのあと、
[chrome拡張機能管理画面](chrome://extensions)の画面に`scrobble-chrome-extension.crx`ファイルをドラッグ&ドロップしてください。インストールできたら、拡張機能を起動します。ポップアップが表示されたら、`userId`, `groupId`を画面から入力してください。

- `userId`はdiscordのユーザーIDです。ユーザーIDは、discord上のアイコンをクリックし、「ユーザーIDをコピー」を押すことでクリップボードにコピーできます。
- `groupId`は、ikihaji-tubeのディスコードボットを使用したいサーバーに招待し、`/groupid`コマンドを叩くことで確認できます。discordのギルドIDでと同じです。

`/register`コマンドでは、一日一回、定期実行させることができます。使用したいチャンネルでコマンドを使用してください。

## ✨ 特徴

- **視聴履歴の自動収集**: Chrome 拡張機能がバックグラウンドで YouTube の視聴履歴を自動的に収集します。
- **Discord での視聴履歴共有**: Discord ボットが、サーバー内で視聴された動画をランダムに、または複数人が視聴した動画を要約して共有します。
- **簡単なセットアップ**: Docker を利用して、開発環境を簡単に構築できます。
- **モノレポ構成**: Turborepo を利用したモノレポ構成で、複数のアプリケーション（API、Discord ボット、Chrome 拡張）を効率的に管理します。

## 🛠️ 技術スタック

| カテゴリ           | 技術                                                             |
| ------------------ | ---------------------------------------------------------------- |
| **ランタイム**     | [Bun](https://bun.sh/)                                           |
| **モノレポ管理**   | [Turborepo](https://turbo.build/repo)                            |
| **API**            | [ElysiaJS](https://elysiajs.com/)                                |
| **Discord Bot**    | [discord.js](https://discord.js.org/)                            |
| **データベース**   | [PostgreSQL](https://www.postgresql.org/)                        |
| **ORM**            | [Drizzle ORM](https://orm.drizzle.team/)                         |
| **フロントエンド** | [TypeScript](https://www.typescriptlang.org/) (Chrome Extension) |
| **コンテナ**       | [Docker](https://www.docker.com/)                                |

## 🚀 開発環境構築

### 1. ツール

- [Bun](https://bun.sh/docs/installation)
- [Docker](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/)

### 2. インストール

リポジトリをクローンし、依存関係をインストールします。

```bash
git clone https://github.com/ikihaji/ikihaji-tube.git
cd ikihaji-tube
bun install
```

### 3. 環境変数

`.env.example` をコピーして `.env` ファイルを作成し、中身を編集します。

```bash
cp .env.example .env
```

```env
# .env
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
DISCORD_GUILD_ID=YOUR_DISCORD_SERVER_ID
```

- `DISCORD_BOT_TOKEN`: [Discord Developer Portal](https://discord.com/developers/applications) で作成した Bot のトークン。
- `DISCORD_GUILD_ID`: 開発者モードを有効にした Discord で、ボットを導入するサーバー名を右クリックして「サーバー ID をコピー」で取得した ID。

### 4. アプリケーションの実行

Docker コンテナ（データベース）を起動し、開発サーバーを起動します。

```bash
# データベースを起動
docker-compose -f ./docker/docker-compose.development.yaml up -d

# 開発サーバーを起動 (API, Discord Bot)
bun turbo run dev
```

### 5. Chrome 拡張機能のインストール

1.  Chrome で `chrome://extensions` を開きます。
2.  右上の「デベロッパーモード」を有効にします。
3.  「パッケージ化されていない拡張機能を読み込む」をクリックします。
4.  このリポジトリ内の `apps/scrobble-chrome-extension` ディレクトリを選択します。

これでセットアップは完了です。YouTube を視聴すると、視聴履歴が自動的に記録され、Discord ボットがサーバーで共有を開始します。

## 📁 ディレクトリ構造

- `apps/api`: バックエンド API (ElysiaJS)
- `apps/discord-bot`: Discord ボット (discord.js)
- `apps/scrobble-chrome-extension`: Chrome 拡張機能
- `packages/core`: アプリケーション間で共有されるコアロジック・型定義
- `packages/tsconfig`: 共有の TypeScript 設定

## 📒 リリースノート
- v0.1.0 2025/10/19 初期リリース 
