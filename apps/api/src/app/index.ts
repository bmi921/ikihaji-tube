import { cors } from '@elysiajs/cors';
import type { Group, User, Video } from '@ikihaji-tube/core/model';
import { Elysia, type TSchema, t } from 'elysia';

// Sample data for testing
export const groups: Group[] = [
  {
    id: '1428370457014566945',
    users: [
      {
        id: '1077274231693389875',
        viewingHistory: [
          {
            id: 'video_001',
            title: 'a',
            thumbnailUrl: 'https://i.ytimg.com/vi/XFkzRNyygfk/hqdefault.jpg',
          },
          {
            id: 'video_002',
            title: 'The Beatles - Let It Be (Remastered 2009)',
            thumbnailUrl: 'https://i.ytimg.com/vi/QDYfEBY9NM4/hqdefault.jpg',
          },
        ],
      },
      {
        id: '1077274231693389875',
        viewingHistory: [
          {
            id: 'video_003',
            title: 'Daft Punk - Get Lucky (Official Audio)',
            thumbnailUrl: 'https://i.ytimg.com/vi/5NV6Rdv1a3I/hqdefault.jpg',
          },
        ],
      },
    ],
  },
];

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
  .get('/groups', () => {
    // biome-ignore lint/suspicious/noConsoleLog:
    console.log('[/groups]', groups);

    return groups;
  })
  .get('/groups/:groupId', ({ params }) => {
    const groupId = params.groupId;
    // biome-ignore lint/suspicious/noConsoleLog:
    console.log('[/groups/:groupId]', groupId);

    const group = groups.find(g => g.id === groupId);
    if (!group) {
      return null;
    }

    // biome-ignore lint/suspicious/noConsoleLog:
    console.log('[/groups/:groupId]', group);

    return group;
  })
  .get('/groups/:groupId/users', ({ params }) => {
    const group = groups.find(g => g.id === params.groupId);
    return group ? group.users : null;
  })
  .get('/groups/:groupId/users/:userId', ({ params }) => {
    const group = groups.find(g => g.id === params.groupId);
    const user = group?.users.find(u => u.id === params.userId);
    return user || null;
  })
  .post(
    '/groups/:groupId/users/:userId/viewing-history',
    ({ body, params }) => {
      // biome-ignore lint/suspicious/noConsoleLog:
      console.log(
        `[POST /viewing-history] groupId: ${params.groupId}, userId: ${params.userId}, body:`, body
      );

      let group = groups.find(g => g.id === params.groupId);
      if (!group) {
        // Create a new group if it doesn't exist
        const newGroup: Group = {
          id: params.groupId,
          users: [],
        };
        groups.push(newGroup);
        group = newGroup;
      }

      let user = group.users.find(u => u.id === params.userId);

      if (!user) {
        const newUser: User = {
          id: params.userId,
          viewingHistory: body,
        };
        group.users.push(newUser);

        return { status: 201, body: newUser.viewingHistory };
      }

      user.viewingHistory.push(...body);

      return { status: 200, body: user.viewingHistory };
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