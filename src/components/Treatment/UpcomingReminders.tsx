import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TreatmentService } from '../../services/treatment.service';
import { Treatment, TreatmentType, TreatmentStatus } from '../../types/medical';
import { CheckCircleIcon, XCircleIcon, BeakerIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface UpcomingRemindersProps {
  petId: number;
  onReminderComplete?: () => void;
  onReminderCancel?: () => void;
  onHasReminders?: (hasReminders: boolean) => void;
}

export const UpcomingReminders: React.FC<UpcomingRemindersProps> = ({
  petId,
  onReminderComplete,
  onReminderCancel,
  onHasReminders,
}) => {
  const [reminders, setReminders] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const treatmentService = new TreatmentService();

  useEffect(() => {
    console.log('UpcomingReminders - Loading reminders for pet:', petId);
    loadReminders();
  }, [petId]);

  useEffect(() => {
    if (!loading) {
      const upcomingReminders = reminders.filter(r => {
        const hasNextDueDate = Boolean(r.nextDueDate);
        console.log('Reminder:', {
          id: r.id,
          name: r.name,
          type: r.type,
          nextDueDate: r.nextDueDate,
          hasNextDueDate
        });
        return hasNextDueDate;
      });
      console.log('Filtered reminders:', upcomingReminders.length);
      onHasReminders?.(upcomingReminders.length > 0);
    }
  }, [reminders, loading, onHasReminders]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      console.log('Fetching treatments for pet:', petId);
      const data = await treatmentService.getTreatments({ 
        petId, 
        status: TreatmentStatus.PENDING,
        sortBy: 'nextDueDate',
        sortOrder: 'asc',
        page: 1,
        limit: 50
      });
      console.log('Raw treatments data:', data);

      const upcomingTreatments = data.filter(treatment => {
        if (!treatment.nextDueDate) {
          console.log('Treatment without nextDueDate:', treatment);
          return false;
        }
        const nextDueDate = new Date(treatment.nextDueDate);
        const isUpcoming = nextDueDate >= new Date();
        console.log('Treatment date check:', {
          id: treatment.id,
          name: treatment.name,
          nextDueDate,
          isUpcoming
        });
        return isUpcoming;
      });

      console.log('Filtered upcoming treatments:', upcomingTreatments);
      setReminders(upcomingTreatments);
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTreatmentIcon = (type: TreatmentType) => {
    switch (type) {
      case TreatmentType.VACCINATION:
        return <BeakerIcon className="h-5 w-5 text-blue-500" />;
      case TreatmentType.DEWORMING:
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-purple-500" />;
      case TreatmentType.MEDICATION:
        return <BeakerIcon className="h-5 w-5 text-green-500" />;
      case TreatmentType.CHECKUP:
      case TreatmentType.SURGERY:
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleComplete = async (treatmentId: number) => {
    try {
      await treatmentService.updateTreatment(treatmentId, { status: TreatmentStatus.COMPLETED });
      onReminderComplete?.();
      await loadReminders();
    } catch (error) {
      console.error('Erreur lors de la complétion du traitement:', error);
    }
  };

  const handleCancel = async (treatmentId: number) => {
    try {
      await treatmentService.updateTreatment(treatmentId, { status: TreatmentStatus.CANCELLED });
      onReminderCancel?.();
      await loadReminders();
    } catch (error) {
      console.error('Erreur lors de l\'annulation du traitement:', error);
    }
  };

  if (loading) {
    return null;
  }

  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => {
        console.log('Rendering reminder:', {
          id: reminder.id,
          name: reminder.name,
          type: reminder.type,
          nextDueDate: reminder.nextDueDate
        });
        return (
          <div
            key={reminder.id}
            className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              {getTreatmentIcon(reminder.type)}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex flex-col">
                <span className="font-medium text-sm text-gray-900">
                  {reminder.name}
                </span>
                <span className="text-xs text-gray-500">
                  {reminder.type}
                </span>
                {reminder.nextDueDate && (
                  <span className="text-xs text-blue-600 mt-1">
                    Prochain rendez-vous : {format(new Date(reminder.nextDueDate), 'd MMMM yyyy', { locale: fr })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 flex gap-1">
              <button
                onClick={() => handleComplete(reminder.id)}
                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                title="Marquer comme fait"
              >
                <CheckCircleIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleCancel(reminder.id)}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                title="Annuler"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 