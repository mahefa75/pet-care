import React from 'react';
import { useSyncStore } from '../../stores/syncStore';
import type { SyncState } from '../../stores/syncStore';

const ConnectionStatus: React.FC = () => {
  const isSyncing = useSyncStore((state: SyncState) => state.isSyncing);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end gap-1 z-50">
      {isSyncing && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg shadow-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm">Synchronisation en cours...</span>
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg shadow-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm">Connecté</span>
      </div>
    </div>
  );
};

export default ConnectionStatus; 