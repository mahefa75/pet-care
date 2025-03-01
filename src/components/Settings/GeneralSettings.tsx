import React, { useState, useEffect } from 'react';
import { configService } from '../../services/config.service';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface ApiKeys {
  VITE_GEMINI_API_KEY: string;
}

export const GeneralSettings: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    VITE_GEMINI_API_KEY: ''
  });

  const [configStatus, setConfigStatus] = useState({
    gemini: false
  });

  const [testStatus, setTestStatus] = useState({
    gemini: { status: 'idle' as 'idle' | 'testing' | 'success' | 'error', message: '' }
  });

  useEffect(() => {
    loadConfiguration();
    updateConfigStatus();
  }, []);

  const loadConfiguration = () => {
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  };

  const updateConfigStatus = () => {
    const status = configService.getConfigStatus();
    setConfigStatus(status);
  };

  const handleChange = (key: keyof ApiKeys, value: string) => {
    const newApiKeys = { ...apiKeys, [key]: value };
    setApiKeys(newApiKeys);
    localStorage.setItem('apiKeys', JSON.stringify(newApiKeys));
    setTimeout(() => {
      updateConfigStatus();
    }, 100);
  };

  const handleExportConfig = () => {
    const config = JSON.stringify(apiKeys, null, 2);
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pet-care-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedConfig = JSON.parse(content);
          setApiKeys(importedConfig);
          localStorage.setItem('apiKeys', JSON.stringify(importedConfig));
          updateConfigStatus();
        } catch (error) {
          alert('Erreur lors de l\'import du fichier de configuration');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetConfig = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser la configuration ? Cette action est irréversible.')) {
      localStorage.removeItem('apiKeys');
      setApiKeys({
        VITE_GEMINI_API_KEY: ''
      });
      updateConfigStatus();
    }
  };

  const renderStatusIcon = (isConfigured: boolean) => {
    return isConfigured ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">État de la configuration</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Gemini</span>
            {renderStatusIcon(configStatus.gemini)}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={handleExportConfig}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          Exporter la configuration
        </button>
        <label className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 cursor-pointer">
          Importer la configuration
          <input
            type="file"
            accept=".json"
            onChange={handleImportConfig}
            className="hidden"
          />
        </label>
        <button
          onClick={handleResetConfig}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
        >
          Réinitialiser
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Configuration Gemini</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clé API Gemini
            </label>
            <input
              type="password"
              value={apiKeys.VITE_GEMINI_API_KEY}
              onChange={(e) => handleChange('VITE_GEMINI_API_KEY', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 