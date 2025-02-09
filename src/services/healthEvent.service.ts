import { db } from '../lib/db';

export interface HealthEvent {
  id?: number;
  petId: number;
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
    const id = await db.healthEvents.add(event);
    return { ...event, id };
  },

  async getHealthEventsByPetId(petId: number): Promise<HealthEvent[]> {
    return await db.healthEvents.where('petId').equals(petId).toArray();
  },

  async getAllHealthEvents(): Promise<HealthEvent[]> {
    return await db.healthEvents.toArray();
  },

  async updateHealthEvent(id: number, updates: Partial<HealthEvent>): Promise<void> {
    await db.healthEvents.update(id, updates);
  },

  async deleteHealthEvent(id: number): Promise<void> {
    await db.healthEvents.delete(id);
  },

  async getActiveHealthEvents(): Promise<HealthEvent[]> {
    return await db.healthEvents
      .filter(event => !event.resolved)
      .toArray();
  }
}; 