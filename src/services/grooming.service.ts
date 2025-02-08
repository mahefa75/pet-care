import { db } from '../config/db';

export interface GroomingRecord {
  id: string;
  petId: string;
  date: Date;
  type: string; // 'bath', 'nail_trimming', 'ear_cleaning', 'flea_treatment', etc.
  description: string;
  nextAppointment?: Date;
  provider?: string; // Who performed the grooming (optional)
}

export const groomingService = {
  async addGroomingRecord(record: Omit<GroomingRecord, 'id'>): Promise<GroomingRecord> {
    const id = crypto.randomUUID();
    const newRecord = { ...record, id };
    await db.grooming.add(newRecord);
    return newRecord;
  },

  async getGroomingRecordsByPetId(petId: string): Promise<GroomingRecord[]> {
    return await db.grooming.where('petId').equals(petId).toArray();
  },

  async getAllGroomingRecords(): Promise<GroomingRecord[]> {
    return await db.grooming.toArray();
  },

  async updateGroomingRecord(id: string, updates: Partial<GroomingRecord>): Promise<void> {
    await db.grooming.update(id, updates);
  },

  async deleteGroomingRecord(id: string): Promise<void> {
    await db.grooming.delete(id);
  },

  async getUpcomingGrooming(): Promise<GroomingRecord[]> {
    const now = new Date();
    return await db.grooming
      .where('nextAppointment')
      .above(now)
      .toArray();
  }
}; 