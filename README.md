# IkihajiTube 📺

[![LICENSE](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)

IkihajiTube は、YouTube の視聴履歴（生き恥）を友達と共有し、友情を深める discord bot です。

- 複数人が視聴した動画を共有する
- 誰かが視聴した動画をランダムに共有する

機能を好きなサーバーで定期実行できます。

<img width="951" height="538" alt="スクリーンショット 2026-01-24 21 17 50" src="https://github.com/user-attachments/assets/83c1786e-68e0-4f45-ba1a-7ba91a00ed4e" />

## ☘️ 使い方

[拡張機能](https://chromewebstore.google.com/detail/ikihajitube-client/lgonkdolpefidckilfbpdgpkfilkbhie)をダウンロード後、拡張機能を開いて、discordにログインをしてください。

次に、discord botをサーバーに招待する必要があります。そして招待したサーバーを拡張機能から選択します。

[URL](https://discord.com/oauth2/authorize?client_id=1428369369699713108)より、使いたいdiscordサーバーにIkihajiTube botを招待します。

その後、/registerコマンドを使いたいチャンネルで実行することで定期的に視聴履歴が共有されます。なお、新しくbot用のチャンネルを作成することをお勧めします。

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

環境変数が書いてある`.env`ファイルは[開発者](https://github.com/bmi921)から受け取ってください。

### 4. アプリケーションの実行

[]Docker コンテナ（データベース）を起動し、開発サーバーを起動します。

```bash
# 開発サーバーを起動 (API, Discord Bot, build Chrome Extension)
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

# プライバシーポリシー

最終更新日: 2025年11月3日

本プライバシーポリシーは、Chrome拡張機能「IkihajiTube Client」がユーザーデータをどのように収集、利用、共有するかを説明するものです。本拡張機能は、ユーザーのプライバシーとデータセキュリティを最優先事項として取り扱います。

1. 収集する情報とその利用目的

本拡張機能は、その主要な機能である「YouTube視聴履歴の送信」を果たすため、以下の必要最小限のユーザーデータを収集し、利用します。

収集するデータは、**ウェブ履歴（YouTube動画のタイトル、URL、視聴完了日時などの視聴に関連する情報）**、**認証情報（IkihajiTubeサービスとの連携に必要なOAuth認証トークン）**、YouTubeページ上での**動画視聴完了の検知に必要なユーザーアクティビティ**、および**ウェブサイトコンテンツ（動画のタイトルやURL）**に限られます。

これらのデータの唯一の利用目的は、ユーザーが認証した外部サービス**「IkihajiTube」のAPIエンドポイントへ視聴履歴データを安全に送信し、ユーザーアカウントの認証と連携を維持すること**にあります。

2. データの共有

収集したデータは、拡張機能の単一の目的を達成するため、ユーザーが認証した**IkihajiTubeのAPIエンドポイント**に対してのみ送信・共有されます。この送信は、サービス提供の基幹機能であり、これ以外の目的でユーザーデータを第三者へ販売、賃貸、または不当に開示することは一切ありません。

3. データセキュリティ

認証情報および設定情報は、ChromeのストレージAPIを通じてユーザーのブラウザ内に安全に保管されます。外部API（IkihajiTube API）との通信は、すべて業界標準の**HTTPS/SSL暗号化通信**を用いて行われ、データの安全な取り扱いを保証します。

4. 連絡先情報

本プライバシーポリシーまたはデータ処理に関してご質問がある場合は、以下の連絡先までお問い合わせください。

メールアドレス: bmi921gm@gmail.com
