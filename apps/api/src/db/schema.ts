import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Clerk ID
  name: text('name'),
  email: text('email'),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
  
});

export const stalls = sqliteTable('stalls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  qrSlug: text('qr_slug').unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
});

export const ratings = sqliteTable('ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => users.id),
  stallId: integer('stall_id').references(() => stalls.id),
  rating: integer('rating').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
}, (table) => ({
  unq: uniqueIndex('unique_vote').on(table.userId, table.stallId),
}));
