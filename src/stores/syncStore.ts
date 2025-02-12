import { create } from 'zustand';
import { SyncLogEntry } from '../types/sync';

interface SyncState {
  isSyncing: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'offline';
  lastSync: Date | null;
  lastError: string | null;
  pendingChanges: number;
  syncHistory: SyncLogEntry[];
  setIsSyncing: (status: boolean) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error' | 'offline') => void;
  setLastSync: (date: Date | null) => void;
  setLastError: (error: string | null) => void;
  setPendingChanges: (count: number) => void;
  addSyncHistoryEntry: (entry: SyncLogEntry) => void;
  clearSyncHistory: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  syncStatus: 'idle',
  lastSync: null,
  lastError: null,
  pendingChanges: 0,
  syncHistory: [],
  
  setIsSyncing: (status: boolean) => set({ isSyncing: status }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSync: (date) => set({ lastSync: date }),
  setLastError: (error) => set({ lastError: error }),
  setPendingChanges: (count) => set({ pendingChanges: count }),
  
  addSyncHistoryEntry: (entry) => set((state) => ({
    syncHistory: [...state.syncHistory, entry].slice(-100) // Garder les 100 dernières entrées
  })),
  
  clearSyncHistory: () => set({ syncHistory: [] })
})); 