import Dexie, { Table } from 'dexie';
import { Pet, WeightMeasurement } from '../types/pet';
import { Appointment } from '../types/appointment';
import { Treatment, Reminder } from '../types/medical';
import { GroomingRecord } from '../services/grooming.service';
import { HealthEvent } from '../services/healthEvent.service';
import { Food } from '../types/food';

export class PetCareDB extends Dexie {
  pets!: Table<Pet, number>;
  appointments!: Table<Appointment, number>;
  treatments!: Table<Treatment, number>;
  reminders!: Table<Reminder, number>;
  weightMeasurements!: Table<WeightMeasurement, number>;
  grooming!: Table<GroomingRecord, number>;
  healthEvents!: Table<HealthEvent, number>;
  foods!: Table<Food, number>;

  constructor() {
    super('petcare');
    this.version(2).stores({
      pets: '++id, name, species, status, ownerId',
      appointments: '++id, petId, date, status',
      treatments: '++id, petId, type, date, nextDueDate',
      reminders: '++id, petId, treatmentId, dueDate, status',
      weightMeasurements: '++id, petId, date',
      grooming: '++id, petId, date, type, nextAppointment',
      healthEvents: '++id, petId, date, type, severity, resolved',
      foods: '++id, name, type, brand'
    });
  }
}

export const db = new PetCareDB();