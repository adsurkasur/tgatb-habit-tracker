import assert from 'assert';
import { mergeByTimestamp } from '../lib/sync/merge.ts';

(async function run() {
  const base = { id: 'x', name: 'A', updatedAt: '2020-01-01T00:00:00.000Z' };
  const local = { id: 'x', name: 'A (local)', updatedAt: '2020-01-02T00:00:00.000Z' };
  const remote = { id: 'x', name: 'A (remote)', updatedAt: '2020-01-02T00:00:00.000Z' };

  const res = mergeByTimestamp(local, remote, base);
  assert(res.conflict === true, 'Expect conflict when local and remote changed differently with same timestamp');
  assert(res.conflicts && Object.keys(res.conflicts).length >= 0, 'Conflicts object should be present');

  console.log('merge_conflict.test: OK');
})().catch(e=>{ console.error(e); process.exit(1); });
