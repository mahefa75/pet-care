import { db } from '../lib/db';
import { db as firestore } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { compressImage } from '../utils/imageCompressor';
import { generateDataHash } from '../utils/hash';
import { useSyncStore } from '../stores/syncStore';
import { SyncInfo, SyncLogEntry, TableChange } from '../types/sync';

export class EnhancedSyncService {
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

  private async processSyncQueue() {
    const pendingQueue = await db.syncQueue
      .where('status')
      .equals('pending')
      .toArray();

    if (pendingQueue.length === 0) return;

    // Mettre à jour le nombre de changements en attente
    useSyncStore.getState().setPendingChanges(pendingQueue.length);

    for (const queue of pendingQueue) {
      try {
        await db.syncQueue.update(queue.id!, { status: 'processing' });
        
        // Regrouper les changements par table
        const changesByTable = queue.changes.reduce((acc, change) => {
          if (!acc[change.tableName]) acc[change.tableName] = [];
          acc[change.tableName].push(change);
          return acc;
        }, {} as Record<string, TableChange[]>);

        // Traiter les changements table par table
        for (const [tableName, changes] of Object.entries(changesByTable)) {
          const collectionRef = collection(firestore, tableName);
          
          for (const change of changes) {
            const docRef = doc(collectionRef, change.recordId.toString());
            
            switch (change.operation) {
              case 'create':
              case 'update':
                const processedData = await this.processItemForFirebase(change.changes!);
                await setDoc(docRef, processedData);
                break;
              case 'delete':
                await deleteDoc(docRef);
                break;
            }
          }
        }

        // Marquer comme terminé
        await db.syncQueue.update(queue.id!, {
          status: 'completed',
          processedAt: new Date()
        });

        await this.logSync({
          operation: 'push',
          status: 'success',
          details: `Processed ${queue.changes.length} changes`,
          affectedTables: Object.keys(changesByTable)
        });

      } catch (error) {
        console.error('Error processing sync queue:', error);
        await db.syncQueue.update(queue.id!, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        await this.logSync({
          operation: 'push',
          status: 'error',
          details: 'Error processing sync queue',
          affectedTables: queue.changes.map(c => c.tableName),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Mettre à jour le nombre de changements en attente
    const remainingQueue = await db.syncQueue
      .where('status')
      .equals('pending')
      .count();
    useSyncStore.getState().setPendingChanges(remainingQueue);
  }

  async synchronize() {
    try {
      useSyncStore.getState().setIsSyncing(true);
      useSyncStore.getState().setSyncStatus('syncing');

      // Vérifier la connexion
      if (!navigator.onLine) {
        useSyncStore.getState().setSyncStatus('offline');
        throw new Error('Pas de connexion Internet');
      }

      // Obtenir les informations de synchronisation
      const localSync = await db.syncInfo.get(1);
      const firebaseSync = await getDoc(doc(firestore, 'syncInfo', '1'));

      if (!localSync) {
        // Première synchronisation
        await this.pushToFirebase();
      } else if (!firebaseSync.exists()) {
        // Firebase vide, pousser les données locales
        await this.pushToFirebase();
      } else {
        const firebaseSyncData = firebaseSync.data() as SyncInfo;
        
        // Comparer les hashes
        if (localSync.dataHash !== firebaseSyncData.dataHash) {
          // Si les dates sont différentes, utiliser la plus récente
          if (localSync.lastUpdate > new Date(firebaseSyncData.lastUpdate)) {
            await this.pushToFirebase();
          } else {
            await this.pullFromFirebase();
          }
        }
      }

      // Traiter la file d'attente
      await this.processSyncQueue();

      useSyncStore.getState().setSyncStatus('idle');
      useSyncStore.getState().setLastSync(new Date());
      useSyncStore.getState().setLastError(null);

    } catch (error) {
      console.error('Sync error:', error);
      useSyncStore.getState().setSyncStatus('error');
      useSyncStore.getState().setLastError(error instanceof Error ? error.message : 'Unknown error');
      
      await this.logSync({
        operation: 'pull',
        status: 'error',
        details: 'Synchronization failed',
        affectedTables: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      });

    } finally {
      useSyncStore.getState().setIsSyncing(false);
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
    
    // Mettre à jour sur Firebase
    await setDoc(doc(firestore, 'syncInfo', '1'), {
      ...syncInfo,
      lastUpdate: syncInfo.lastUpdate.toISOString() // Convertir la date pour Firestore
    });

    return syncInfo;
  }

  private async pushToFirebase() {
    // Commencer par syncInfo pour s'assurer qu'elle existe sur Firebase
    await this.updateSyncInfo();

    // Synchroniser les autres collections
    for (const { name, dbTable } of this.collections) {
      // Sauter syncInfo car déjà traité
      if (name === 'syncInfo') continue;

      const data = await dbTable.toArray();
      const collectionRef = collection(firestore, name);
      
      // Supprimer les documents existants
      const snapshot = await getDocs(collectionRef);
      await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));

      // Ajouter les nouvelles données
      await Promise.all(data.map(async item => {
        const processedItem = await this.processItemForFirebase(item);
        await setDoc(doc(collectionRef, (item as { id: number }).id.toString()), processedItem);
      }));
    }

    await this.logSync({
      operation: 'push',
      status: 'success',
      details: 'Full push to Firebase completed',
      affectedTables: this.collections.map(c => c.name)
    });
  }

  private async pullFromFirebase() {
    // Commencer par syncInfo
    const syncDoc = await getDoc(doc(firestore, 'syncInfo', '1'));
    if (!syncDoc.exists()) {
      throw new Error('SyncInfo not found on Firebase');
    }

    const remoteSyncInfo = syncDoc.data() as SyncInfo;
    await db.syncInfo.put({
      ...remoteSyncInfo,
      lastUpdate: new Date(remoteSyncInfo.lastUpdate) // Convertir la chaîne ISO en Date
    });

    // Synchroniser les autres collections
    for (const { name, dbTable } of this.collections) {
      // Sauter syncInfo car déjà traité
      if (name === 'syncInfo') continue;

      const snapshot = await getDocs(collection(firestore, name));
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: parseInt(doc.id) }));
      
      // Vider la table locale
      await dbTable.clear();
      
      // Ajouter les données de Firebase
      const table = dbTable as { add(item: any): Promise<any> };
      for (const item of data) {
        await table.add(item);
      }
    }

    await this.logSync({
      operation: 'pull',
      status: 'success',
      details: 'Full pull from Firebase completed',
      affectedTables: this.collections.map(c => c.name)
    });
  }

  private async processItemForFirebase(item: any) {
    const processed = { ...item };
    
    // Gérer les URLs de photos
    if (processed.photoUrl && processed.photoUrl.length > 0) {
      try {
        if (processed.photoUrl.startsWith('data:image')) {
          processed.photoUrl = await compressImage(processed.photoUrl);
        } else {
          delete processed.photoUrl;
        }
      } catch (error) {
        console.error('Error processing photo:', error);
        delete processed.photoUrl;
      }
    }
    
    // Convertir les dates
    for (const [key, value] of Object.entries(processed)) {
      if (value instanceof Date) {
        processed[key] = value.toISOString();
      }
      if (value === undefined) {
        processed[key] = null;
      }
    }

    return processed;
  }
} 