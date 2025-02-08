import React, { useState, useEffect } from 'react';
import { format, subMonths, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { groomingService, GroomingRecord } from '../../services/grooming.service';
import { healthEventService, HealthEvent } from '../../services/healthEvent.service';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../types/pet';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'grooming' | 'health';
  title: string;
  description: string;
  petId: string;
  petName?: string;
  severity?: 'low' | 'medium' | 'high';
}

interface GroupedEvents {
  date: Date;
  events: TimelineEvent[];
}

interface TimelineProps {
  petId?: string;
  months?: number;
}

export const Timeline: React.FC<TimelineProps> = ({ petId, months = 2 }) => {
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvents[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les animaux
        const petService = new PetService();
        const allPets = await petService.getPets({ page: 1, limit: 1000 });
        const petsMap = allPets.reduce((acc, pet) => {
          acc[pet.id.toString()] = pet;
          return acc;
        }, {} as Record<string, Pet>);

        // Charger les événements
        const groomingRecords = petId
          ? await groomingService.getGroomingRecordsByPetId(petId)
          : await groomingService.getAllGroomingRecords();

        const healthEvents = petId
          ? await healthEventService.getHealthEventsByPetId(petId)
          : await healthEventService.getAllHealthEvents();

        const limitDate = subMonths(new Date(), months);

        // Combiner tous les événements
        const allEvents = [
          ...groomingRecords
            .filter(record => isAfter(new Date(record.date), limitDate))
            .map((record: GroomingRecord) => ({
              id: record.id,
              date: new Date(record.date),
              type: 'grooming' as const,
              title: `Toilettage`,
              description: record.description,
              petId: record.petId,
              petName: petsMap[record.petId]?.name
            })),
          ...healthEvents
            .filter(event => isAfter(new Date(event.date), limitDate))
            .map((event: HealthEvent) => ({
              id: event.id,
              date: new Date(event.date),
              type: 'health' as const,
              title: `Événement santé`,
              description: event.description,
              petId: event.petId,
              petName: petsMap[event.petId]?.name,
              severity: event.severity
            }))
        ];

        // Grouper les événements par date
        const eventsByDate = allEvents.reduce((acc, event) => {
          const dateStr = format(event.date, 'yyyy-MM-dd');
          if (!acc[dateStr]) {
            acc[dateStr] = {
              date: event.date,
              events: []
            };
          }
          acc[dateStr].events.push(event);
          return acc;
        }, {} as Record<string, GroupedEvents>);

        // Convertir en tableau et trier par date
        const sortedGroups = Object.values(eventsByDate).sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        );

        setGroupedEvents(sortedGroups);
      } catch (error) {
        console.error('Error loading timeline data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [petId, months]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (groupedEvents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun événement sur les {months} derniers mois
      </div>
    );
  }

  return (
    <div className="bg-white p-4">
      {/* Timeline */}
      <div className="relative">
        {/* Ligne horizontale */}
        <div className="absolute left-0 right-0 h-[1px] bg-gray-200" style={{ top: '60px' }} />
        
        {/* Points et dates */}
        <div className="relative flex justify-between items-start min-h-[200px] pt-[60px]">
          {groupedEvents.map((group, index) => (
            <div
              key={format(group.date, 'yyyy-MM-dd')}
              className="relative flex flex-col items-center"
              style={{ flex: 1 }}
            >
              {/* Point */}
              <div className="w-4 h-4 rounded-full bg-blue-500" style={{ marginTop: '-8px' }} />

              {/* Date */}
              <div className="text-xs text-gray-600 mt-0">
                {format(group.date, 'dd/MM/yyyy', { locale: fr })}
              </div>

              {/* Ligne verticale */}
              <div className={`absolute w-[1px] bg-gray-200 ${
                index % 2 === 0 ? '-top-[50px]' : 'top-[20px]'
              }`} style={{ height: '40px' }} />

              {/* Événements */}
              <div className={`absolute w-auto space-y-2 left-[50%] ${
                index % 2 === 0 ? '-top-[100px]' : 'top-[60px]'
              }`}>
                {group.events.map(event => (
                  <div
                    key={event.id}
                    className={`bg-white border-l-2 pl-2 py-1 ${
                      event.type === 'health'
                        ? event.severity === 'high'
                          ? 'border-red-500'
                          : event.severity === 'medium'
                          ? 'border-yellow-500'
                          : 'border-green-500'
                        : 'border-blue-500'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {event.petName} - {event.title}
                    </div>
                    {event.description && (
                      <div className="text-xs text-gray-600">
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 