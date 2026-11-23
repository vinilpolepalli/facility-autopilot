# Facility Autopilot

Independent demo: detect HVAC waste in unoccupied windows from building telemetry and price scheduled setbacks, the day-to-day of AI that operates energy infrastructure for schools and facilities.

- Deterministic detection: unoccupied window with load above the zone's idle floor
- Grouped findings with wasted kWh and estimated $/week and $/year at your electricity rate
- Approve, schedule or dismiss each finding; actions persist per anonymous browser cookie
- Simulated sample school; savings are estimates, not a verified audit

Stack: Next.js 15, drizzle-orm, SQLite locally, Postgres (Neon) via DATABASE_URL.

## Run
```
npm install && npm run dev
npm test && npm run typecheck
BASE_URL=http://localhost:3000 npm run e2e
```

Demo built by Vinil Polepalli. Not affiliated with or endorsed by Edviro.
