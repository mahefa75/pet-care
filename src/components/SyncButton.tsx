import React, { useState } from 'react';
import { SyncService } from '../services/sync.service';
import { useSyncStore } from '../stores/syncStore';

export const SyncButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const syncService = new SyncService();
  const setIsSyncing = useSyncStore(state => state.setIsSyncing);

  const handleSync = async () => {
    setIsLoading(true);
    setMessage(null);
    setIsSyncing(true);

    try {
      const result = await syncService.syncToFirebase();
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ 
        text: 'Une erreur est survenue lors de la synchronisation', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
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
          'Synchroniser vers Firebase'
        )}
      </button>

      {message && (
        <div
          className={`
            mt-2 px-4 py-2 rounded-md text-sm
            ${message.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'}
          `}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}; 