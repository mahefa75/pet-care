import React, { useState } from 'react';
import { DataBackup } from '../components/Settings/DataBackup';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('backup');

  const tabs = [
    { id: 'backup', label: 'Sauvegarde des données' },
    { id: 'general', label: 'Général' },
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

      <div className="mt-4">
        {activeTab === 'backup' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <DataBackup />
          </div>
        )}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-gray-500">Paramètres généraux à venir...</p>
          </div>
        )}
      </div>
    </div>
  );
}; 