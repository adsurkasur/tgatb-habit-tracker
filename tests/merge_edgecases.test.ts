import assert from 'assert';
import { mergeByTimestamp } from '../lib/sync/merge.ts';

(async function run() {
  // remote-only
  const remoteOnly = mergeByTimestamp(null as any, { id: 'r1', name: 'Remote', updatedAt: '2021-01-01T00:00:00Z' } as any, null as any);
  assert(remoteOnly.merged.id === 'r1' && !remoteOnly.conflict, 'remote-only should merge without conflict');

  // local-only
  const localOnly = mergeByTimestamp({ id: 'l1', name: 'Local', updatedAt: '2021-01-02T00:00:00Z' } as any, null as any, null as any);
  assert(localOnly.merged.id === 'l1' && !localOnly.conflict, 'local-only should merge without conflict');

  // base equals local, remote changed
  const base = { id: 'x', val: 1 };
  const local = { id: 'x', val: 1, updatedAt: '2021-01-01T00:00:00Z' };
  const remote = { id: 'x', val: 2, updatedAt: '2021-01-02T00:00:00Z' };
  const res = mergeByTimestamp(local as any, remote as any, base as any);
  assert(res.merged.val === 2 && !res.conflict, 'remote change should win when base==local');

  console.log('merge_edgecases.test: OK');
})().catch(e=>{ console.error(e); process.exit(1); });
