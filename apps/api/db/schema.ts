import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const groups = pgTable('groups', {
  id: text('id').primaryKey(),
  prompt: text('prompt'),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => groups.id, { onDelete: 'cascade' }),
});

export const videos = pgTable('videos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
});

export const viewingHistory = pgTable('viewing_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  videoId: text('video_id').references(() => videos.id, { onDelete: 'cascade' }),
});
