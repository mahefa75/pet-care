import Dexie, { Table } from 'dexie';
import { Pet } from '../types/pet';
import { Appointment } from '../types/appointment';

export class PetCareDB extends Dexie {
  pets!: Table<Pet>;
  appointments!: Table<Appointment>;
  medicalRecords!: Table<any>;

  constructor() {
    super('petcare');
    this.version(1).stores({
      pets: '++id, name, species, status, ownerId',
      appointments: '++id, petId, date, status',
      medicalRecords: '++id, petId, date'
    });
  }
}

export const db = new PetCareDB();