import { cors } from '@elysiajs/cors';
import type { User, Video } from '@ikihaji-tube/core/model';
import { eq, inArray } from 'drizzle-orm';
import { Elysia, type TSchema, t } from 'elysia';
import { db } from '../../db/db';
import { groups, users, videos, viewingHistory } from '../../db/schema';

const groupRoutes = new Elysia({ prefix: '/groups/:groupId' })
  .get('/filter', async ({ params }) => {
    const { groupId } = params;
    const group = await db.select().from(groups).where(eq(groups.id, groupId));
    return group[0]?.prompt;
  })
  .post(
    '/filter',
    async ({ params, body }) => {
      const { groupId } = params;
      const { prompt } = body;
      await db.insert(groups).values({ id: groupId, prompt }).onConflictDoUpdate({
        target: groups.id,
        set: { prompt },
      });
      return { status: 200, body: 'Filter prompt updated.' };
    },
    {
      body: t.Object({
        prompt: t.String(),
      }),
    },
  )
  .delete('/filter', async ({ params }) => {
    const { groupId } = params;
    await db.update(groups).set({ prompt: null }).where(eq(groups.id, groupId));
    return { status: 200, body: 'Filter prompt cleared.' };
  })
  .get('/users', async ({ params }) => {
    const { groupId } = params;

    const groupUsers = await db.select().from(users).where(eq(users.groupId, groupId));
    const userIds = groupUsers.map(user => user.id);

    if (userIds.length === 0) {
      return [];
    }

    const histories = await db.select().from(viewingHistory).where(inArray(viewingHistory.userId, userIds));

    const videoIds = histories.map(h => h.videoId).filter((id): id is string => id !== null);
    if (videoIds.length === 0) {
      return userIds.map(userId => ({
        id: userId,
        viewingHistory: [],
      }));
    }

    const uniqueVideoIds = [...new Set(videoIds)];

    const videosData = await db.select().from(videos).where(inArray(videos.id, uniqueVideoIds));

    const videosMap = new Map(videosData.map(v => [v.id, v]));

    const userHistories = new Map<string, Video[]>();

    for (const history of histories) {
      if (history.userId && history.videoId) {
        const video = videosMap.get(history.videoId);
        if (video) {
          if (!userHistories.has(history.userId)) {
            userHistories.set(history.userId, []);
          }
          userHistories.get(history.userId)!.push(video);
        }
      }
    }

    const resultUsers: User[] = userIds.map(userId => ({
      id: userId,
      viewingHistory: userHistories.get(userId) || [],
    }));

    return resultUsers;
  })
  .post(
    '/users/:userId/viewing-history',
    async ({ body, params }) => {
      const { groupId, userId } = params;

      // biome-ignore lint/suspicious/noConsoleLog:
      console.log(`[POST /viewing-history] groupId: ${groupId}, userId: ${userId}, body:`, body);

      await db.insert(groups).values({ id: groupId }).onConflictDoNothing();

      await db.insert(users).values({ id: userId, groupId }).onConflictDoNothing();

      if (body.length === 0) {
        return { status: 200, body: 'No new videos to add.' };
      }

      await db.insert(videos).values(body).onConflictDoNothing();

      const historyEntries = body.map(video => ({
        userId,
        videoId: video.id,
      }));
      // await db.insert(viewingHistory).values(historyEntries);
      await db
        .insert(viewingHistory)
        .values(historyEntries)
        .onConflictDoNothing({
          target: [viewingHistory.userId, viewingHistory.videoId],
        });

      return { status: 201, body: 'Viewing history recorded.' };
    },
    {
      body: t.Array(
        t.Object({
          id: t.String(),
          title: t.String(),
          thumbnailUrl: t.String({ format: 'uri' }),
        } satisfies Record<keyof Video, TSchema>),
      ),
    },
  );

export const app = new Elysia({
  prefix: '/api',
})
  .use(
    cors({
      origin: '*',
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .get(
    '/',
    () =>
      'IkihajiTube Client プライバシーポリシー\n\n最終更新日: 2025年11月3日\n\n本プライバシーポリシーは、Chrome拡張機能「IkihajiTube Client」がユーザーデータをどのように収集、利用、共有するかを説明するものです。本拡張機能は、ユーザーのプライバシーとデータセキュリティを最優先事項として取り扱います。\n\n---\n1. 収集する情報とその利用目的\n\n本拡張機能は、その主要な機能である「YouTube視聴履歴の送信」を果たすため、以下の必要最小限のユーザーデータを収集し、利用します。\n\n収集するデータは、**ウェブ履歴（YouTube動画のタイトル、URL、視聴完了日時などの視聴に関連する情報）**、**認証情報（IkihajiTubeサービスとの連携に必要なOAuth認証トークン）**、YouTubeページ上での**動画視聴完了の検知に必要なユーザーアクティビティ**、および**ウェブサイトコンテンツ（動画のタイトルやURL）**に限られます。\n\nこれらのデータの唯一の利用目的は、ユーザーが認証した外部サービス**「IkihajiTube」のAPIエンドポイントへ視聴履歴データを安全に送信し、ユーザーアカウントの認証と連携を維持すること**にあります。\n\n---\n2. データの共有\n\n収集したデータは、拡張機能の単一の目的を達成するため、ユーザーが認証した**IkihajiTubeのAPIエンドポイント**に対してのみ送信・共有されます。この送信は、サービス提供の基幹機能であり、これ以外の目的でユーザーデータを第三者へ販売、賃貸、または不当に開示することは一切ありません。\n\n---\n3. データセキュリティ\n\n認証情報および設定情報は、ChromeのストレージAPIを通じてユーザーのブラウザ内に安全に保管されます。外部API（IkihajiTube API）との通信は、すべて業界標準の**HTTPS/SSL暗号化通信**を用いて行われ、データの安全な取り扱いを保証します。\n\n---\n4. 連絡先情報\n\n本プライバシーポリシーまたはデータ処理に関してご質問がある場合は、以下の連絡先までお問い合わせください。\n\nメールアドレス: [bmi921gm@gmail.com]',
  )
  .use(groupRoutes)
  .listen(process.env['PORT'] || 4000);

// biome-ignore lint/suspicious/noConsoleLog: This log is necessary to verify that the server is running properly.
console.log(`📺 IkihajiTube API is running at ${app.server?.hostname}:${app.server?.port}`);
