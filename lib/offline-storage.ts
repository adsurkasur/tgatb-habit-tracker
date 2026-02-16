/**
 * @module offline-storage
 *
 * Offline queue for habit mutations while the device is disconnected.
 *
 * Uses IndexedDB as the primary store with a localStorage/PlatformStorage
 * fallback when IndexedDB is unavailable.
 *
 * ### Why this module is NOT account-scoped (yet)
 *
 * Currently the offline queue uses global (un-scoped) keys:
 *   - IndexedDB database: `"tgatb-habits-offline"` (shared across accounts)
 *   - localStorage fallback keys: `"offline-habits"`, `"pending-habit-actions"`
 *
 * This is safe **today** because:
 *   1. The queue is transient — actions are replayed and cleared on sync.
 *   2. Account switches trigger a full data reload from scoped storage;
 *      the queue is only consumed by the session that created it.
 *   3. Multi-account usage on the same device is rare and always
 *      sequential (never concurrent).
 *
 * ### When scoping becomes necessary
 *
 * If the app ever supports:
 *   - Background sync (actions replayed without user session context),
 *   - Concurrent multi-account sessions,
 *   - Shared-device flows where queue items could leak,
 *
 * then the queue MUST be scoped by accountId. Insertion points:
 *
 *   TODO(account-scope): Scope IndexedDB database name with accountId
 *       e.g. `tgatb-habits-offline::${getActiveAccountId()}`
 *
 *   TODO(account-scope): Scope localStorage fallback keys with `scopedKey()`
 *       e.g. `scopedKey("pending-habit-actions")`
 *
 *   TODO(account-scope): Clear/rotate the queue on account switch to
 *       prevent cross-account replay.
 *
 * Invariants:
 *   - The queue is append-only until sync clears it.
 *   - `init()` is called once on module import (singleton pattern).
 *   - Fallback to PlatformStorage must be silent (no user-visible error).
 *
 * Allowed callers:
 *   - `use-cloud-sync.ts` (enqueue actions while offline, replay on reconnect).
 *   - `use-habits.ts` (read cached habits when offline).
 */

interface OfflineHabitAction {
  id: string;
  action: 'create' | 'update' | 'delete' | 'track';
  data: unknown;
  timestamp: number;
}

class OfflineHabitStorage {
  private dbName = 'tgatb-habits-offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB not supported, falling back to localStorage');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase): void {
    // Create object stores
    if (!db.objectStoreNames.contains('pendingActions')) {
      const store = db.createObjectStore('pendingActions', { keyPath: 'id' });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    }

    if (!db.objectStoreNames.contains('habits')) {
      db.createObjectStore('habits', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('habitLogs')) {
      db.createObjectStore('habitLogs', { keyPath: 'id' });
    }
  }

  // Generic IndexedDB operation handler
  private async executeTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Store pending actions for when we're back online
  async addPendingAction(action: OfflineHabitAction): Promise<void> {
    if (!this.db) {
      return this.addPendingActionToLocalStorage(action);
    }

    await this.executeTransaction('pendingActions', 'readwrite', (store) => 
      store.add(action)
    );
  }

  // Get all pending actions
  async getPendingActions(): Promise<OfflineHabitAction[]> {
    if (!this.db) {
      return this.getPendingActionsFromStorage();
    }

    return this.executeTransaction('pendingActions', 'readonly', (store) => 
      store.getAll()
    );
  }

  // Clear pending actions after successful sync
  async clearPendingActions(): Promise<void> {
    if (!this.db) {
      const { PlatformStorage } = await import('./platform-storage');
      await PlatformStorage.removeItem('pending-habit-actions');
      return;
    }

    await this.executeTransaction('pendingActions', 'readwrite', (store) => 
      store.clear()
    );
  }

  // Store habits locally
  async storeHabits(habits: Array<Record<string, unknown>>): Promise<void> {
    if (!this.db) {
      const { PlatformStorage } = await import('./platform-storage');
      await PlatformStorage.setItem('offline-habits', JSON.stringify(habits));
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['habits'], 'readwrite');
      const store = transaction.objectStore('habits');
      
      // Clear existing data first
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        // Add all habits
        let completed = 0;
        if (habits.length === 0) {
          resolve();
          return;
        }
        
        habits.forEach(habit => {
          const request = store.add(habit);
          request.onsuccess = () => {
            completed++;
            if (completed === habits.length) {
              resolve();
            }
          };
          request.onerror = () => reject(request.error);
        });
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }

  // Get stored habits
  async getStoredHabits(): Promise<Array<Record<string, unknown>>> {
    if (!this.db) {
      const { PlatformStorage } = await import('./platform-storage');
      const stored = await PlatformStorage.getItem('offline-habits');
      return stored ? JSON.parse(stored) : [];
    }

    return this.executeTransaction('habits', 'readonly', (store) => 
      store.getAll()
    );
  }

  // LocalStorage fallback methods (now using PlatformStorage)
  private async addPendingActionToLocalStorage(action: OfflineHabitAction): Promise<void> {
    const pending = await this.getPendingActionsFromStorage();
    pending.push(action);
    const { PlatformStorage } = await import('./platform-storage');
    await PlatformStorage.setItem('pending-habit-actions', JSON.stringify(pending));
  }

  private async getPendingActionsFromStorage(): Promise<OfflineHabitAction[]> {
    try {
      const { PlatformStorage } = await import('./platform-storage');
      const pending = await PlatformStorage.getItem('pending-habit-actions');
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.warn('Failed to get pending actions from storage:', error);
      return [];
    }
  }

  // Convenience methods for different habit operations
  async trackHabitOffline(habitId: string, date: string, status: boolean): Promise<void> {
    const action: OfflineHabitAction = {
      id: `track-${habitId}-${date}-${Date.now()}`,
      action: 'track',
      data: { habitId, date, status },
      timestamp: Date.now()
    };

    return this.addPendingAction(action);
  }

  async createHabitOffline(habitData: Record<string, unknown>): Promise<void> {
    const action: OfflineHabitAction = {
      id: `create-${habitData.id}-${Date.now()}`,
      action: 'create',
      data: habitData,
      timestamp: Date.now()
    };

    return this.addPendingAction(action);
  }

  async updateHabitOffline(habitId: string, updates: Record<string, unknown>): Promise<void> {
    const action: OfflineHabitAction = {
      id: `update-${habitId}-${Date.now()}`,
      action: 'update',
      data: { habitId, updates },
      timestamp: Date.now()
    };

    return this.addPendingAction(action);
  }

  async deleteHabitOffline(habitId: string): Promise<void> {
    const action: OfflineHabitAction = {
      id: `delete-${habitId}-${Date.now()}`,
      action: 'delete',
      data: { habitId },
      timestamp: Date.now()
    };

    return this.addPendingAction(action);
  }
}

// Create singleton instance
export const offlineHabitStorage = new OfflineHabitStorage();

// Initialize on import
if (typeof window !== 'undefined') {
  offlineHabitStorage.init().catch(console.error);
}

export default offlineHabitStorage;
