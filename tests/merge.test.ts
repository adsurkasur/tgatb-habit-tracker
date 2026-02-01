import assert from 'assert';
import { mergeHabit, mergeLog } from '../lib/sync/merge.ts';

function makeHabit(id: string, name: string, ts?: string) {
  return { id, name, type: 'good', streak: 0, createdAt: new Date(), updatedAt: ts ? new Date(ts) : undefined };
}

(async function run() {
  const base = makeHabit('h1', 'Drink water', '2020-01-01T00:00:00.000Z');
  const local = makeHabit('h1', 'Drink water (local)', '2020-01-02T00:00:00.000Z');
  const remote = makeHabit('h1', 'Drink water (remote)', '2020-01-01T12:00:00.000Z');

  const res = mergeHabit(local, remote, base);
  assert(res.merged.name === local.name, 'Local change with newer timestamp should win');

  // log merge
  const logA = { id: 'l1', habitId: 'h1', date: '2020-01-01', completed: true, timestamp: new Date('2020-01-01T00:00:00.000Z'), updatedAt: new Date('2020-01-02T00:00:00.000Z') };
  const logB = { id: 'l1', habitId: 'h1', date: '2020-01-01', completed: false, timestamp: new Date('2020-01-01T00:00:00.000Z'), updatedAt: new Date('2020-01-01T10:00:00.000Z') };
  const lres = mergeLog(logA, logB, undefined);
  assert(lres.merged.completed === true, 'Newer log should win');

  console.log('merge.test: OK');
})().catch(e=>{ console.error(e); process.exit(1); });
