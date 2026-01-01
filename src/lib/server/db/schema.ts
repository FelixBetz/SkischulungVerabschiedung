import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const teams = sqliteTable('teams', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	points: integer('points').notNull().default(0),
	iconUrl: text('icon_url').notNull(),
	hearts: integer('hearts').notNull().default(3)
});
