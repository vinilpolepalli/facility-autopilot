import Pilot from '@/components/Pilot';
import { loadZones, loadReadings, getSettings, getRecStates, seedNote } from '@/lib/repo';
import { ownerId } from '@/lib/http';
import { DEFAULT_SETTINGS } from '@/lib/validate';
import { weeklyTotals } from '@/lib/engine';
import { money, kwh } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const owner = await ownerId();
  const zones = await loadZones();
  const readings = await loadReadings();
  const settings = (await getSettings(owner)) ?? DEFAULT_SETTINGS;
  const states = await getRecStates(owner);
  const note = await seedNote();
  const { recs, wastedKwh, savingsWeek, savingsYear } = weeklyTotals(zones, readings, settings);
  return (
    <main>
      <div className="mt-6 max-w-3xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">The building runs at night. The schedule says nobody is there.</h1>
        <p className="mt-2 text-sm text-mute">
          One simulated school week: the desk found {kwh(wastedKwh)} of unoccupied-load waste, worth an estimated {money(savingsWeek)}/week
          ({money(savingsYear)}/year) at your rate. Each finding below is a setback schedule you can approve, schedule or dismiss.
          Estimates, not a verified audit. {note}
        </p>
      </div>
      <Pilot zones={zones} readings={readings} recs={recs} initialSettings={settings} states={states} />
    </main>
  );
}
