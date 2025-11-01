import { cors } from '@elysiajs/cors';
import type { User, Video } from '@ikihaji-tube/core/model';
import { eq, inArray } from 'drizzle-orm';
import { Elysia, type TSchema, t } from 'elysia';
import { db } from '../../db/db';
import { groups, users, videos, viewingHistory, webhooks } from '../../db/schema';

export const app = new Elysia({
  prefix: '/api',
})
  .use(
    cors({
      origin: '*',
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .get('/', () => 'Hello, world!')
  .get('/groups/:groupId/users', async ({ params }) => {
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
    '/groups/:groupId/webhook',
    async ({ body, params }) => {
      const { groupId } = params;
      const { url } = body;

      await db.insert(webhooks).values({ groupId, url }).onConflictDoUpdate({
        target: webhooks.groupId,
        set: { url },
      });

      return { status: 200, body: 'Webhook registered.' };
    },
    {
      body: t.Object({
        url: t.String(),
      }),
    },
  )
  .post(
    '/groups/:groupId/users/:userId/viewing-history',
    async ({ body, params }) => {
      const { groupId, userId } = params;

      // biome-ignore lint/suspicious/noConsoleLog:
      console.log(`[POST /viewing-history] groupId: ${groupId}, userId: ${userId}, body:`, body);

      // 1. Upsert Group
      await db.insert(groups).values({ id: groupId }).onConflictDoNothing();

      // 2. Upsert User
      await db.insert(users).values({ id: userId, groupId }).onConflictDoNothing();

      if (body.length === 0) {
        return { status: 200, body: 'No new videos to add.' };
      }

      // 3. Upsert Videos
      await db.insert(videos).values(body).onConflictDoNothing();

      // 4. Insert Viewing History
      const historyEntries = body.map(video => ({
        userId,
        videoId: video.id,
      }));
      await db.insert(viewingHistory).values(historyEntries);

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
  )
  .get('/cron', async () => {
    const allWebhooks = await db.select().from(webhooks);

    for (const webhook of allWebhooks) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: '<@BMI>' }),
        });

        if (!response.ok) {
          const errorText = await response.text(); // Discordからのエラー詳細を取得
          // biome-ignore lint/suspicious/noConsoleLog:
          console.error(`Failed to send webhook to ${webhook.url}`);
          // biome-ignore lint/suspicious/noConsoleLog:
          console.error(`Discord API Error: Status ${response.status}, Details: ${errorText}`);
          return; // このWebhookはスキップして次のWebhookへ
        }
      } catch (error) {
        // biome-ignore lint/suspicious/noConsoleLog:
        console.error(`Failed to send webhook (Network Error) to ${webhook.url}`, error);
      }
    }

    return { status: 200, body: 'Cron job finished.' };
  })

  .listen(process.env['PORT'] || 4000);

// biome-ignore lint/suspicious/noConsoleLog: This log is necessary to verify that the server is running properly.
console.log(`📺 IkihajiTube API is running at ${app.server?.hostname}:${app.server?.port}`);
