export type Zone = { id: string; name: string; floor: number; idleKw: number };
export type Reading = { zoneId: string; day: string; window: string; avgKw: number; occupied: boolean };
export type Settings = { ratePerKwh: number; occupancyBufferMin: number; minSavingsUsd: number };
export type Recommendation = {
  id: string; zoneId: string; zoneName: string; title: string; detail: string;
  windows: { day: string; window: string }[]; wastedKwhPerWeek: number; savingsUsdPerWeek: number;
  savingsUsdPerYear: number; confidence: 'high' | 'medium';
};
export type RecState = 'approved' | 'scheduled' | 'dismissed';
