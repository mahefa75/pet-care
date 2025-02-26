import { db } from '../lib/db';
import { supabase } from '../lib/supabase';
import { compressImage } from '../utils/imageCompressor';
import { generateDataHash } from '../utils/hash';
import { useSyncStore } from '../stores/syncStore';
import { SyncInfo, SyncLogEntry } from '../types/sync';

export class SupabaseSyncService {
  private collections = [
    { name: 'syncInfo', dbTable: db.syncInfo },
    { name: 'pets', dbTable: db.pets },
    { name: 'appointments', dbTable: db.appointments },
    { name: 'treatments', dbTable: db.treatments },
    { name: 'reminders', dbTable: db.reminders },
    { name: 'weightMeasurements', dbTable: db.weightMeasurements },
    { name: 'grooming', dbTable: db.grooming },
    { name: 'healthEvents', dbTable: db.healthEvents },
    { name: 'foods', dbTable: db.foods }
  ];

  private async logSync(entry: Omit<SyncLogEntry, 'id' | 'timestamp'>) {
    const logEntry: SyncLogEntry = {
      ...entry,
      timestamp: new Date()
    };
    await db.syncLog.add(logEntry);
    useSyncStore.getState().addSyncHistoryEntry(logEntry);
  }

  private async processItemForSupabase(item: any) {
    // Copier l'objet pour ne pas modifier l'original
    const processedItem = { ...item };

    // Traiter les images si présentes
    if (processedItem.photo && typeof processedItem.photo === 'string' && processedItem.photo.startsWith('data:image')) {
      try {
        processedItem.photo = await compressImage(processedItem.photo);
      } catch (error) {
        console.error('Erreur lors de la compression de l\'image:', error);
      }
    }

    // Convertir les dates en format ISO
    for (const [key, value] of Object.entries(processedItem)) {
      if (value instanceof Date) {
        processedItem[key] = value.toISOString();
      }
    }

    return processedItem;
  }

  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '401') {
          throw new Error('Erreur d\'authentification Supabase. Vérifiez vos clés d\'API.');
        }
        if (error.code === '403') {
          throw new Error('Accès refusé. Vérifiez les politiques de sécurité Supabase.');
        }
        return false;
      }
      return true;
    } catch (error) {
      if (error instanceof Error) throw error;
      return false;
    }
  }

  private async updateSyncInfo() {
    const dataHash = await generateDataHash(db);
    const syncInfo: SyncInfo = {
      id: 1,
      lastUpdate: new Date(),
      dataHash,
      status: 'idle'
    };

    // Mettre à jour localement
    await db.syncInfo.put(syncInfo);
    
    // Vérifier si la table existe
    const tableExists = await this.checkTableExists('syncInfo');
    if (!tableExists) {
      console.warn('La table syncInfo n\'existe pas dans Supabase. Veuillez créer les tables nécessaires.');
      throw new Error('Tables Supabase non configurées. Veuillez contacter l\'administrateur.');
    }

    // Mettre à jour sur Supabase
    const { error } = await supabase
      .from('syncInfo')
      .upsert({
        id: '1',
        lastUpdate: syncInfo.lastUpdate.toISOString(),
        dataHash: syncInfo.dataHash,
        status: syncInfo.status
      });

    if (error) {
      if (error.code === '401') {
        throw new Error('Erreur d\'authentification Supabase. Vérifiez vos clés d\'API.');
      }
      if (error.code === '403') {
        throw new Error('Accès refusé. Vérifiez les politiques de sécurité Supabase.');
      }
      throw new Error(`Erreur lors de la mise à jour de syncInfo: ${error.message}`);
    }

    return syncInfo;
  }

  private async pushToSupabase() {
    if (!supabase) {
      throw new Error('Client Supabase non initialisé');
    }

    // Vérifier si toutes les tables existent
    for (const { name } of this.collections) {
      const tableExists = await this.checkTableExists(name);
      if (!tableExists) {
        throw new Error(`La table ${name} n'existe pas dans Supabase. Veuillez créer les tables nécessaires.`);
      }
    }

    // Commencer par syncInfo pour s'assurer qu'elle existe sur Supabase
    await this.updateSyncInfo();

    // Synchroniser les autres collections
    for (const { name, dbTable } of this.collections) {
      if (name === 'syncInfo') continue;

      const data = await dbTable.toArray();
      
      // Supprimer les données existantes
      const { error: deleteError } = await supabase
        .from(name)
        .delete()
        .neq('id', 0); // Supprimer tous les enregistrements

      if (deleteError) {
        throw new Error(`Erreur lors de la suppression des données de ${name}: ${deleteError.message}`);
      }

      // Ajouter les nouvelles données
      for (const item of data) {
        const processedItem = await this.processItemForSupabase(item);
        const { error: insertError } = await supabase
          .from(name)
          .upsert(processedItem);

        if (insertError) {
          throw new Error(`Erreur lors de l'insertion des données dans ${name}: ${insertError.message}`);
        }
      }
    }

    await this.logSync({
      operation: 'push',
      status: 'success',
      details: 'Synchronisation complète vers Supabase terminée',
      affectedTables: this.collections.map(c => c.name)
    });
  }

  public async synchronize() {
    if (!supabase) {
      throw new Error('Client Supabase non initialisé');
    }

    try {
      await this.pushToSupabase();
      return { success: true, message: 'Synchronisation terminée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      await this.logSync({
        operation: 'push',
        status: 'error',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        affectedTables: []
      });
      return { 
        success: false, 
        message: 'Erreur lors de la synchronisation', 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
} 