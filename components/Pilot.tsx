'use client';
import { useState } from 'react';
import { btn, btn2, input, Panel } from './ui';
import { money, kwh } from '@/lib/format';
import type { Reading, RecState, Recommendation, Settings, Zone } from '@/lib/types';

const ACTIONS: { id: RecState; label: string }[] = [
  { id: 'approved', label: 'Approve' },
  { id: 'scheduled', label: 'Mark scheduled' },
  { id: 'dismissed', label: 'Dismiss' },
];

export default function Pilot({ zones, readings, recs: initialRecs, initialSettings, states: initialStates }: {
  zones: Zone[]; readings: Reading[]; recs: Recommendation[]; initialSettings: Settings; states: Record<string, RecState>;
}) {
  const [recs, setRecs] = useState(initialRecs);
  const [states, setStates] = useState(initialStates);
  const [s, setS] = useState(initialSettings);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function call(url: string, init: RequestInit) {
    const res = await fetch(url, { ...init, headers: { 'content-type': 'application/json' } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
    return body;
  }

  async function act(recId: string, action: RecState) {
    try {
      await call('/api/recommendations', { method: 'POST', body: JSON.stringify({ recId, action }) });
      setStates((st) => ({ ...st, [recId]: action }));
    } catch (e) { setError((e as Error).message); }
  }

  async function save() {
    setSaving(true); setError('');
    try {
      await call('/api/settings', { method: 'PUT', body: JSON.stringify(s) });
      const { detectWaste } = await import('@/lib/engine');
      setRecs(detectWaste(zones, readings, s));
    } catch (e) { setError((e as Error).message); } finally { setSaving(false); }
  }

  const occupiedCount = readings.filter((r) => r.occupied).length;
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Panel title={`Findings (${recs.length})`}>
        {recs.length === 0 && <p className="text-sm text-mute">No unoccupied-load waste above your bar under current settings.</p>}
        <ul className="space-y-3">{recs.map((r) => (
          <li key={r.id} className="rounded-ctl border border-line p-3">
            <button className="w-full text-left" onClick={() => setOpen(open === r.id ? null : r.id)}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{r.title}</span>
                <span className="text-[11px] tabular-nums text-mute">{kwh(r.wastedKwhPerWeek)}/wk · {money(r.savingsUsdPerWeek)}/wk · {money(r.savingsUsdPerYear)}/yr</span>
              </div>
              <div className="mt-1 text-[11px] text-mute">confidence: {r.confidence} · windows: {r.windows.map((w) => `${w.day} ${w.window}`).join(', ')}</div>
            </button>
            {open === r.id && <p className="mt-2 rounded-ctl border border-line bg-[#fafafa] p-3 text-xs text-ink">{r.detail}</p>}
            <div className="mt-2 flex gap-2">{ACTIONS.map((a) => (
              <button key={a.id} className={states[r.id] === a.id ? btn : btn2} onClick={() => act(r.id, a.id)}>{a.label}</button>
            ))}</div>
          </li>
        ))}</ul>
      </Panel>
      <div className="space-y-6">
        <Panel title="Building snapshot">
          <table className="w-full text-left text-sm">
            <thead><tr className="label border-b border-line"><th className="py-1.5 font-semibold">Zone</th><th className="py-1.5 text-right font-semibold">Idle floor</th><th className="py-1.5 text-right font-semibold">Readings</th></tr></thead>
            <tbody>{zones.map((z) => (
              <tr key={z.id} className="border-b border-line last:border-0">
                <td className="py-1.5">{z.name} <span className="text-[11px] text-mute">floor {z.floor}</span></td>
                <td className="py-1.5 text-right tabular-nums">{z.idleKw} kW</td>
                <td className="py-1.5 text-right tabular-nums">{readings.filter((r) => r.zoneId === z.id).length}</td>
              </tr>
            ))}</tbody>
          </table>
          <p className="mt-2 text-[11px] text-mute">{readings.length} simulated readings, {occupiedCount} occupied. Detection = unoccupied window with load above the zone's idle floor.</p>
        </Panel>
        <Panel title="Your settings" right={<button className={btn2} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save + rescan'}</button>}>
          <div className="grid grid-cols-1 gap-3">
            <label className="block text-[11px] text-mute">Electricity rate ($/kWh)
              <input className={input} type="number" step="0.01" value={s.ratePerKwh} onChange={(e) => setS({ ...s, ratePerKwh: Number(e.target.value) })} /></label>
            <label className="block text-[11px] text-mute">Occupancy buffer (min before next booking)
              <input className={input} type="number" value={s.occupancyBufferMin} onChange={(e) => setS({ ...s, occupancyBufferMin: Number(e.target.value) })} /></label>
            <label className="block text-[11px] text-mute">Finding bar ($/week savings)
              <input className={input} type="number" value={s.minSavingsUsd} onChange={(e) => setS({ ...s, minSavingsUsd: Number(e.target.value) })} /></label>
          </div>
        </Panel>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
