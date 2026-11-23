import { getDb } from '@/lib/db';
import { ownerId, rateHit, readJson, tooMany, json } from '@/lib/http';
import { parseRecBody, DEFAULT_SETTINGS } from '@/lib/validate';
import { loadZones, loadReadings, getSettings } from '@/lib/repo';
import { detectWaste } from '@/lib/engine';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const owner = await ownerId();
  const body = await readJson(req);
  if (!body.ok) return body.res;
  const input = parseRecBody(body.body);
  if (!input) return json({ error: 'Provide recId and action (approved|scheduled|dismissed)' }, 400);
  const lim = await rateHit(owner, 'rec', 120);
  if (!lim.ok) return tooMany(lim.retryAfter);
  const settings = (await getSettings(owner)) ?? DEFAULT_SETTINGS;
  const recs = detectWaste(await loadZones(), await loadReadings(), settings);
  if (!recs.some((r) => r.id === input.recId)) return json({ error: 'Unknown recommendation under current settings' }, 404);
  const db = await getDb();
  await db.orm.insert(db.t.recStates).values({ ownerId: owner, recId: input.recId, state: input.action, updatedAt: new Date().toISOString() });
  return json({ ok: true });
}
