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
    return await db.healthEvents
      .filter(event => !event.resolved)
      .toArray();
  }
};

// Fonction de test auto-exécutée
(async function testUpdateHealthEvent() {
  let createdEventId: number | undefined;
  
  try {
    console.log('🧪 Starting updateHealthEvent test...');

    // Test 1: Créer un événement
    const newEvent: Omit<HealthEvent, 'id'> = {
      petId: 999,
      date: new Date(),
      type: 'illness',
      description: 'Test event',
      severity: 'low',
      resolved: false,
      notes: 'Test notes'
    };
    
    console.log('Test 1: Creating event...');
    const createdEvent = await healthEventService.addHealthEvent(newEvent);
    createdEventId = createdEvent.id;
    
    if (!createdEvent.id) {
      throw new Error('Created event has no ID');
    }
    console.log('✓ Event created successfully:', createdEvent);

    // Test 2: Mettre à jour l'événement
    const updatedData: HealthEvent = {
      ...createdEvent,
      description: 'Updated test event',
      resolved: true,
      resolvedDate: new Date()
    };
    
    console.log('Test 2: Updating event...');
    await healthEventService.updateHealthEvent(createdEvent.id!, updatedData);
    console.log('✓ Update operation completed');

    // Test 3: Vérifier la mise à jour
    console.log('Test 3: Verifying update...');
    const events = await db.healthEvents.where('id').equals(createdEvent.id).toArray();
    
    if (events.length === 0) {
      throw new Error('Updated event not found');
    }
    
    const updatedEvent = events[0];
    console.log('✓ Retrieved updated event:', updatedEvent);

    // Vérifier que les modifications ont été appliquées
    if (updatedEvent.description !== 'Updated test event' || !updatedEvent.resolved) {
      throw new Error('Event was not updated correctly');
    }
    console.log('✓ Update verified successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    // Nettoyage
    try {
      if (createdEventId) {
        console.log('Cleaning up test data...');
        await healthEventService.deleteHealthEvent(createdEventId);
        console.log('✓ Test data cleaned up');
      }
    } catch (cleanupError) {
      console.error('Warning: Cleanup failed:', cleanupError);
    }
  }
  
  console.log('✅ All tests completed successfully');
})().catch(error => {
  console.error('Test suite failed:', error);
}); 