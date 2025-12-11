# Migration Runner & Guidelines

This document explains the migration runner added to `lib/migrations` and how migrations are applied to imported export bundles.

Files added:

- `lib/migrations/index.ts` — migration runner, composes `up()` functions from migration modules.
- `lib/migrations/0001-add-meta.ts` — example migration that adds `updatedAt`, `deviceId`, and `version` fields to habits and logs.

How it works:

1. When importing an export bundle, call `runMigrations(bundle)` to apply any missing transformations.
2. Migrations are run in sequence and should be idempotent.
3. Migrations operate on the export bundle shape (`ExportBundle`) and return the transformed bundle.

Pre-migration backup:

- Always keep a copy of the raw export bundle before applying migrations. The app should write a local backup to `platform-storage` or let the user download the JSON file.

Creating a new migration

1. Create a new file `lib/migrations/000N-description.ts` exporting an async `up(bundle: ExportBundle): Promise<ExportBundle>`.
2. Make the migration idempotent and write unit tests under `tests/`.
3. Add the migration to the `migrations` list in `lib/migrations/index.ts` (newest last).

Running migrations manually (dev)

You can run migrations against a saved bundle by using a small script or REPL that imports `lib/migrations/index.ts` and passes the bundle.

Example (Node, TypeScript with `ts-node`):

```bash
pnpm add -D ts-node
npx ts-node -e "import fs from 'fs'; import { runMigrations } from './lib/migrations'; const b=JSON.parse(fs.readFileSync('export.json','utf8')); runMigrations(b).then(r=>console.log(r));"
```
