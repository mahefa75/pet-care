import React from 'react';
import { useSyncStore } from '../../stores/syncStore';

export const SyncStatus: React.FC = () => {
  const {
    syncStatus,
    lastSync,
    lastError,
    pendingChanges,
    syncHistory
  } = useSyncStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              syncStatus === 'idle' ? 'bg-green-500' :
              syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' :
              syncStatus === 'error' ? 'bg-red-500' :
              'bg-gray-500'
            }`}
          />
          <span className="font-medium">
            {syncStatus === 'idle' ? 'Synchronisé' :
             syncStatus === 'syncing' ? 'Synchronisation en cours...' :
             syncStatus === 'error' ? 'Erreur de synchronisation' :
             'Hors ligne'}
          </span>
        </div>
        {lastSync && (
          <span className="text-sm text-gray-500">
            Dernière synchro: {new Date(lastSync).toLocaleString()}
          </span>
        )}
      </div>

      {lastError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {lastError}
        </div>
      )}

      {pendingChanges > 0 && (
        <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md">
          {pendingChanges} changement{pendingChanges > 1 ? 's' : ''} en attente de synchronisation
        </div>
      )}

      {syncHistory.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Historique de synchronisation</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {syncHistory.slice().reverse().map((entry, index) => (
              <div
                key={index}
                className={`p-2 rounded-md text-sm ${
                  entry.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                <div className="flex justify-between">
                  <span>{entry.details}</span>
                  <span className="text-xs">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                {entry.affectedTables.length > 0 && (
                  <div className="mt-1 text-xs">
                    Tables affectées: {entry.affectedTables.join(', ')}
                  </div>
                )}
                {entry.error && (
                  <div className="mt-1 text-xs font-medium">
                    Erreur: {entry.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 