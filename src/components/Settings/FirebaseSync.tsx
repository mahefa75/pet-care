import React, { useState } from 'react';
import { EnhancedSyncService } from '../../services/enhancedSync.service';
import { SyncStatus } from './SyncStatus';

export const FirebaseSync: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const syncService = new EnhancedSyncService();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncService.synchronize();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Synchronisation Firebase</h2>
        <p className="text-gray-600 mb-6">
          Synchronisez vos données locales avec Firebase pour les sauvegarder en ligne.
          La synchronisation est bidirectionnelle et utilise les horodatages pour résoudre les conflits.
        </p>
        <button
          onClick={handleSync}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded-md text-white font-medium
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}
            transition-colors duration-200
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Synchronisation en cours...
            </div>
          ) : (
            'Synchroniser maintenant'
          )}
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">État de la synchronisation</h3>
        <SyncStatus />
      </div>
    </div>
  );
}; 