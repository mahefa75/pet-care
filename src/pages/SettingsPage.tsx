import React from 'react';
import { DataBackup } from '../components/Settings/DataBackup';

export const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
      
      <div className="grid gap-8">
        {/* Section de sauvegarde des données */}
        <DataBackup />
        
        {/* Autres sections de paramètres peuvent être ajoutées ici */}
      </div>
    </div>
  );
}; 