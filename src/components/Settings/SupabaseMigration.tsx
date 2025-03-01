import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, Box, Alert, CircularProgress, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { CheckCircle, Error, Info, ArrowForward } from '@mui/icons-material';
import { DexieToSupabaseMigrationService } from '../../services/migration/dexie-to-supabase.service';
import { checkSupabaseConnection } from '../../lib/supabase';

const migrationService = new DexieToSupabaseMigrationService();

export const SupabaseMigration: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unchecked' | 'connected' | 'error'>('unchecked');
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'in_progress' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [migrationResults, setMigrationResults] = useState<Array<{ table: string; success: boolean; message: string }>>([]);

  // Vérifier la connexion à Supabase
  const checkConnection = async () => {
    setIsLoading(true);
    setMessage('Vérification de la connexion à Supabase...');
    
    try {
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
      setMessage(isConnected 
        ? 'Connexion à Supabase établie avec succès.' 
        : 'Erreur de connexion à Supabase. Vérifiez vos identifiants dans le fichier .env');
    } catch (error) {
      setConnectionStatus('error');
      setMessage(`Erreur lors de la vérification de la connexion: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Migrer les données vers Supabase
  const migrateData = async () => {
    if (connectionStatus !== 'connected') {
      setMessage('Veuillez d\'abord vérifier la connexion à Supabase');
      return;
    }

    setIsLoading(true);
    setMigrationStatus('in_progress');
    setMessage('Migration des données en cours...');
    setMigrationResults([]);

    try {
      // Migrer les données table par table pour avoir un retour détaillé
      const tables = [
        { name: 'Animaux', method: migrationService.migratePets.bind(migrationService) },
        { name: 'Rendez-vous', method: migrationService.migrateAppointments.bind(migrationService) },
        { name: 'Traitements', method: migrationService.migrateTreatments.bind(migrationService) },
        { name: 'Mesures de poids', method: migrationService.migrateWeightMeasurements.bind(migrationService) },
        { name: 'Toilettage', method: migrationService.migrateGrooming.bind(migrationService) },
        { name: 'Événements de santé', method: migrationService.migrateHealthEvents.bind(migrationService) },
        { name: 'Aliments', method: migrationService.migrateFoods.bind(migrationService) },
        { name: 'Vétérinaires', method: migrationService.migrateVeterinarians.bind(migrationService) }
      ];

      const results = [];
      
      for (const table of tables) {
        setMessage(`Migration de la table ${table.name} en cours...`);
        const result = await table.method();
        results.push({
          table: table.name,
          success: result.success,
          message: result.message
        });
        setMigrationResults([...results]);
      }

      const hasErrors = results.some(r => !r.success);
      setMigrationStatus(hasErrors ? 'error' : 'success');
      setMessage(hasErrors 
        ? 'La migration a rencontré des erreurs. Consultez les détails ci-dessous.' 
        : 'Migration des données vers Supabase terminée avec succès !');
    } catch (error) {
      setMigrationStatus('error');
      setMessage(`Erreur lors de la migration: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Migration vers Supabase
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Cette fonctionnalité vous permet de migrer toutes vos données locales vers Supabase, 
          une plateforme de base de données cloud. Cela permettra de synchroniser vos données 
          entre différents appareils et d'avoir une sauvegarde en ligne.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Étape 1: Vérifier la connexion à Supabase
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button 
              variant="outlined" 
              onClick={checkConnection} 
              disabled={isLoading || connectionStatus === 'connected'}
              startIcon={connectionStatus === 'connected' ? <CheckCircle color="success" /> : <Info />}
              sx={{ mr: 2 }}
            >
              Vérifier la connexion
            </Button>
            
            {connectionStatus === 'connected' && (
              <Typography variant="body2" color="success.main">
                Connecté à Supabase
              </Typography>
            )}
            
            {connectionStatus === 'error' && (
              <Typography variant="body2" color="error">
                Erreur de connexion
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Étape 2: Migrer les données
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={migrateData} 
            disabled={isLoading || connectionStatus !== 'connected'}
            startIcon={<ArrowForward />}
            sx={{ mb: 2 }}
          >
            Migrer les données vers Supabase
          </Button>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2">{message}</Typography>
          </Box>
        )}

        {!isLoading && message && (
          <Alert 
            severity={
              migrationStatus === 'success' ? 'success' : 
              migrationStatus === 'error' ? 'error' : 
              connectionStatus === 'connected' ? 'success' :
              connectionStatus === 'error' ? 'error' : 'info'
            }
            sx={{ mb: 3 }}
          >
            {message}
          </Alert>
        )}

        {migrationResults.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Résultats de la migration
            </Typography>
            
            <List>
              {migrationResults.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {result.success ? <CheckCircle color="success" /> : <Error color="error" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={result.table} 
                      secondary={result.message}
                      primaryTypographyProps={{
                        fontWeight: result.success ? 'normal' : 'bold'
                      }}
                    />
                  </ListItem>
                  {index < migrationResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}; 