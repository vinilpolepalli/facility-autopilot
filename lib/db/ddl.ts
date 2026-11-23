export const SQLITE_DDL = [
  `CREATE TABLE IF NOT EXISTS "zones" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "floor" INTEGER NOT NULL, "idle_kw" REAL NOT NULL, "sort_order" INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "telemetry" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "zone_id" TEXT NOT NULL REFERENCES "zones"("id"), "day" TEXT NOT NULL, "window" TEXT NOT NULL, "avg_kw" REAL NOT NULL, "occupied" INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "rec_states" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "owner_id" TEXT NOT NULL, "rec_id" TEXT NOT NULL, "state" TEXT NOT NULL, "updated_at" TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "rec_owner_idx" ON "rec_states" ("owner_id", "rec_id")`,
  `CREATE TABLE IF NOT EXISTS "owner_settings" ("owner_id" TEXT PRIMARY KEY, "settings" TEXT NOT NULL, "updated_at" TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "kv" ("key" TEXT PRIMARY KEY, "value" TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "rate_events" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "owner_id" TEXT NOT NULL, "kind" TEXT NOT NULL, "at" INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "rate_idx" ON "rate_events" ("owner_id", "kind", "at")`,
];
export const PG_DDL = [
  `CREATE TABLE IF NOT EXISTS "zones" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "floor" INTEGER NOT NULL, "idle_kw" DOUBLE PRECISION NOT NULL, "sort_order" INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "telemetry" ("id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, "zone_id" TEXT NOT NULL REFERENCES "zones"("id"), "day" TEXT NOT NULL, "window" TEXT NOT NULL, "avg_kw" DOUBLE PRECISION NOT NULL, "occupied" BOOLEAN NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "rec_states" ("id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, "owner_id" TEXT NOT NULL, "rec_id" TEXT NOT NULL, "state" TEXT NOT NULL, "updated_at" TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "rec_owner_idx" ON "rec_states" ("owner_id", "rec_id")`,
  `CREATE TABLE IF NOT EXISTS "owner_settings" ("owner_id" TEXT PRIMARY KEY, "settings" TEXT NOT NULL, "updated_at" TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "kv" ("key" TEXT PRIMARY KEY, "value" TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "rate_events" ("id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, "owner_id" TEXT NOT NULL, "kind" TEXT NOT NULL, "at" BIGINT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "rate_idx" ON "rate_events" ("owner_id", "kind", "at")`,
];
