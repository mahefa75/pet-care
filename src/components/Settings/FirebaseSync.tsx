import React from 'react';
import { SyncButton } from '../SyncButton';

export const FirebaseSync: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Synchronisation Firebase</h2>
      <p className="text-gray-600 mb-6">
        Synchronisez vos données locales avec Firebase pour les sauvegarder en ligne.
        Cette action remplacera toutes les données existantes dans Firebase par vos données locales actuelles.
      </p>
      <SyncButton />
    </div>
  );
}; 