import Dexie from 'dexie';
import { db } from '../lib/db';

class MigrationService {
  private oldDb: Dexie;

  constructor() {
    this.oldDb = new Dexie('petCareDB');
    this.oldDb.version(1).stores({
      pets: '++id, name, species, breed',
      weights: '++id, petId, date, weight',
      treatments: '++id, petId, date, type',
      foods: '++id, name, type, brand'
    });
    this.oldDb.version(2).stores({
      grooming: '++id, petId, date, type, nextAppointment',
      healthEvents: '++id, petId, date, type, severity, resolved'
    });
  }

  async migrateAllData(): Promise<void> {
    try {
      // Migrer les données de chaque table séquentiellement
      await this.migratePets();
      await this.migrateWeights();
      await this.migrateTreatments();
      await this.migrateFoods();
      await this.migrateGrooming();
      await this.migrateHealthEvents();

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Error during migration:', error);
      throw new Error('Migration failed');
    }
  }

  private async migratePets(): Promise<void> {
    try {
      const pets = await this.oldDb.table('pets').toArray();
      if (pets.length > 0) {
        await db.pets.bulkAdd(pets);
      }
    } catch (error) {
      console.error('Error migrating pets:', error);
      throw error;
    }
  }

  private async migrateWeights(): Promise<void> {
    try {
      const weights = await this.oldDb.table('weights').toArray();
      if (weights.length > 0) {
        await db.weightMeasurements.bulkAdd(weights);
      }
    } catch (error) {
      console.error('Error migrating weights:', error);
      throw error;
    }
  }

  private async migrateTreatments(): Promise<void> {
    try {
      const treatments = await this.oldDb.table('treatments').toArray();
      if (treatments.length > 0) {
        await db.treatments.bulkAdd(treatments);
      }
    } catch (error) {
      console.error('Error migrating treatments:', error);
      throw error;
    }
  }

  private async migrateFoods(): Promise<void> {
    try {
      const foods = await this.oldDb.table('foods').toArray();
      if (foods.length > 0) {
        await db.foods.bulkAdd(foods);
      }
    } catch (error) {
      console.error('Error migrating foods:', error);
      throw error;
    }
  }

  private async migrateGrooming(): Promise<void> {
    try {
      const grooming = await this.oldDb.table('grooming').toArray();
      if (grooming.length > 0) {
        await db.grooming.bulkAdd(grooming);
      }
    } catch (error) {
      console.error('Error migrating grooming:', error);
      throw error;
    }
  }

  private async migrateHealthEvents(): Promise<void> {
    try {
      const healthEvents = await this.oldDb.table('healthEvents').toArray();
      if (healthEvents.length > 0) {
        await db.healthEvents.bulkAdd(healthEvents);
      }
    } catch (error) {
      console.error('Error migrating health events:', error);
      throw error;
    }
  }

  async cleanupOldDatabases(): Promise<void> {
    try {
      // Supprimer les anciennes bases de données
      await this.oldDb.delete();
      
      // Supprimer keyval-store si elle existe
      const keyvalDb = new Dexie('keyval-store');
      await keyvalDb.delete();

      console.log('Old databases cleaned up successfully');
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw new Error('Cleanup failed');
    }
  }
}

export const migrationService = new MigrationService(); 