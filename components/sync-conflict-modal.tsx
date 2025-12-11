"use client";

import { useEffect, useState } from 'react';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { HabitStorage } from '@/lib/habit-storage';

type FieldChoice = 'local' | 'remote';

export function SyncConflictModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [payload, setPayload] = useState<any>(null);
  const [choices, setChoices] = useState<Record<string, Record<string, FieldChoice>>>({});

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem('sync:conflict');
      const parsed = raw ? JSON.parse(raw) : null;
      setPayload(parsed);

      // Initialize choices default to local for each conflict field
      const byItem: Record<string, Record<string, FieldChoice>> = {};
      if (parsed?.conflicts && Array.isArray(parsed.conflicts)) {
        for (const item of parsed.conflicts) {
          const id = item.id;
          byItem[id] = {};
          const confFields = item.conflicts || {};
          for (const f of Object.keys(confFields)) {
            byItem[id][f] = 'local';
          }
        }
      }
      setChoices(byItem);
    } catch (e) {
      setPayload(null);
      setChoices({});
    }
  }, [open]);

  if (!open || !payload) return null;

  const setChoice = (itemId: string, field: string, choice: FieldChoice) => {
    setChoices(prev => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [field]: choice } }));
  };

  const applyResolutions = async () => {
    try {
      const resolvedHabits = [] as any[];
      const resolvedLogs = [] as any[];

      // Start from migrated remote as base for applying chosen fields
      const migrated = payload.migrated || payload.migratedRemote || null;

      for (const c of payload.conflicts) {
        const id = c.id;
        const local = c.local || {};
        const remote = c.remote || {};
        const cho = choices[id] || {};
        const merged: any = { ...(remote || {}), ...(local || {}) };
        for (const f of Object.keys(c.conflicts || {})) {
          const choice = cho[f] || 'local';
          merged[f] = choice === 'local' ? local[f] : remote[f];
        }

        // classify by presence of habitId (log) or name (habit)
        if (merged.habitId) resolvedLogs.push(merged);
        else resolvedHabits.push(merged);
      }

      // Merge with existing local items: overwrite matching ids, keep others
      const localHabits = HabitStorage.getHabits();
      const localLogs = HabitStorage.getLogs();

      const localHabMap = new Map(localHabits.map(h=>[h.id,h]));
      for (const h of resolvedHabits) localHabMap.set(h.id, h);
      const finalHabits = Array.from(localHabMap.values());

      const localLogMap = new Map(localLogs.map(l=>[l.id,l]));
      for (const l of resolvedLogs) localLogMap.set(l.id, l);
      const finalLogs = Array.from(localLogMap.values());

      HabitStorage.saveHabits(finalHabits);
      HabitStorage.saveLogs(finalLogs);

      localStorage.removeItem('sync:conflict');
      onClose();
    } catch (e) {
      console.error('applyResolutions error', e);
    }
  };

  const acceptRemote = async () => {
    try {
      const migrated = payload.migrated || payload.remote || null;
      if (migrated) {
        if (migrated.habits) HabitStorage.saveHabits(migrated.habits);
        if (migrated.logs) HabitStorage.saveLogs(migrated.logs);
      }
      localStorage.removeItem('sync:conflict');
      onClose();
    } catch (e) {
      console.error('acceptRemote error', e);
    }
  };

  const keepLocal = () => {
    localStorage.removeItem('sync:conflict');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Sync Conflicts Detected">
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Conflicts were detected while merging cloud backup. Choose per-field resolutions below, or accept remote/keep local globally.</div>
        <div className="max-h-72 overflow-auto">
          {payload.conflicts.map((c: any) => (
            <div key={c.id} className="p-3 border rounded mb-2 bg-muted">
              <div className="font-medium">Item: {c.id}</div>
              <div className="text-xs text-muted-foreground">Local vs Remote differences</div>
              <pre className="text-xs my-2 p-2 bg-surface overflow-auto">{JSON.stringify({ local: c.local, remote: c.remote }, null, 2)}</pre>
              <div className="space-y-1">
                {Object.keys(c.conflicts || {}).map((f: string) => (
                  <div key={f} className="flex items-center justify-between">
                    <div className="text-sm">{f}</div>
                    <div className="space-x-2">
                      <label className="inline-flex items-center"><input type="radio" name={`${c.id}-${f}`} checked={choices[c.id]?.[f] === 'local'} onChange={() => setChoice(c.id, f, 'local')} /> <span className="ml-1">Local</span></label>
                      <label className="inline-flex items-center"><input type="radio" name={`${c.id}-${f}`} checked={choices[c.id]?.[f] === 'remote'} onChange={() => setChoice(c.id, f, 'remote')} /> <span className="ml-1">Remote</span></label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={keepLocal}>Keep Local</Button>
          <Button variant="secondary" onClick={applyResolutions}>Apply Resolutions</Button>
          <Button onClick={acceptRemote}>Accept Remote</Button>
        </div>
      </div>
    </Modal>
  );
}

export default SyncConflictModal;
