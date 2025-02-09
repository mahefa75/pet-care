import React, { useState } from 'react';
import { Button, Alert, CircularProgress, Box, Typography, Divider } from '@mui/material';
import { backupService } from '../../services/backup.service';
import { migrationService } from '../../services/migration.service';

export const DataBackup: React.FC = () => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
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

  const handleMigration = async () => {
    try {
      setMigrationStatus('migrating');
      setErrorMessage('');

      // Effectuer la migration
      await migrationService.migrateAllData();
      
      // Nettoyer les anciennes bases de données
      await migrationService.cleanupOldDatabases();

      setMigrationStatus('success');
      
      // Recharger la page après un court délai pour montrer le message de succès
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
      setMigrationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de la migration des données');
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
    <Box>
      <Typography variant="h6" gutterBottom>
        Sauvegarde et Migration des Données
      </Typography>

      {/* Section Sauvegarde */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Sauvegarde
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Exportez vos données pour les sauvegarder en toute sécurité.
        </Typography>

        {exportStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Export réussi !
          </Alert>
        )}

        {exportStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleExport}
          disabled={exportStatus !== 'idle'}
          sx={{ mr: 2 }}
        >
          Exporter les données
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Section Migration */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Migration des Bases de Données
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Cette opération va consolider toutes les bases de données locales en une seule.
          Il est fortement recommandé de faire une sauvegarde avant de procéder.
        </Typography>

        {migrationStatus === 'migrating' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography>Migration en cours...</Typography>
          </Box>
        )}

        {migrationStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Migration terminée avec succès !
          </Alert>
        )}

        {migrationStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleMigration}
          disabled={migrationStatus === 'migrating'}
          color="warning"
        >
          Démarrer la Migration
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

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
    </Box>
  );
}; 