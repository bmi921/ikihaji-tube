# ikihaji-tube

## 概要

ikihaji-tubeは、YouTubeの視聴履歴を友達と共有し、会話のきっかけを作るためのDiscordボットです。Chrome拡張機能で視聴履歴を収集し、Discordボットがそれをサーバーのメンバーに共有します。

## ✨ 特徴

- **視聴履歴の自動収集**: Chrome拡張機能がバックグラウンドでYouTubeの視聴履歴を自動的に収集します。
- **Discordでの視聴履歴共有**: Discordボットが、サーバー内で視聴された動画をランダムに、または複数人が視聴した動画を要約して共有します。
- **簡単なセットアップ**: Dockerを利用して、開発環境を簡単に構築できます。
- **モノレポ構成**: Turborepoを利用したモノレポ構成で、複数のアプリケーション（API、Discordボット、Chrome拡張）を効率的に管理します。

## 🛠️ 技術スタック

プロジェクト全体でTypeScriptに統一されており、Bunをランタイムとして使用しています。

| カテゴリ         | 技術                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| **ランタイム**   | [Bun](https://bun.sh/)                                                                           |
| **モノレポ管理** | [Turborepo](https://turbo.build/repo)                                                            |
| **パッケージ管理** | [Bun](https://bun.sh/)                                                                           |
| **Linter/Formatter** | [Biome](https://biomejs.dev/)                                                                    |
| **API**          | [ElysiaJS](https://elysiajs.com/)                                                                |
| **Discord Bot**  | [discord.js](https://discord.js.org/)                                                            |
| **データベース** | [PostgreSQL](https://www.postgresql.org/)                                                        |
| **ORM**          | [Drizzle ORM](https://orm.drizzle.team/)                                                         |
| **フロントエンド** | [TypeScript](https://www.typescriptlang.org/) (Chrome Extension)                                 |
| **コンテナ**     | [Docker](https://www.docker.com/)                                                                |

## 📁 ディレクトリ構造

```
.
├── apps
│   ├── api # バックエンドAPI (ElysiaJS)
│   │   ├── db # Drizzle ORMのスキーマとマイグレーション
│   │   └── src # APIのソースコード
│   ├── discord-bot # Discordボット (discord.js)
│   │   └── src
│   │       ├── command # Discordボットのスラッシュコマンド
│   │       └── util # ユーティリティ関数
│   └── scrobble-chrome-extension # Chrome拡張機能
│       └── src # Chrome拡張機能のソースコード (Background, Content, Popup)
├── packages
│   ├── core # アプリケーション間で共有されるコアロジック・型定義
│   │   ├── model # データモデル (User, Videoなど)
│   │   └── util # ユーティリティ関数
│   └── tsconfig # 共有のTypeScript設定
├── docker # Docker関連ファイル
│   ├── api # API用のDockerfile
│   ├── discord-bot # Discordボット用のDockerfile
│   └── docker-compose.development.yaml # 開発環境用のDocker Composeファイル
├── .env.example # 環境変数のサンプルファイル
├── bun.lockb # Bunのロックファイル
├── package.json # プロジェクトルートのpackage.json
└── turbo.json # Turborepoの設定ファイル
```

## 🚀 使い方

### 1. 前提条件

- [Bun](https://bun.sh/docs/installation)
- [Docker](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/)

### 2. インストール

1.  リポジトリをクローンします。
    ```bash
    git clone https://github.com/ikihaji/ikihaji-tube.git
    cd ikihaji-tube
    ```

2.  依存関係をインストールします。
    ```bash
    bun install
    ```

### 3. 設定

1.  `.env.example` をコピーして `.env` ファイルを作成します。
    ```bash
    cp .env.example .env
    ```

2.  `.env` ファイルを編集して、DiscordボットのトークンとサーバーIDを設定します。
    ```
    # .env
    DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
    DISCORD_GUILD_ID=YOUR_DISCORD_SERVER_ID
    ```
    - `DISCORD_BOT_TOKEN`: [Discord Developer Portal](https://discord.com/developers/applications) で作成したBotのトークン。
    - `DISCORD_GUILD_ID`: 開発者モードを有効にしたDiscordで、サーバー名を右クリックして「サーバーIDをコピー」で取得したID。

### 4. アプリケーションの実行

1.  Dockerコンテナを起動します。
    ```bash
    docker-compose -f ./docker/docker-compose.development.yaml up -d
    ```

2.  開発サーバーを起動します。
    ```bash
    bun run dev
    ```

### 5. Chrome拡張機能のインストール

1.  Chromeで `chrome://extensions` を開きます。
2.  「デベロッパーモード」を有効にします。
3.  「パッケージ化されていない拡張機能を読み込む」をクリックします。
4.  `apps/scrobble-chrome-extension/dist` ディレクトリを選択します。

これで、YouTubeを視聴すると、視聴履歴が自動的に記録され、Discordボットがサーバーで共有を開始します。

## 🤝 コントリビュート

IssueやPull Requestはいつでも歓迎します。

## 📜 ライセンス

このプロジェクトは [MIT License](./LICENSE.md) の下で公開されています。