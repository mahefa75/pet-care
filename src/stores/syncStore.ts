import { create } from 'zustand';

export interface SyncState {
  isSyncing: boolean;
  setIsSyncing: (status: boolean) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  setIsSyncing: (status: boolean) => set({ isSyncing: status }),
})); 