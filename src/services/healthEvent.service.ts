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
    const normalizedEvent = {
      ...event,
      petId: typeof event.petId === 'string' ? parseInt(event.petId) : event.petId
    };
    const id = await db.healthEvents.add(normalizedEvent);
    return { ...normalizedEvent, id };
  },

  async getHealthEventsByPetId(petId: number): Promise<HealthEvent[]> {
    const normalizedPetId = typeof petId === 'string' ? parseInt(petId) : petId;
    return await db.healthEvents.where('petId').equals(normalizedPetId).toArray();
  },

  async getAllHealthEvents(): Promise<HealthEvent[]> {
    return await db.healthEvents.toArray();
  },

  async updateHealthEvent(eventOrId: HealthEvent | number, updates?: Partial<Omit<HealthEvent, 'id'>>): Promise<void> {
    console.log('[HealthEventService] Starting update with:', { eventOrId, updates });

    // Si on reçoit juste un ID et des mises à jour
    if (typeof eventOrId === 'number') {
      if (!updates || typeof updates !== 'object') {
        throw new Error('Updates object is required when using ID');
      }
      
      console.log('[HealthEventService] Updating by ID:', { id: eventOrId, updates });
      await db.transaction('rw', [db.healthEvents, db.syncInfo, db.syncQueue], async () => {
        const result = await db.healthEvents.update(eventOrId, updates);
        console.log('[HealthEventService] Update result:', result);
      });
      return;
    }

    // Si on reçoit un objet complet
    if (!eventOrId || typeof eventOrId !== 'object') {
      throw new Error('Event must be an object');
    }

    if (!eventOrId.id) {
      throw new Error('Event ID is required for update');
    }

    // Vérifier que tous les champs requis sont présents
    const requiredFields = ['petId', 'date', 'type', 'description', 'severity', 'resolved'];
    const missingFields = requiredFields.filter(field => !(field in eventOrId));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log('[HealthEventService] Starting transaction for full event update');
    await db.transaction('rw', [db.healthEvents, db.syncInfo, db.syncQueue], async () => {
      const updateData = {
        petId: eventOrId.petId,
        date: eventOrId.date,
        type: eventOrId.type,
        description: eventOrId.description,
        severity: eventOrId.severity,
        resolved: eventOrId.resolved,
        resolvedDate: eventOrId.resolvedDate,
        notes: eventOrId.notes
      };

      console.log('[HealthEventService] Updating with data:', updateData);
      const result = await db.healthEvents.update(eventOrId.id!, updateData);
      console.log('[HealthEventService] Update result:', result);
    });
    console.log('[HealthEventService] Transaction completed');
  },

  async deleteHealthEvent(id: number): Promise<void> {
    await db.healthEvents.delete(id);
  },

  async getActiveHealthEvents(): Promise<HealthEvent[]> {
    console.log('Récupération des événements de santé actifs...');
    const events = await db.healthEvents
      .filter(event => !event.resolved)
      .toArray();
    
    console.log('Événements actifs trouvés:', events);
    
    // S'assurer que les dates sont des objets Date et que petId est un nombre
    const formattedEvents = events.map(event => ({
      ...event,
      petId: typeof event.petId === 'string' ? parseInt(event.petId) : event.petId,
      date: new Date(event.date),
      resolvedDate: event.resolvedDate ? new Date(event.resolvedDate) : undefined
    }));
    
    console.log('Événements formatés:', formattedEvents);
    return formattedEvents;
  }
}; 