import { sql } from 'drizzle-orm';
import zonesJson from '../../data/zones.json';
import telemetryJson from '../../data/telemetry.json';
import type { Db } from './index';

export async function seedIfEmpty(db: Db) {
  await db.tx(async (c) => {
    if (c.kind === 'postgres') await (c.orm as unknown as { execute(q: unknown): Promise<unknown> }).execute(sql`SELECT pg_advisory_xact_lock(7316401)`);
    const existing = await c.orm.select({ id: c.t.zones.id }).from(c.t.zones).limit(1);
    if (existing.length) return;
    const z = zonesJson as { note: string; zones: { id: string; name: string; floor: number; idleKw: number }[] };
    for (const [i, zone] of z.zones.entries()) await c.orm.insert(c.t.zones).values({ ...zone, sortOrder: i });
    const t = telemetryJson as { note: string; readings: { zoneId: string; day: string; window: string; avgKw: number; occupied: boolean }[] };
    for (const r of t.readings) await c.orm.insert(c.t.telemetry).values(r);
    await c.orm.insert(c.t.kv).values({ key: 'seedNote', value: `${z.note} ${t.note}` });
  });
}
