import React, { useState } from 'react';
import { DataBackup } from '../components/Settings/DataBackup';
import { FoodManagement } from '../components/Settings/FoodManagement';
import { FirebaseSync } from '../components/Settings/FirebaseSync';
import { GeneralSettings } from '../components/Settings/GeneralSettings';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('backup');

  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'backup', label: 'Sauvegarde des données' },
    { id: 'firebase', label: 'Synchronisation Firebase' },
    { id: 'food', label: 'Alimentations' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
      
      <div className="mb-4 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          {tabs.map((tab) => (
            <li key={tab.id} className="mr-2">
              <button
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'backup' && <DataBackup />}
        {activeTab === 'firebase' && <FirebaseSync />}
        {activeTab === 'food' && <FoodManagement />}
      </div>
    </div>
  );
}; 