import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import type { RecState, Settings } from '../types';

export const zones = sqliteTable('zones', {
  id: text('id').primaryKey(), name: text('name').notNull(), floor: integer('floor').notNull(), idleKw: real('idle_kw').notNull(), sortOrder: integer('sort_order').notNull(),
});
export const telemetry = sqliteTable('telemetry', {
  id: integer('id').primaryKey({ autoIncrement: true }), zoneId: text('zone_id').notNull().references(() => zones.id),
  day: text('day').notNull(), window: text('window').notNull(), avgKw: real('avg_kw').notNull(), occupied: integer('occupied', { mode: 'boolean' }).notNull(),
});
export const recStates = sqliteTable('rec_states', {
  id: integer('id').primaryKey({ autoIncrement: true }), ownerId: text('owner_id').notNull(), recId: text('rec_id').notNull(),
  state: text('state').$type<RecState>().notNull(), updatedAt: text('updated_at').notNull(),
}, (t) => [index('rec_owner_idx').on(t.ownerId, t.recId)]);
export const ownerSettings = sqliteTable('owner_settings', {
  ownerId: text('owner_id').primaryKey(),
  settings: text('settings', { mode: 'json' }).$type<Settings>().notNull(), updatedAt: text('updated_at').notNull(),
});
export const kv = sqliteTable('kv', { key: text('key').primaryKey(), value: text('value').notNull() });
export const rateEvents = sqliteTable('rate_events', {
  id: integer('id').primaryKey({ autoIncrement: true }), ownerId: text('owner_id').notNull(), kind: text('kind').notNull(), at: integer('at').notNull(),
}, (t) => [index('rate_idx').on(t.ownerId, t.kind, t.at)]);
