import React, { useState, useEffect } from 'react';
import { format, isAfter, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { groomingService, GroomingRecord } from '../../services/grooming.service';
import { healthEventService, HealthEvent } from '../../services/healthEvent.service';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../types/pet';
import { Offcanvas } from '../UI/Offcanvas';
import { PencilIcon, SparklesIcon, BoltIcon } from '@heroicons/react/24/outline';

interface TimelineEvent {
  id: number;
  date: Date;
  type: 'grooming' | 'health';
  title: string;
  description: string;
  petId: number;
  petName?: string;
  petPhotoUrl?: string;
  // Champs spécifiques au toilettage
  types?: string[];
  nextAppointment?: Date;
  provider?: string;
  // Champs spécifiques à la santé
  severity?: 'low' | 'medium' | 'high';
  notes?: string;
  resolved?: boolean;
  resolvedDate?: Date;
}

interface GroupedEvents {
  date: Date;
  events: TimelineEvent[];
}

interface TimelineProps {
  petId?: number;
  months?: number;
}

// Ajouter ces constantes après les interfaces
const groomingTypes = [
  { value: 'bath', label: 'Bain' },
  { value: 'nail_trimming', label: 'Coupe des ongles' },
  { value: 'ear_cleaning', label: 'Nettoyage des oreilles' },
  { value: 'flea_treatment', label: 'Traitement antipuces' },
  { value: 'haircut', label: 'Coupe de poils' },
  { value: 'other', label: 'Autre' }
];

const healthEventTypes = [
  { value: 'illness', label: 'Maladie' },
  { value: 'injury', label: 'Blessure' },
  { value: 'behavior_change', label: 'Changement de comportement' },
  { value: 'other', label: 'Autre' }
];

const severityLevels = [
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyen' },
  { value: 'high', label: 'Élevé' }
];

export const Timeline: React.FC<TimelineProps> = ({ petId, months = 2 }) => {
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditOffcanvas, setShowEditOffcanvas] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les animaux
      const petService = new PetService();
      const allPets = await petService.getPets({ page: 1, limit: 1000 });
      const petsMap = allPets.reduce((acc, pet) => {
        acc[pet.id] = pet;
        return acc;
      }, {} as Record<number, Pet>);

      // Charger les événements
      const groomingRecords = petId
        ? await groomingService.getGroomingRecordsByPetId(petId)
        : await groomingService.getAllGroomingRecords();

      const healthEvents = petId
        ? await healthEventService.getHealthEventsByPetId(petId)
        : await healthEventService.getAllHealthEvents();

      // Utiliser 2 semaines comme limite au lieu de months
      const limitDate = subWeeks(new Date(), 2);

      // Combiner tous les événements
      const allEvents = [
        ...groomingRecords
          .filter(record => isAfter(new Date(record.date), limitDate))
          .map((record: GroomingRecord) => {
            const types = record.type.split(',');
            const typeLabels = types
              .map(t => groomingTypes.find(gt => gt.value === t)?.label)
              .filter(Boolean)
              .join(', ');
            
            return {
              id: record.id!,
              date: new Date(record.date),
              type: 'grooming' as const,
              title: `${typeLabels}`,
              description: record.description,
              petId: record.petId,
              petName: petsMap[record.petId]?.name,
              petPhotoUrl: petsMap[record.petId]?.photoUrl,
              types: types,
              nextAppointment: record.nextAppointment,
              provider: record.provider
            };
          }),
        ...healthEvents
          .filter(event => isAfter(new Date(event.date), limitDate))
          .map((event: HealthEvent) => ({
            id: event.id!,
            date: new Date(event.date),
            type: 'health' as const,
            title: `${event.type}`,
            description: event.description,
            petId: event.petId,
            petName: petsMap[event.petId]?.name,
            petPhotoUrl: petsMap[event.petId]?.photoUrl,
            severity: event.severity,
            notes: event.notes,
            resolved: event.resolved,
            resolvedDate: event.resolvedDate
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
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      setGroupedEvents(sortedGroups);
    } catch (error) {
      console.error('Error loading timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [petId, months]);

  const handleEditEvent = (event: TimelineEvent, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingEvent(event);
    setShowEditOffcanvas(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    try {
      if (editingEvent.type === 'grooming') {
        await groomingService.updateGroomingRecord(editingEvent.id, {
          description: editingEvent.description,
          date: editingEvent.date,
          type: editingEvent.types?.join(',') || '',
          nextAppointment: editingEvent.nextAppointment,
          provider: editingEvent.provider
        });
      } else {
        await healthEventService.updateHealthEvent(editingEvent.id, {
          description: editingEvent.description,
          date: editingEvent.date,
          severity: editingEvent.severity,
          type: editingEvent.title.replace('Événement santé - ', ''),
          notes: editingEvent.notes,
          resolved: editingEvent.resolved,
          resolvedDate: editingEvent.resolvedDate
        });
      }

      // Recharger les données
      loadData();
      setShowEditOffcanvas(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

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
        Aucun événement sur les 2 dernières semaines
      </div>
    );
  }

  return (
    <div className="bg-white p-2">
      {/* Timeline verticale */}
      <div className="relative">
        {/* Ligne verticale */}
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-blue-500" />

        {/* Points et événements */}
        <div className="relative space-y-8">
          {groupedEvents.map((group) => (
            <div
              key={format(group.date, 'yyyy-MM-dd')}
              className="relative pl-4"
            >
              {/* Point et date */}
              <div className="absolute left-0 -translate-x-[7px] flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-200" />
                <div className="ml-2 text-sm text-gray-600 whitespace-nowrap font-medium">
                  {format(group.date, 'dd/MM/yyyy', { locale: fr })}
                </div>
              </div>

              {/* Événements */}
              <div className="space-y-2 pt-8">
                {group.events.map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleEditEvent(event)}
                    className={`bg-white border-l-2 pl-2 py-1 group relative hover:shadow-md transition-shadow cursor-pointer ${
                      event.type === 'health'
                        ? event.severity === 'high'
                          ? 'border-red-500'
                          : event.severity === 'medium'
                          ? 'border-yellow-500'
                          : 'border-green-500'
                        : 'border-blue-500'
                    }`}
                  >
                    <div className="text-sm font-medium flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {event.petPhotoUrl ? (
                          <img 
                            src={event.petPhotoUrl} 
                            alt={event.petName} 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              {event.petName?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{event.petName}</span>
                          <div className="flex items-center gap-1">
                            {event.type === 'grooming' ? (
                              <SparklesIcon className="h-4 w-4 text-blue-500" />
                            ) : (
                              <BoltIcon className="h-4 w-4 text-red-500" />
                            )}
                            <span>{event.title}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleEditEvent(event, e)}
                        className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
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

      {/* Offcanvas d'édition */}
      <Offcanvas
        isOpen={showEditOffcanvas}
        onClose={() => {
          setShowEditOffcanvas(false);
          setEditingEvent(null);
        }}
        title="Modifier l'événement"
      >
        {editingEvent && (
          <div className="space-y-4">
            {/* Information de l'animal */}
            <div className="bg-gray-50 -mx-6 -mt-6 px-6 py-3 border-b border-gray-200">
              <div className="text-sm text-gray-600">Animal concerné</div>
              <div className="font-medium">{editingEvent.petName}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={format(editingEvent.date, "yyyy-MM-dd")}
                onChange={(e) => setEditingEvent(prev => prev ? {
                  ...prev,
                  date: new Date(e.target.value)
                } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {editingEvent.type === 'grooming' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Types de toilettage
                  </label>
                  <div className="space-y-2">
                    {groomingTypes.map(type => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingEvent.types?.includes(type.value)}
                          onChange={(e) => {
                            setEditingEvent(prev => {
                              if (!prev) return null;
                              const currentTypes = prev.types || [];
                              const newTypes = e.target.checked
                                ? [...currentTypes, type.value]
                                : currentTypes.filter(t => t !== type.value);
                              return {
                                ...prev,
                                types: newTypes,
                                title: `Toilettage - ${newTypes.map(t => 
                                  groomingTypes.find(gt => gt.value === t)?.label
                                ).join(', ')}`
                              };
                            });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent(prev => prev ? {
                      ...prev,
                      description: e.target.value
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Détails du toilettage..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prochain rendez-vous (optionnel)
                  </label>
                  <input
                    type="date"
                    value={editingEvent.nextAppointment ? format(editingEvent.nextAppointment, "yyyy-MM-dd") : ''}
                    onChange={(e) => setEditingEvent(prev => prev ? {
                      ...prev,
                      nextAppointment: e.target.value ? new Date(e.target.value) : undefined
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prestataire (optionnel)
                  </label>
                  <input
                    type="text"
                    value={editingEvent.provider || ''}
                    onChange={(e) => setEditingEvent(prev => prev ? {
                      ...prev,
                      provider: e.target.value
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Nom du toiletteur ou de la clinique..."
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'événement
                  </label>
                  <select
                    value={editingEvent.title.replace('Événement santé - ', '')}
                    onChange={(e) => setEditingEvent(prev => prev ? {
                      ...prev,
                      title: `Événement santé - ${e.target.value}`
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {healthEventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niveau de gravité
                  </label>
                  <select
                    value={editingEvent.severity}
                    onChange={(e) => setEditingEvent(prev => prev ? {
                      ...prev,
                      severity: e.target.value as 'low' | 'medium' | 'high'
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {severityLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent(prev => prev ? {
                      ...prev,
                      description: e.target.value
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Description de l'événement..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes additionnelles
                  </label>
                  <textarea
                    value={editingEvent.notes || ''}
                    onChange={(e) => setEditingEvent(prev => prev ? {
                      ...prev,
                      notes: e.target.value
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Notes supplémentaires..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingEvent.resolved || false}
                    onChange={(e) => setEditingEvent(prev => prev ? {
                      ...prev,
                      resolved: e.target.checked
                    } : null)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Problème résolu
                  </label>
                </div>

                {editingEvent.resolved && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de résolution
                    </label>
                    <input
                      type="date"
                      value={editingEvent.resolvedDate ? format(editingEvent.resolvedDate, "yyyy-MM-dd") : ''}
                      onChange={(e) => setEditingEvent(prev => prev ? {
                        ...prev,
                        resolvedDate: e.target.value ? new Date(e.target.value) : undefined
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowEditOffcanvas(false);
                  setEditingEvent(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        )}
      </Offcanvas>
    </div>
  );
}; 