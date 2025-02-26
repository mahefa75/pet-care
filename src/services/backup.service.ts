import { db } from '../lib/db';

export class BackupService {
  async exportData(): Promise<string> {
    try {
      // Récupérer toutes les données de chaque table
      const backup = {
        pets: await db.pets.toArray(),
        appointments: await db.appointments.toArray(),
        treatments: await db.treatments.toArray(),
        reminders: await db.reminders.toArray(),
        weightMeasurements: await db.weightMeasurements.toArray(),
        grooming: await db.grooming.toArray(),
        healthEvents: await db.healthEvents.toArray(),
        foods: await db.foods.toArray()
      };

      // Convertir les dates en format ISO pour une meilleure sérialisation
      const processedBackup = this.processDatesForExport(backup);

      // Créer le fichier de sauvegarde
      const backupString = JSON.stringify(processedBackup, null, 2);
      return backupString;
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
      throw new Error('Erreur lors de l\'export des données');
    }
  }

  async importData(backupString: string): Promise<void> {
    try {
      const backup = JSON.parse(backupString);
      const processedBackup = this.processDatesForImport(backup);

      // Vider toutes les tables existantes
      await db.transaction('rw', 
        [db.pets, db.appointments, db.treatments, db.reminders, db.weightMeasurements, db.grooming, db.healthEvents, db.foods], 
        async () => {
          await Promise.all([
            db.pets.clear(),
            db.appointments.clear(),
            db.treatments.clear(),
            db.reminders.clear(),
            db.weightMeasurements.clear(),
            db.grooming.clear(),
            db.healthEvents.clear(),
            db.foods.clear()
          ]);

          // Importer les nouvelles données
          await Promise.all([
            processedBackup.pets ? db.pets.bulkAdd(processedBackup.pets) : Promise.resolve(),
            processedBackup.appointments ? db.appointments.bulkAdd(processedBackup.appointments) : Promise.resolve(),
            processedBackup.treatments ? db.treatments.bulkAdd(processedBackup.treatments) : Promise.resolve(),
            processedBackup.reminders ? db.reminders.bulkAdd(processedBackup.reminders) : Promise.resolve(),
            processedBackup.weightMeasurements ? db.weightMeasurements.bulkAdd(processedBackup.weightMeasurements) : Promise.resolve(),
            processedBackup.grooming ? db.grooming.bulkAdd(processedBackup.grooming) : Promise.resolve(),
            processedBackup.healthEvents ? db.healthEvents.bulkAdd(processedBackup.healthEvents) : Promise.resolve(),
            processedBackup.foods ? db.foods.bulkAdd(processedBackup.foods) : Promise.resolve()
          ]);
        }
      );
    } catch (error) {
      console.error('Erreur lors de l\'import des données:', error);
      throw new Error('Erreur lors de l\'import des données');
    }
  }

  private processDatesForExport(data: any): any {
    return JSON.parse(JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }));
  }

  private processDatesForImport(data: any): any {
    const dateProperties = ['date', 'birthDate', 'createdAt', 'updatedAt', 'startDate', 'endDate', 'dueDate', 'nextDueDate'];
    
    const processObject = (obj: any) => {
      for (const key in obj) {
        if (dateProperties.includes(key) && typeof obj[key] === 'string') {
          obj[key] = new Date(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          processObject(obj[key]);
        }
      }
      return obj;
    };

    return processObject(JSON.parse(JSON.stringify(data)));
  }
}

export const backupService = new BackupService(); 