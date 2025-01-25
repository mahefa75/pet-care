import Dexie, { Table } from 'dexie';
import { Pet, WeightMeasurement } from '../types/pet';
import { Appointment } from '../types/appointment';
import { Treatment, Reminder } from '../types/medical';

export class PetCareDB extends Dexie {
  pets!: Table<Pet, number>;
  appointments!: Table<Appointment, number>;
  treatments!: Table<Treatment, number>;
  reminders!: Table<Reminder, number>;
  weightMeasurements!: Table<WeightMeasurement, number>;

  constructor() {
    super('petcare');
    this.version(1).stores({
      pets: '++id, name, species, status, ownerId',
      appointments: '++id, petId, date, status',
      treatments: '++id, petId, type, date, nextDueDate',
      reminders: '++id, petId, treatmentId, dueDate, status',
      weightMeasurements: '++id, petId, date'
    });
  }
}

export const db = new PetCareDB();