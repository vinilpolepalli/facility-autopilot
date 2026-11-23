import { pgTable, text, integer, bigint, boolean, doublePrecision, index, customType } from 'drizzle-orm/pg-core';
import type { RecState, Settings } from '../types';

const jsonText = <T>() => customType<{ data: T; driverData: string }>({
  dataType: () => 'text', toDriver: (v) => JSON.stringify(v), fromDriver: (v) => JSON.parse(v),
});

export const zones = pgTable('zones', {
  id: text('id').primaryKey(), name: text('name').notNull(), floor: integer('floor').notNull(), idleKw: doublePrecision('idle_kw').notNull(), sortOrder: integer('sort_order').notNull(),
});
export const telemetry = pgTable('telemetry', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(), zoneId: text('zone_id').notNull().references(() => zones.id),
  day: text('day').notNull(), window: text('window').notNull(), avgKw: doublePrecision('avg_kw').notNull(), occupied: boolean('occupied').notNull(),
});
export const recStates = pgTable('rec_states', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(), ownerId: text('owner_id').notNull(), recId: text('rec_id').notNull(),
  state: text('state').$type<RecState>().notNull(), updatedAt: text('updated_at').notNull(),
}, (t) => [index('rec_owner_idx').on(t.ownerId, t.recId)]);
export const ownerSettings = pgTable('owner_settings', {
  ownerId: text('owner_id').primaryKey(),
  settings: jsonText<Settings>()('settings').notNull(), updatedAt: text('updated_at').notNull(),
});
export const kv = pgTable('kv', { key: text('key').primaryKey(), value: text('value').notNull() });
export const rateEvents = pgTable('rate_events', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(), ownerId: text('owner_id').notNull(), kind: text('kind').notNull(), at: bigint('at', { mode: 'number' }).notNull(),
}, (t) => [index('rate_idx').on(t.ownerId, t.kind, t.at)]);
