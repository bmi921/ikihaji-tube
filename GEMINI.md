# ikihaji-tube

**概要**

## このプロジェクトは、YouTube の視聴履歴を友人と共有して会話のきっかけを作る Discord ボットです。主な特徴は以下のとおりです。

## 技術スタック

- フロント（Chrome Extension）: TypeScript
- サーバ: Bun + Elysia (TypeScript)
- ランタイム / パッケージ: Bun
- モノレポ管理: Turborepo
- Linter/Formatter/Tooling: Biome
- DB: 任意（例: PostgreSQL / SQLite / Supabase）
- Discord API: discord.js
- CI / デプロイ: Cloudflare, Fly.io, Vercel 等（選択可能）

---

## アーキテクチャ概要

1. ユーザーが Chrome 拡張をインストール
2. 拡張が YouTube の視聴履歴を取得
3. 拡張は取得した視聴履歴をサーバーの API へ送信（HTTP POST）
4. サーバーは、DB に保存
5. サーバー内の cron ジョブが定期的に実行され、視聴履歴を定期的に discor bot として送信
