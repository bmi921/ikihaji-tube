import { pgTable, serial, text } from 'drizzle-orm/pg-core';

// === groups table ===
export const groups = pgTable('groups', {
  id: text('id').primaryKey(),
});

// === users table ===
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => groups.id, { onDelete: 'cascade' }),
});

// === videos table ===
export const videos = pgTable('videos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
});

// === viewing_history table ===
export const viewingHistory = pgTable('viewing_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  videoId: text('video_id').references(() => videos.id, { onDelete: 'cascade' }),
});
