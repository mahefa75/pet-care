import Dexie, { Table } from 'dexie';
import { GroomingRecord } from '../services/grooming.service';
import { HealthEvent } from '../services/healthEvent.service';

export class AppDatabase extends Dexie {
  pets!: Table<any>;
  weights!: Table<any>;
  treatments!: Table<any>;
  foods!: Table<any>;
  grooming!: Table<GroomingRecord>;
  healthEvents!: Table<HealthEvent>;

  constructor() {
    super('petCareDB');
    
    this.version(1).stores({
      pets: '++id, name, species, breed',
      weights: '++id, petId, date, weight',
      treatments: '++id, petId, date, type',
      foods: '++id, name, type, brand'
    });

    this.version(2).stores({
      grooming: '++id, petId, date, type, nextAppointment',
      healthEvents: '++id, petId, date, type, severity, resolved'
    });
  }
}

export const db = new AppDatabase(); 