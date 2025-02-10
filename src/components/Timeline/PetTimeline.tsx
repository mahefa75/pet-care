import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GroomingRecord, groomingService } from '../../services/grooming.service';
import { HealthEvent, healthEventService } from '../../services/healthEvent.service';

interface TimelineEvent {
  id: number;
  date: Date;
  type: 'grooming' | 'health';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
  icon?: string;
}

interface PetTimelineProps {
  petId?: number;
}

export const PetTimeline: React.FC<PetTimelineProps> = ({ petId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch grooming records
        const groomingRecords = petId
          ? await groomingService.getGroomingRecordsByPetId(petId)
          : await groomingService.getAllGroomingRecords();

        // Fetch health events
        const healthEvents = petId
          ? await healthEventService.getHealthEventsByPetId(petId)
          : await healthEventService.getAllHealthEvents();

        // Convert to timeline events
        const timelineEvents: TimelineEvent[] = [
          ...groomingRecords.map((record: GroomingRecord) => ({
            id: record.id!,
            date: record.date,
            type: 'grooming' as const,
            title: `Toilettage - ${record.type}`,
            description: record.description,
            icon: '🛁'
          })),
          ...healthEvents.map((event: HealthEvent) => ({
            id: event.id!,
            date: event.date,
            type: 'health' as const,
            title: `Événement santé - ${event.type}`,
            description: event.description,
            severity: event.severity,
            icon: event.severity === 'high' ? '🚨' : event.severity === 'medium' ? '⚠️' : '💊'
          }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime());

        setEvents(timelineEvents);
      } catch (error) {
        console.error('Error fetching timeline events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [petId]);

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
    <div className="timeline-container">
      {events.length === 0 ? (
        <p className="text-center text-gray-500">Aucun événement à afficher</p>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {events.map((event, eventIdx) => (
              <li key={event.id}>
                <div className="relative pb-8">
                  {eventIdx !== events.length - 1 && (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        {event.icon}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="font-medium text-gray-900">
                          {event.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {event.description}
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        {format(event.date, 'PPP', { locale: fr })}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 