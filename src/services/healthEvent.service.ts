import { db } from '../config/db';

export interface HealthEvent {
  id: string;
  petId: string;
  date: Date;
  type: string; // 'illness', 'injury', 'behavior_change', 'other'
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  resolvedDate?: Date;
  notes?: string;
}

export const healthEventService = {
  async addHealthEvent(event: Omit<HealthEvent, 'id'>): Promise<HealthEvent> {
    const id = crypto.randomUUID();
    const newEvent = { ...event, id };
    await db.healthEvents.add(newEvent);
    return newEvent;
  },

  async getHealthEventsByPetId(petId: string): Promise<HealthEvent[]> {
    return await db.healthEvents.where('petId').equals(petId).toArray();
  },

  async getAllHealthEvents(): Promise<HealthEvent[]> {
    return await db.healthEvents.toArray();
  },

  async updateHealthEvent(id: string, updates: Partial<HealthEvent>): Promise<void> {
    await db.healthEvents.update(id, updates);
  },

  async deleteHealthEvent(id: string): Promise<void> {
    await db.healthEvents.delete(id);
  },

  async getActiveHealthEvents(): Promise<HealthEvent[]> {
    return await db.healthEvents
      .where('resolved')
      .equals(false)
      .toArray();
  }
}; 