import { db } from '../lib/db';
import {
  Treatment,
  TreatmentType,
  TreatmentFilters,
  Vaccine,
  Deworming,
  Medication,
  Checkup,
  Surgery,
  Reminder
} from '../types/medical';

export class TreatmentService {
  async getTreatments(filters: TreatmentFilters): Promise<Treatment[]> {
    let query = db.treatments.orderBy('date').reverse();

    if (filters.petId) {
      query = query.filter(t => t.petId === filters.petId);
    }

    if (filters.type) {
      query = query.filter(t => t.type === filters.type);
    }

    if (filters.startDate) {
      query = query.filter(t => new Date(t.date) >= filters.startDate!);
    }

    if (filters.endDate) {
      query = query.filter(t => new Date(t.date) <= filters.endDate!);
    }

    const offset = (filters.page - 1) * filters.limit;
    return query.offset(offset).limit(filters.limit).toArray();
  }

  async getTreatmentById(id: number): Promise<Treatment> {
    const treatment = await db.treatments.get(id);
    if (!treatment) throw new Error('Treatment not found');
    return treatment;
  }

  async createVaccination(vaccine: Omit<Vaccine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vaccine> {
    const now = new Date();
    const id = await db.treatments.add({
      ...vaccine,
      createdAt: now,
      updatedAt: now
    } as any);

    if (vaccine.nextDueDate) {
      await this.createReminder({
        petId: vaccine.petId,
        treatmentId: id,
        type: TreatmentType.VACCINATION,
        dueDate: vaccine.nextDueDate,
        status: 'PENDING',
        notified: false,
        createdAt: now,
        updatedAt: now
      } as any);
    }

    return this.getTreatmentById(id) as Promise<Vaccine>;
  }

  async createDeworming(deworming: Omit<Deworming, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deworming> {
    const now = new Date();
    const id = await db.treatments.add({
      ...deworming,
      createdAt: now,
      updatedAt: now
    } as any);

    if (deworming.nextDueDate) {
      await this.createReminder({
        petId: deworming.petId,
        treatmentId: id,
        type: TreatmentType.DEWORMING,
        dueDate: deworming.nextDueDate,
        status: 'PENDING',
        notified: false,
        createdAt: now,
        updatedAt: now
      } as any);
    }

    return this.getTreatmentById(id) as Promise<Deworming>;
  }

  async createMedication(medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> {
    const now = new Date();
    const id = await db.treatments.add({
      ...medication,
      createdAt: now,
      updatedAt: now
    } as any);

    return this.getTreatmentById(id) as Promise<Medication>;
  }

  async createCheckup(checkup: Omit<Checkup, 'id' | 'createdAt' | 'updatedAt'>): Promise<Checkup> {
    const now = new Date();
    const id = await db.treatments.add({
      ...checkup,
      createdAt: now,
      updatedAt: now
    } as any);

    return this.getTreatmentById(id) as Promise<Checkup>;
  }

  async createSurgery(surgery: Omit<Surgery, 'id' | 'createdAt' | 'updatedAt'>): Promise<Surgery> {
    const now = new Date();
    const id = await db.treatments.add({
      ...surgery,
      createdAt: now,
      updatedAt: now
    } as any);

    return this.getTreatmentById(id) as Promise<Surgery>;
  }

  async updateTreatment(id: number, treatment: Partial<Treatment>): Promise<Treatment> {
    const exists = await db.treatments.get(id);
    if (!exists) throw new Error('Treatment not found');

    const now = new Date();
    await db.treatments.update(id, {
      ...treatment,
      updatedAt: now
    });

    return this.getTreatmentById(id);
  }

  async deleteTreatment(id: number): Promise<void> {
    const exists = await db.treatments.get(id);
    if (!exists) throw new Error('Treatment not found');

    // Supprimer aussi les rappels associés
    await db.reminders.where('treatmentId').equals(id).delete();
    await db.treatments.delete(id);
  }

  // Gestion des rappels
  private async createReminder(reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
    const id = await db.reminders.add(reminder as any);
    return db.reminders.get(id) as Promise<Reminder>;
  }

  async getReminders(petId: number, status?: 'PENDING' | 'COMPLETED' | 'CANCELLED'): Promise<Reminder[]> {
    let query = db.reminders.where('petId').equals(petId);
    
    if (status) {
      query = query.filter(r => r.status === status);
    }

    return query.sortBy('dueDate');
  }

  async updateReminderStatus(id: number, status: 'COMPLETED' | 'CANCELLED'): Promise<void> {
    const exists = await db.reminders.get(id);
    if (!exists) throw new Error('Reminder not found');

    await db.reminders.update(id, {
      status,
      updatedAt: new Date()
    });
  }

  async getUpcomingReminders(days: number = 30): Promise<Reminder[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return db.reminders
      .where('status').equals('PENDING')
      .filter(r => {
        const dueDate = new Date(r.dueDate);
        return dueDate >= today && dueDate <= futureDate;
      })
      .sortBy('dueDate');
  }
} 