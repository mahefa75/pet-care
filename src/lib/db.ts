import Dexie, { Table } from 'dexie';
import { Pet } from '../types/pet';
import { Appointment } from '../types/appointment';
import { Treatment, Reminder } from '../types/medical';

export class PetCareDB extends Dexie {
  pets!: Table<Pet, number>;
  appointments!: Table<Appointment, number>;
  treatments!: Table<Treatment, number>;
  reminders!: Table<Reminder, number>;

  constructor() {
    super('petcare');
    this.version(1).stores({
      pets: '++id, name, species, status, ownerId',
      appointments: '++id, petId, date, status',
      treatments: '++id, petId, type, date, nextDueDate',
      reminders: '++id, petId, treatmentId, dueDate, status'
    });
  }
}

export const db = new PetCareDB();