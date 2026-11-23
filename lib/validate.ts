import type { RecState, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = { ratePerKwh: 0.14, occupancyBufferMin: 30, minSavingsUsd: 1 };

const num = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null;

export function parseSettings(body: unknown): Settings | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  const s = {
    ratePerKwh: num(b.ratePerKwh, 0.01, 5),
    occupancyBufferMin: num(b.occupancyBufferMin, 0, 240),
    minSavingsUsd: num(b.minSavingsUsd, 0, 10_000),
  };
  return Object.values(s).every((v) => v !== null) ? (s as Settings) : null;
}

export function parseRecBody(body: unknown): { recId: string; action: RecState } | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  const actions = ['approved', 'scheduled', 'dismissed'] as const;
  if (typeof b.recId !== 'string' || b.recId.length > 80) return null;
  const action = (actions as readonly string[]).includes(b.action as string) ? (b.action as RecState) : null;
  return action ? { recId: b.recId, action } : null;
}
