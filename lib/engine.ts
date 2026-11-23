import type { Reading, Recommendation, Settings, Zone } from './types';

const hoursOf = (window: string) => {
  const [a, b] = window.split('-').map((h) => Number(h.split(':')[0]));
  return b - a;
};

/**
 * Scan unoccupied readings and group them into per-zone recommendations.
 * Waste = (measured kW - zone idle kW) x hours, priced at the owner's rate. Deterministic; labeled estimates.
 */
export function detectWaste(zones: Zone[], readings: Reading[], s: Settings): Recommendation[] {
  const recs: Recommendation[] = [];
  for (const z of zones) {
    const waste = readings.filter((r) => r.zoneId === z.id && !r.occupied && r.avgKw > z.idleKw);
    if (!waste.length) continue;
    const kwh = waste.reduce((sum, r) => sum + (r.avgKw - z.idleKw) * hoursOf(r.window), 0);
    const weekly = kwh * s.ratePerKwh;
    if (weekly < s.minSavingsUsd) continue;
    const weekend = waste.filter((r) => r.day === 'Sat' || r.day === 'Sun');
    const evenings = waste.filter((r) => r.day !== 'Sat' && r.day !== 'Sun');
    const parts: string[] = [];
    if (evenings.length) parts.push(`${evenings.length} unoccupied evening window(s) after the bell schedule plus your ${s.occupancyBufferMin}min buffer`);
    if (weekend.length) parts.push(`${weekend.length} unoccupied weekend window(s)`);
    recs.push({
      id: `rec-${z.id}`, zoneId: z.id, zoneName: z.name,
      title: `Set back ${z.name} when unoccupied`,
      detail: `HVAC and load in ${z.name} averaged well above its ${z.idleKw} kW idle floor during ${parts.join(' and ')}. Recommendation: schedule a setback (reduced airflow, relaxed temperature band) for unoccupied windows, auto-restored ${s.occupancyBufferMin} minutes before the next booking.`,
      windows: waste.map((r) => ({ day: r.day, window: r.window })),
      wastedKwhPerWeek: Math.round(kwh * 10) / 10,
      savingsUsdPerWeek: Math.round(weekly * 100) / 100,
      savingsUsdPerYear: Math.round(weekly * 52 * 100) / 100,
      confidence: waste.length >= 3 ? 'high' : 'medium',
    });
  }
  return recs.sort((a, b) => b.savingsUsdPerWeek - a.savingsUsdPerWeek);
}

export function weeklyTotals(zones: Zone[], readings: Reading[], s: Settings) {
  const recs = detectWaste(zones, readings, s);
  return {
    recs,
    wastedKwh: Math.round(recs.reduce((x, r) => x + r.wastedKwhPerWeek, 0) * 10) / 10,
    savingsWeek: Math.round(recs.reduce((x, r) => x + r.savingsUsdPerWeek, 0) * 100) / 100,
    savingsYear: Math.round(recs.reduce((x, r) => x + r.savingsUsdPerYear, 0) * 100) / 100,
  };
}
