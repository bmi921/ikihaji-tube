import { cors } from '@elysiajs/cors';
import type { User, Video } from '@ikihaji-tube/core/model';
import { eq, inArray } from 'drizzle-orm';
import { Elysia, type TSchema, t } from 'elysia';
import { db } from '../../db/db';
import { groups, users, videos, viewingHistory } from '../../db/schema';

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
    '/groups/:groupId/users/:userId/viewing-history',
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
  .listen(process.env['PORT'] || 4000);

// biome-ignore lint/suspicious/noConsoleLog: This log is necessary to verify that the server is running properly.
console.log(`📺 IkihajiTube API is running at ${app.server?.hostname}:${app.server?.port}`);
