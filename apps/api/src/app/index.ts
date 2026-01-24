import { cors } from '@elysiajs/cors';
import type { User, Video } from '@ikihaji-tube/core/model';
import { and, eq, inArray } from 'drizzle-orm';
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
  )
  .delete(
    '/viewing-history',
    async ({ params, body }) => {
      const { groupId } = params;
      const { videoId, userIds } = body;

      // check if userIds are empty
      if (userIds.length === 0) {
        return { status: 400, body: 'userIds cannot be empty.' };
      }

      // TODO: check if users belong to the group (security improvement)

      await db
        .delete(viewingHistory)
        .where(and(eq(viewingHistory.videoId, videoId), inArray(viewingHistory.userId, userIds)));

      // biome-ignore lint/suspicious/noConsoleLog:
      console.log(`[DELETE /viewing-history] groupId: ${groupId}, videoId: ${videoId}, userIds: ${userIds}`);

      return { status: 200, body: 'Viewing history deleted.' };
    },
    {
      body: t.Object({
        videoId: t.String(),
        userIds: t.Array(t.String()),
      }),
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
  .use(groupRoutes)

  .listen(process.env['PORT'] || 4000);

// biome-ignore lint/suspicious/noConsoleLog: This log is necessary to verify that the server is running properly.
console.log(`📺 IkihajiTube API is running at ${app.server?.hostname}:${app.server?.port}`);
