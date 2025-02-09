import React, { useState } from 'react';
import { Button, Alert, CircularProgress, Box, Typography } from '@mui/material';
import { migrationService } from '../../services/migration.service';

export const DatabaseMigration: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleMigration = async () => {
    try {
      setStatus('migrating');
      setErrorMessage('');

      // Effectuer la migration
      await migrationService.migrateAllData();
      
      // Nettoyer les anciennes bases de données
      await migrationService.cleanupOldDatabases();

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de la migration des données');
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Migration de la base de données
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cette opération va consolider toutes les bases de données locales en une seule.
        Assurez-vous d'avoir une sauvegarde de vos données avant de procéder.
      </Typography>

      {status === 'migrating' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Migration en cours...</Typography>
        </Box>
      )}

      {status === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Migration terminée avec succès !
        </Alert>
      )}

      {status === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleMigration}
        disabled={status === 'migrating'}
      >
        Démarrer la migration
      </Button>
    </Box>
  );
}; 