import assert from 'assert';
import { runMigrations } from '../lib/migrations/index.ts';

(async function run() {
  const bundle = {
    version: '1',
    meta: { exportedAt: new Date().toISOString(), counts: { habits: 1, logs: 1 } },
    habits: [{ id: 'h1', name: 'a', type: 'good', streak: 0, createdAt: new Date().toISOString() }],
    logs: [{ id: 'l1', habitId: 'h1', date: '2020-01-01', completed: true, timestamp: new Date().toISOString() }],
    settings: { darkMode: false, language: 'en', motivatorPersonality: 'positive', fullscreenMode: false }
  } as any;

  const migrated = await runMigrations(bundle);
  assert(migrated.habits[0].updatedAt, 'habit should have updatedAt after migration');
  assert(migrated.logs[0].updatedAt, 'log should have updatedAt after migration');

  console.log('migrations.test: OK');
})().catch(e=>{ console.error(e); process.exit(1); });
