import { eq } from 'drizzle-orm';
import { getDb } from './db';
import type { Reading, RecState, Settings, Zone } from './types';

export async function loadZones(): Promise<Zone[]> {
  const { orm, t } = await getDb();
  return (await orm.select().from(t.zones).orderBy(t.zones.sortOrder)).map(({ sortOrder: _s, ...z }) => z);
}
export async function loadReadings(): Promise<Reading[]> {
  const { orm, t } = await getDb();
  return (await orm.select().from(t.telemetry)).map(({ id: _i, ...r }) => r);
}
export async function getSettings(owner: string): Promise<Settings | null> {
  const { orm, t } = await getDb();
  return (await orm.select().from(t.ownerSettings).where(eq(t.ownerSettings.ownerId, owner)))[0]?.settings ?? null;
}
export async function getRecStates(owner: string): Promise<Record<string, RecState>> {
  const { orm, t } = await getDb();
  const rows = await orm.select().from(t.recStates).where(eq(t.recStates.ownerId, owner));
  const latest = new Map<string, { state: RecState; at: string }>();
  for (const r of rows) {
    const cur = latest.get(r.recId);
    if (!cur || r.updatedAt > cur.at) latest.set(r.recId, { state: r.state, at: r.updatedAt });
  }
  return Object.fromEntries([...latest].map(([k, v]) => [k, v.state]));
}
export async function seedNote(): Promise<string> {
  const { orm, t } = await getDb();
  return (await orm.select().from(t.kv).where(eq(t.kv.key, 'seedNote')))[0]?.value ?? '';
}
