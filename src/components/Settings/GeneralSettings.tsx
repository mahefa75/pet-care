import React, { useState, useEffect } from 'react';
import { configService } from '../../services/config.service';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { reinitializeFirebase } from '../../lib/firebase';

interface ApiKeys {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_MEASUREMENT_ID: string;
  VITE_GEMINI_API_KEY: string;
}

export const GeneralSettings: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    VITE_FIREBASE_API_KEY: '',
    VITE_FIREBASE_AUTH_DOMAIN: '',
    VITE_FIREBASE_PROJECT_ID: '',
    VITE_FIREBASE_STORAGE_BUCKET: '',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '',
    VITE_FIREBASE_APP_ID: '',
    VITE_FIREBASE_MEASUREMENT_ID: '',
    VITE_GEMINI_API_KEY: ''
  });

  const [configStatus, setConfigStatus] = useState({
    firebase: false,
    gemini: false
  });

  const [testStatus, setTestStatus] = useState({
    firebase: { status: 'idle' as 'idle' | 'testing' | 'success' | 'error', message: '' },
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
      if (key.startsWith('VITE_FIREBASE')) {
        reinitializeFirebase();
      }
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
          reinitializeFirebase();
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
        VITE_FIREBASE_API_KEY: '',
        VITE_FIREBASE_AUTH_DOMAIN: '',
        VITE_FIREBASE_PROJECT_ID: '',
        VITE_FIREBASE_STORAGE_BUCKET: '',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '',
        VITE_FIREBASE_APP_ID: '',
        VITE_FIREBASE_MEASUREMENT_ID: '',
        VITE_GEMINI_API_KEY: ''
      });
      updateConfigStatus();
      reinitializeFirebase();
    }
  };

  const testFirebaseConnection = async () => {
    setTestStatus(prev => ({
      ...prev,
      firebase: { status: 'testing', message: 'Test en cours...' }
    }));
    try {
      await configService.testFirebaseConnection();
      setTestStatus(prev => ({
        ...prev,
        firebase: { status: 'success', message: 'Connexion réussie' }
      }));
    } catch (error) {
      setTestStatus(prev => ({
        ...prev,
        firebase: { status: 'error', message: 'Échec de la connexion' }
      }));
    }
  };

  const testGeminiConnection = async () => {
    setTestStatus(prev => ({
      ...prev,
      gemini: { status: 'testing', message: 'Test en cours...' }
    }));
    try {
      await configService.testGeminiConnection();
      setTestStatus(prev => ({
        ...prev,
        gemini: { status: 'success', message: 'Connexion réussie' }
      }));
    } catch (error) {
      setTestStatus(prev => ({
        ...prev,
        gemini: { status: 'error', message: 'Échec de la connexion' }
      }));
    }
  };

  const renderStatusIcon = (isConfigured: boolean) => {
    return isConfigured ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
    );
  };

  const renderTestStatus = (service: 'firebase' | 'gemini') => {
    const status = testStatus[service];
    if (status.status === 'idle') return null;
    
    const colors = {
      testing: 'text-blue-600',
      success: 'text-green-600',
      error: 'text-red-600'
    };

    return (
      <span className={`text-sm ml-2 ${colors[status.status]}`}>
        {status.message}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">État de la configuration</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Firebase</span>
            {renderStatusIcon(configStatus.firebase)}
          </div>
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
          <h2 className="text-xl font-semibold">Configuration Firebase</h2>
          <button
            onClick={testFirebaseConnection}
            disabled={!configStatus.firebase || testStatus.firebase.status === 'testing'}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tester la connexion
            {renderTestStatus('firebase')}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={apiKeys.VITE_FIREBASE_API_KEY}
              onChange={(e) => handleChange('VITE_FIREBASE_API_KEY', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auth Domain
            </label>
            <input
              type="text"
              value={apiKeys.VITE_FIREBASE_AUTH_DOMAIN}
              onChange={(e) => handleChange('VITE_FIREBASE_AUTH_DOMAIN', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project ID
            </label>
            <input
              type="text"
              value={apiKeys.VITE_FIREBASE_PROJECT_ID}
              onChange={(e) => handleChange('VITE_FIREBASE_PROJECT_ID', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Storage Bucket
            </label>
            <input
              type="text"
              value={apiKeys.VITE_FIREBASE_STORAGE_BUCKET}
              onChange={(e) => handleChange('VITE_FIREBASE_STORAGE_BUCKET', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Messaging Sender ID
            </label>
            <input
              type="text"
              value={apiKeys.VITE_FIREBASE_MESSAGING_SENDER_ID}
              onChange={(e) => handleChange('VITE_FIREBASE_MESSAGING_SENDER_ID', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App ID
            </label>
            <input
              type="text"
              value={apiKeys.VITE_FIREBASE_APP_ID}
              onChange={(e) => handleChange('VITE_FIREBASE_APP_ID', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Measurement ID
            </label>
            <input
              type="text"
              value={apiKeys.VITE_FIREBASE_MEASUREMENT_ID}
              onChange={(e) => handleChange('VITE_FIREBASE_MEASUREMENT_ID', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Configuration Gemini</h2>
          <button
            onClick={testGeminiConnection}
            disabled={!configStatus.gemini || testStatus.gemini.status === 'testing'}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tester la connexion
            {renderTestStatus('gemini')}
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={apiKeys.VITE_GEMINI_API_KEY}
            onChange={(e) => handleChange('VITE_GEMINI_API_KEY', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <p className="text-sm text-gray-500 mb-4">
          Note: Les modifications sont automatiquement sauvegardées. Un redémarrage de l'application peut être nécessaire pour appliquer certains changements.
        </p>
      </div>
    </div>
  );
}; 