# Implementation Log: Sync Safety, Migrations, Consent, CI

This log records the changes applied to implement conflict-aware sync, migration scaffolding, analytics consent gating, and CI. Each step includes the files changed and rationale.

1) Schema updates
- Files: `shared/schema.ts`
- Change: Added optional `updatedAt`, `deviceId`, `version` on `Habit` and `HabitLog`. Added `analyticsConsent` to `UserSettings` and validation schema.
- Rationale: Allow per-item metadata for merges and store analytics consent.

2) Merge utility
- Files: `lib/sync/merge.ts`
- Change: Added simple LWW merge util `mergeByTimestamp`, `mergeHabit`, `mergeLog`.
- Rationale: Provide deterministic per-item merge based on `updatedAt` timestamp; will be improved later to surface conflicts.

3) Migration runner and first migration
- Files: `lib/migrations/index.ts`, `lib/migrations/0001-add-meta.ts`, `docs/MIGRATIONS.md`
- Change: Added migration runner and a migration that ensures `updatedAt`, `deviceId`, `version` exist on items.
- Rationale: Ensure older export bundles can be upgraded to include merge metadata.

4) Habit import pipeline
- Files: `lib/habit-storage.ts`
- Change: `importData` now runs migrations before validating and persisting import bundles.
- Rationale: Prevent stale formats from bypassing migration and causing runtime errors.

5) Cloud sync merge integration
- Files: `hooks/use-cloud-sync.ts`
- Change: On successful push, persist `sync:lastSnapshot`. On pull, run migrations and perform per-item merges (habits & logs) with a base snapshot, then persist merged results and update last snapshot.
- Rationale: Reduce risk of destructive overwrite by merging remote changes with local state.

6) Analytics consent gating
- Files: `components/firebase-initializer.tsx`, `components/settings/account-data-settings.tsx`
- Change: `FirebaseInitializer` initializes analytics only when `analyticsConsent` is true in settings. Added UI toggle in Account & Data settings to set consent.
- Rationale: Respect user privacy and compliance.

7) Tests (basic)
- Files: `tests/merge.test.ts`, `tests/migrations.test.ts`
- Change: Added basic test scripts demonstrating merge and migration behavior. These are lightweight scripts that can be run with a TypeScript runner (e.g., `ts-node`) in dev.

8) CI
- Files: `.github/workflows/ci.yml`
- Change: Added workflow that runs `npm ci`, `npm run check` (tsc), and `npm run lint` on PRs and pushes to `main`.

9) Docs and housekeeping
- Files: `docs/TODOs.md`, `docs/ISSUES_PROPOSED.md`, `docs/REVIEW_AND_ISSUES.md`, `INTEGRATION_GUIDE.md`, `.git/hooks/sendemail-validate.sample`
- Change: Consolidated TODOs, proposed GitHub issues, updated docs to reflect completed scans, and clarified the sample hook file.

Next recommended steps (progress):
- Integrate conflict UI to surface ambiguous merges to users (`components/sync-conflict-modal.tsx`). (done)
- Add unit test harness (install `ts-node` in devDependencies) and convert tests to run in CI. (done)
- Replace simple LWW merge with three-way merge and conflict detection enhancements. (done)
- Add end-to-end test to simulate multi-device sync scenarios. (pending)

Recent additions:

- Per-field conflict resolution modal: `components/sync-conflict-modal.tsx` — lets users pick local/remote values per conflicting field and apply resolutions.
- Conflict detection test: `tests/merge_conflict.test.ts`.

10) Test fixes and verification
- Files: various (tests/, lib/migrations/, lib/sync/merge.ts)
- Change: Adjusted test imports to be ESM-friendly by adding explicit `.ts` extensions and using `import type` for TypeScript-only types; updated test scripts to run under `ts-node/register` in dev.
- Result: All unit tests pass locally (run: `npm run test:unit`) — `merge`, `migrations`, `merge_conflict`, `merge_edgecases`, `migration_idempotent` observed OK.
- Rationale: Ensure migration and merge logic remain stable under the project's ESM+TypeScript setup and that CI can validate regressions.
