"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { HabitStorage } from '@/lib/habit-storage';

import type { Habit, HabitLog } from '@shared/schema';

type FieldChoice = 'local' | 'remote';

type ConflictItem = {
  id: string;
  local?: Record<string, unknown>;
  remote?: Record<string, unknown>;
  conflicts?: Record<string, unknown>;
};

type ConflictPayload = {
  conflicts?: ConflictItem[];
  migrated?: { habits?: Habit[]; logs?: HabitLog[] } | null;
  migratedRemote?: Record<string, unknown> | null;
  remote?: Record<string, unknown> | null;
};

export function SyncConflictModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [payload, setPayload] = useState<ConflictPayload | null>(null);
  const [choices, setChoices] = useState<Record<string, Record<string, FieldChoice>>>({});
  const [prevOpen, setPrevOpen] = useState(false);

  // Adjust state during render when dialog opens (React-approved pattern)
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      try {
        const raw = localStorage.getItem('sync:conflict');
        const parsed = raw ? JSON.parse(raw) : null;
        const asPayload: ConflictPayload | null = parsed as ConflictPayload | null;
        setPayload(asPayload);

        // Initialize choices default to local for each conflict field
        const byItem: Record<string, Record<string, FieldChoice>> = {};
        if (asPayload?.conflicts && Array.isArray(asPayload.conflicts)) {
          for (const item of asPayload.conflicts) {
            const id = item.id;
            byItem[id] = {};
            const confFields = item.conflicts || {};
            for (const f of Object.keys(confFields)) {
              byItem[id][f] = 'local';
            }
          }
        }
        setChoices(byItem);
      } catch (err) {
        console.warn('Failed to parse sync:conflict payload', err);
        setPayload(null);
        setChoices({});
      }
    }
  }

  if (!open || !payload) return null;

  const setChoice = (itemId: string, field: string, choice: FieldChoice) => {
    setChoices(prev => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [field]: choice } }));
  };

  const applyResolutions = async () => {
    try {
      const resolvedHabits: Habit[] = [];
      const resolvedLogs: HabitLog[] = [];

      // Start from migrated remote as base for applying chosen fields
      const conflicts = payload.conflicts ?? [];
      for (const c of conflicts) {
        const id = c.id;
        const local = c.local ?? {};
        const remote = c.remote ?? {};
        const cho = choices[id] || {};
        const merged: Record<string, unknown> = { ...(remote || {}), ...(local || {}) };
        for (const f of Object.keys(c.conflicts || {})) {
          const choice = cho[f] || 'local';
          merged[f] = choice === 'local' ? (local as Record<string, unknown>)[f] : (remote as Record<string, unknown>)[f];
        }

        // classify by presence of habitId (log) or name (habit)
        if ((merged as Record<string, unknown>).hasOwnProperty('habitId')) {
          resolvedLogs.push(merged as unknown as HabitLog);
        } else {
          resolvedHabits.push(merged as unknown as Habit);
        }
      }

      // Merge with existing local items: overwrite matching ids, keep others
      const localHabits = HabitStorage.getHabits();
      const localLogs = HabitStorage.getLogs();

      const localHabMap = new Map(localHabits.map((h) => [h.id, h] as const));
      for (const h of resolvedHabits) localHabMap.set(h.id, h);
      const finalHabits = Array.from(localHabMap.values());

      const localLogMap = new Map(localLogs.map((l) => [l.id, l] as const));
      for (const l of resolvedLogs) localLogMap.set(l.id, l);
      const finalLogs = Array.from(localLogMap.values());

      HabitStorage.saveHabits(finalHabits);
      HabitStorage.saveLogs(finalLogs);

      localStorage.removeItem('sync:conflict');
      onClose();
    } catch (err) {
      console.error('applyResolutions error', err);
    }
  };

  const acceptRemote = async () => {
    try {
      const migrated = payload.migrated || (payload.remote as unknown as { habits?: Habit[]; logs?: HabitLog[] }) || null;
      if (migrated) {
        if ((migrated as { habits?: Habit[] }).habits) HabitStorage.saveHabits((migrated as { habits?: Habit[] }).habits as Habit[]);
        if ((migrated as { logs?: HabitLog[] }).logs) HabitStorage.saveLogs((migrated as { logs?: HabitLog[] }).logs as HabitLog[]);
      }
      localStorage.removeItem('sync:conflict');
      onClose();
    } catch (err) {
      console.error('acceptRemote error', err);
    }
  };

  const keepLocal = () => {
    localStorage.removeItem('sync:conflict');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="[&>button]:hidden">
        <DialogHeader className="shrink-0 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Sync Conflicts Detected</DialogTitle>
            <button
              type="button"
              onClick={() => onClose()}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>
        <DialogDescription>We found conflicts between your local data and the cloud backup. Choose per-field resolutions below, or use the global actions to accept the remote version or keep your local data.</DialogDescription>
        <div className="space-y-4">
        <div className="max-h-72 overflow-auto">
          {(payload.conflicts ?? []).map((c: ConflictItem) => (
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

        <DialogFooter>
          <div className="flex justify-end space-x-2 w-full">
            <Button variant="ghost" onClick={keepLocal}>Keep Local</Button>
            <Button variant="secondary" onClick={applyResolutions}>Apply Selected</Button>
            <Button onClick={acceptRemote}>Accept Remote</Button>
          </div>
        </DialogFooter>
      </div>
      </DialogContent>
    </Dialog>
  );
}

export default SyncConflictModal;
