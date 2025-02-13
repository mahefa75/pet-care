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
                console.log(`[Middleware] Mutation request for table ${tableName}:`, req);

                // Si c'est une table exclue ou une opération de deleteRange, passer directement
                if (excludedTables.includes(tableName) || req.type === 'deleteRange') {
                  console.log(`[Middleware] Skipping excluded table or deleteRange operation`);
                  return table.mutate(req);
                }

                // Effectuer la mutation
                const res = await table.mutate(req);
                console.log(`[Middleware] Mutation result:`, res);

                // Gérer la synchronisation si nous sommes dans une transaction appropriée
                const results = res.results || [];
                if (results.length > 0) {
                  console.log(`[Middleware] Processing results:`, results);
                  const changes: TableChange[] = [];
                  
                  if (req.type === 'add' || req.type === 'put') {
                    const primaryKey = results[0];
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
                    console.log(`[Middleware] Changes to sync:`, changes);
                    const currentTransaction = (Dexie as any).currentTransaction;
                    console.log(`[Middleware] Current transaction:`, currentTransaction);

                    if (currentTransaction) {
                      const tables = currentTransaction.tables || [];
                      const tableNames = tables.map((t: any) => t.name);
                      console.log(`[Middleware] Tables in transaction:`, tableNames);

                      const canUpdateSync = tableNames.includes('syncInfo') && tableNames.includes('syncQueue');
                      console.log(`[Middleware] Can update sync:`, canUpdateSync);

                      if (canUpdateSync) {
                        console.log(`[Middleware] Updating sync info and queue`);
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
                        console.log(`[Middleware] Sync update completed`);
                      } else {
                        console.log('Skipping sync update - Required tables not in transaction:', {
                          required: ['syncInfo', 'syncQueue'],
                          available: tableNames
                        });
                      }
                    } else {
                      console.log(`[Middleware] No active transaction found`);
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