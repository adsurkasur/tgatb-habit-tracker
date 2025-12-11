import assert from 'assert';
import { runMigrations } from '../lib/migrations/index.ts';

(async function run() {
  const bundle = {
    version: '1',
    meta: { exportedAt: new Date().toISOString(), counts: { habits: 1, logs: 0 } },
    habits: [{ id: 'h1', name: 'a', type: 'good', streak: 0, createdAt: new Date().toISOString() }],
    logs: [],
    settings: { darkMode: false, language: 'en', motivatorPersonality: 'positive', fullscreenMode: false }
  } as any;

  const first = await runMigrations(bundle);
  const second = await runMigrations(first);
  // idempotent: second run should not change the shape
  assert(JSON.stringify(first) === JSON.stringify(second), 'Migration should be idempotent');

  console.log('migration_idempotent.test: OK');
})().catch(e=>{ console.error(e); process.exit(1); });
