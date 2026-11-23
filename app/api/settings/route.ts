import { getDb } from '@/lib/db';
import { ownerId, readJson, json } from '@/lib/http';
import { parseSettings } from '@/lib/validate';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  const owner = await ownerId();
  const body = await readJson(req);
  if (!body.ok) return body.res;
  const settings = parseSettings(body.body);
  if (!settings) return json({ error: 'Invalid settings: rate 0.01-5, buffer 0-240, bar 0-10000' }, 400);
  const db = await getDb();
  await db.tx(async (c) => {
    await c.orm.delete(c.t.ownerSettings).where(eq(c.t.ownerSettings.ownerId, owner));
    await c.orm.insert(c.t.ownerSettings).values({ ownerId: owner, settings, updatedAt: new Date().toISOString() });
  });
  return json({ ok: true, settings });
}
