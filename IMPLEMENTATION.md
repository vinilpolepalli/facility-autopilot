# Implementation notes

- `lib/engine.ts`: detectWaste() scans seeded readings where occupied=false and avgKw > zone idle floor, groups them per zone, and prices waste as (kW over idle) x hours x rate. Confidence is "high" at 3+ windows. All deterministic and labeled estimates.
- Persistence: shared simulated `zones` + `telemetry` seed; per-owner `rec_states` (append-only, newest wins) and `owner_settings`, keyed by the httpOnly `lr_uid` cookie from `middleware.ts`. SQLite locally, Postgres via DATABASE_URL; DDL in `lib/db/ddl.ts`, advisory-locked seed in `lib/db/seed.ts`.
- API: POST /api/recommendations (120/hr; validates the recId exists under the caller's current settings), PUT /api/settings. 20KB body cap; validation in `lib/validate.ts`.
