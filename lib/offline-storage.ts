/**
 * Offline storage for habit data with IndexedDB fallback
 */

interface OfflineHabitAction {
  id: string;
  action: 'create' | 'update' | 'delete' | 'track';
  data: any;
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
      };
    });
  }

  // Store pending actions for when we're back online
  async addPendingAction(action: OfflineHabitAction): Promise<void> {
    if (!this.db) {
      // Fallback to localStorage
      const pending = this.getPendingActionsFromStorage();
      pending.push(action);
      localStorage.setItem('pending-habit-actions', JSON.stringify(pending));
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.add(action);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Get all pending actions
  async getPendingActions(): Promise<OfflineHabitAction[]> {
    if (!this.db) {
      // Fallback to localStorage
      return this.getPendingActionsFromStorage();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Clear pending actions after successful sync
  async clearPendingActions(): Promise<void> {
    if (!this.db) {
      // Fallback to localStorage
      localStorage.removeItem('pending-habit-actions');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Store habits locally
  async storeHabits(habits: any[]): Promise<void> {
    if (!this.db) {
      // Fallback to localStorage
      localStorage.setItem('offline-habits', JSON.stringify(habits));
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['habits'], 'readwrite');
      const store = transaction.objectStore('habits');
      
      // Clear existing data
      store.clear();
      
      // Add all habits
      let completed = 0;
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
    });
  }

  // Get stored habits
  async getStoredHabits(): Promise<any[]> {
    if (!this.db) {
      // Fallback to localStorage
      const stored = localStorage.getItem('offline-habits');
      return stored ? JSON.parse(stored) : [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['habits'], 'readonly');
      const store = transaction.objectStore('habits');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private getPendingActionsFromStorage(): OfflineHabitAction[] {
    try {
      const pending = localStorage.getItem('pending-habit-actions');
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.warn('Failed to get pending actions from localStorage:', error);
      return [];
    }
  }

  // Track habit offline
  async trackHabitOffline(habitId: string, date: string, status: boolean): Promise<void> {
    const action: OfflineHabitAction = {
      id: `track-${habitId}-${date}-${Date.now()}`,
      action: 'track',
      data: { habitId, date, status },
      timestamp: Date.now()
    };

    await this.addPendingAction(action);
  }

  // Create habit offline
  async createHabitOffline(habitData: any): Promise<void> {
    const action: OfflineHabitAction = {
      id: `create-${habitData.id}-${Date.now()}`,
      action: 'create',
      data: habitData,
      timestamp: Date.now()
    };

    await this.addPendingAction(action);
  }

  // Update habit offline
  async updateHabitOffline(habitId: string, updates: any): Promise<void> {
    const action: OfflineHabitAction = {
      id: `update-${habitId}-${Date.now()}`,
      action: 'update',
      data: { habitId, updates },
      timestamp: Date.now()
    };

    await this.addPendingAction(action);
  }

  // Delete habit offline
  async deleteHabitOffline(habitId: string): Promise<void> {
    const action: OfflineHabitAction = {
      id: `delete-${habitId}-${Date.now()}`,
      action: 'delete',
      data: { habitId },
      timestamp: Date.now()
    };

    await this.addPendingAction(action);
  }
}

// Create singleton instance
export const offlineHabitStorage = new OfflineHabitStorage();

// Initialize on import
if (typeof window !== 'undefined') {
  offlineHabitStorage.init().catch(console.error);
}

export default offlineHabitStorage;
