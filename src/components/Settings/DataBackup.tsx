import React, { useState } from 'react';
import { backupService } from '../../services/backup.service';

export const DataBackup: React.FC = () => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleExport = async () => {
    try {
      setExportStatus('idle');
      setErrorMessage('');
      
      const backupData = await backupService.exportData();
      
      // Créer un blob avec les données
      const blob = new Blob([backupData], { type: 'application/json' });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nom du fichier avec la date actuelle
      const date = new Date().toISOString().split('T')[0];
      link.download = `petcare_backup_${date}.json`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setExportStatus('error');
      setErrorMessage('Erreur lors de l\'export des données');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setImportStatus('idle');
      setErrorMessage('');

      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          await backupService.importData(content);
          setImportStatus('success');
          setTimeout(() => setImportStatus('idle'), 3000);
          
          // Recharger la page pour afficher les nouvelles données
          window.location.reload();
        } catch (error) {
          console.error('Erreur lors de l\'import:', error);
          setImportStatus('error');
          setErrorMessage('Erreur lors de l\'import des données');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error);
      setImportStatus('error');
      setErrorMessage('Erreur lors de la lecture du fichier');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Sauvegarde des données</h2>
      
      <div className="space-y-8">
        {/* Export Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Exporter les données</h3>
          <p className="text-gray-600 mb-4">
            Téléchargez une copie de toutes vos données pour les sauvegarder.
          </p>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Exporter les données
          </button>
          {exportStatus === 'success' && (
            <p className="mt-2 text-green-600">Export réussi !</p>
          )}
        </div>

        {/* Import Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Importer des données</h3>
          <p className="text-gray-600 mb-4">
            Restaurez vos données à partir d'une sauvegarde précédente.
            <br />
            <span className="text-amber-600">
              Attention : Cette action remplacera toutes les données existantes.
            </span>
          </p>
          <label className="inline-block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            Importer une sauvegarde
          </label>
          {importStatus === 'success' && (
            <p className="mt-2 text-green-600">Import réussi !</p>
          )}
        </div>

        {/* Error Display */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}; 