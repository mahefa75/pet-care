import Dexie, { Table } from 'dexie';
import { Pet, WeightMeasurement } from '../types/pet';
import { Appointment } from '../types/appointment';
import { Treatment, Reminder } from '../types/medical';
import { GroomingRecord } from '../services/grooming.service';
import { HealthEvent } from '../services/healthEvent.service';
import { Food } from '../types/food';
import { SyncInfo, SyncLogEntry, SyncQueue, TableChange } from '../types/sync';
import { generateDataHash } from '../utils/hash';

export class PetCareDB extends Dexie {
  pets!: Table<Pet, number>;
  appointments!: Table<Appointment, number>;
  treatments!: Table<Treatment, number>;
  reminders!: Table<Reminder, number>;
  weightMeasurements!: Table<WeightMeasurement, number>;
  grooming!: Table<GroomingRecord, number>;
  healthEvents!: Table<HealthEvent, number>;
  foods!: Table<Food, number>;
  syncInfo!: Table<SyncInfo, 1>;
  syncLog!: Table<SyncLogEntry, number>;
  syncQueue!: Table<SyncQueue, number>;

  constructor() {
    super('petcare');
    
    this.version(3).stores({
      pets: '++id, name, species, status, ownerId',
      appointments: '++id, petId, date, status',
      treatments: '++id, petId, type, date, nextDueDate',
      reminders: '++id, petId, treatmentId, dueDate, status',
      weightMeasurements: '++id, petId, date',
      grooming: '++id, petId, date, type, nextAppointment',
      healthEvents: '++id, petId, date, type, severity, resolved',
      foods: '++id, name, type, brand',
      syncInfo: 'id,lastUpdate,status',
      syncLog: '++id,timestamp,operation,status',
      syncQueue: '++id,createdAt,status'
    });

    // Configurer le middleware immédiatement après la définition des tables
    this.setupSyncMiddleware();
  }

  async initialize() {
    try {
      // S'assurer que la base de données est ouverte
      await this.open();
      
      // Initialiser la table syncInfo si elle est vide
      const syncInfo = await this.syncInfo.get(1);
      if (!syncInfo) {
        const dataHash = await generateDataHash(this);
        await this.syncInfo.put({
          id: 1,
          lastUpdate: new Date(),
          dataHash,
          status: 'idle'
        });
      }
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async updateSyncInfo() {
    try {
      const dataHash = await generateDataHash(this);
      const syncInfo: SyncInfo = {
        id: 1,
        lastUpdate: new Date(),
        dataHash,
        status: 'idle'
      };
      await this.syncInfo.put(syncInfo);
      return syncInfo;
    } catch (error) {
      console.error('Error updating sync info:', error);
      throw error;
    }
  }

  private setupSyncMiddleware() {
    const excludedTables = ['syncInfo', 'syncLog', 'syncQueue'];
    const self = this;
    
    this.use({
      stack: 'dbcore',
      name: 'syncMiddleware',
      create(downlevel) {
        return {
          ...downlevel,
          table(tableName) {
            const table = downlevel.table(tableName);
            return {
              ...table,
              mutate: async req => {
                const res = await table.mutate(req);
                
                if (!excludedTables.includes(tableName) && req.type !== 'deleteRange') {
                  const changes: TableChange[] = [];
                  
                  if (req.type === 'add' || req.type === 'put') {
                    const primaryKey = res.results?.[0];
                    if (primaryKey !== undefined) {
                      changes.push({
                        tableName,
                        operation: req.type === 'add' ? 'create' : 'update',
                        timestamp: new Date(),
                        recordId: primaryKey,
                        changes: req.values?.[0]
                      });
                    }
                  } else if (req.type === 'delete') {
                    changes.push({
                      tableName,
                      operation: 'delete',
                      timestamp: new Date(),
                      recordId: req.keys[0]
                    });
                  }

                  if (changes.length > 0) {
                    try {
                      // Vérifier si nous sommes déjà dans une transaction
                      const inTransaction = self.isInTransaction;
                      
                      // Si nous sommes dans une transaction, mettre à jour directement
                      if (inTransaction) {
                        const dataHash = await generateDataHash(self);
                        await self.syncInfo.put({
                          id: 1,
                          lastUpdate: new Date(),
                          dataHash,
                          status: 'idle'
                        });
                        
                        await self.syncQueue.add({
                          changes,
                          status: 'pending',
                          createdAt: new Date()
                        });
                      } else {
                        // Si nous ne sommes pas dans une transaction, en créer une nouvelle
                        await self.transaction('rw', ['syncInfo', 'syncQueue'], async () => {
                          await self.updateSyncInfo();
                          await self.syncQueue.add({
                            changes,
                            status: 'pending',
                            createdAt: new Date()
                          });
                        });
                      }
                    } catch (error) {
                      console.error('Error handling database changes:', error);
                    }
                  }
                }
                return res;
              }
            };
          }
        };
      }
    });
  }
}

// Créer une instance unique de la base de données
export const db = new PetCareDB();

// Initialiser la base de données de manière asynchrone
(async () => {
  try {
    await db.initialize();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
})();