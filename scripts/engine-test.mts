import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { detectWaste, weeklyTotals } from '../lib/engine.ts';
import { DEFAULT_SETTINGS } from '../lib/validate.ts';
import type { Reading, Zone } from '../lib/types.ts';

const { zones } = JSON.parse(readFileSync(new URL('../data/zones.json', import.meta.url), 'utf8')) as { zones: Zone[] };
const { readings } = JSON.parse(readFileSync(new URL('../data/telemetry.json', import.meta.url), 'utf8')) as { readings: Reading[] };
const recs = detectWaste(zones, readings, DEFAULT_SETTINGS);
assert.ok(recs.length >= 4, `expected >=4 findings, got ${recs.length}`);
assert.ok(recs.every((r) => r.savingsUsdPerWeek >= DEFAULT_SETTINGS.minSavingsUsd));
assert.ok(recs.every((r) => r.windows.every((w) => readings.some((x) => x.day === w.day && x.window === w.window && !x.occupied))), 'only unoccupied windows cited');
assert.ok(!recs.some((r) => r.zoneId === 'z-admin' && r.windows.some((w) => w.day === 'Sat')), 'occupied Sat admin window excluded');
const { wastedKwh, savingsYear } = weeklyTotals(zones, readings, DEFAULT_SETTINGS);
assert.ok(wastedKwh > 0 && savingsYear > wastedKwh * 0.14 * 40, 'math sane');
const strict = detectWaste(zones, readings, { ...DEFAULT_SETTINGS, minSavingsUsd: 1000 });
assert.equal(strict.length, 0, 'finding bar respected');
console.log('engine tests pass');
