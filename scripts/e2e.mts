const base = process.env.BASE_URL ?? 'http://localhost:3000';
const jar: string[] = [];
async function call(path: string, init?: RequestInit) {
  const res = await fetch(base + path, { ...init, headers: { ...(init?.headers ?? {}), cookie: jar.join('; '), 'content-type': 'application/json' } });
  for (const c of res.headers.getSetCookie?.() ?? []) jar.push(c.split(';')[0]);
  return res;
}
const home = await call('/');
if (home.status !== 200) throw new Error(`home ${home.status}`);
if (!(await home.text()).includes('Facility')) throw new Error('home missing heading');
const act = await call('/api/recommendations', { method: 'POST', body: JSON.stringify({ recId: 'rec-z-gym', action: 'approved' }) });
if (act.status !== 200) throw new Error(`rec ${act.status}: ${await act.text()}`);
const home2 = await call('/');
if (!(await home2.text()).includes('Approve')) throw new Error('state UI missing');
const put = await call('/api/settings', { method: 'PUT', body: JSON.stringify({ ratePerKwh: 0.2, occupancyBufferMin: 45, minSavingsUsd: 2 }) });
if (put.status !== 200) throw new Error(`settings ${put.status}`);
const bad = await call('/api/recommendations', { method: 'POST', body: JSON.stringify({ recId: 'nope', action: 'approved' }) });
if (bad.status !== 404) throw new Error(`expected 404, got ${bad.status}`);
console.log('e2e pass');
