import React, { useState, useEffect } from 'react';
import { format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TreatmentService } from '../../services/treatment.service';
import { Treatment, TreatmentType, TreatmentStatus } from '../../types/medical';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  BeakerIcon, 
  ClipboardDocumentCheckIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

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
      const hasReminders = reminders.some(r => Boolean(r.nextDueDate));
      console.log('Has reminders:', hasReminders);
      onHasReminders?.(hasReminders);
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

      const validTreatments = data.filter(treatment => {
        if (!treatment.nextDueDate) {
          console.log('Treatment without nextDueDate:', treatment);
          return false;
        }
        return true;
      });

      const sortedTreatments = validTreatments.sort((a, b) => {
        const dateA = new Date(a.nextDueDate!);
        const dateB = new Date(b.nextDueDate!);
        const isOverdueA = isPast(dateA);
        const isOverdueB = isPast(dateB);

        if (isOverdueA && !isOverdueB) return -1;
        if (!isOverdueA && isOverdueB) return 1;
        return dateA.getTime() - dateB.getTime();
      });

      console.log('Filtered and sorted treatments:', sortedTreatments);
      setReminders(sortedTreatments);
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

  // Séparer les rendez-vous manqués et à venir
  const overdueReminders = reminders.filter(r => r.nextDueDate && isPast(new Date(r.nextDueDate)));
  const upcomingReminders = reminders.filter(r => r.nextDueDate && !isPast(new Date(r.nextDueDate)));

  // Grouper les rendez-vous à venir par date
  const groupedUpcoming = upcomingReminders.reduce((groups, reminder) => {
    const date = format(new Date(reminder.nextDueDate!), 'd MMMM yyyy', { locale: fr });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(reminder);
    return groups;
  }, {} as Record<string, Treatment[]>);

  return (
    <div className="space-y-6">
      {/* Rendez-vous manqués */}
      {overdueReminders.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-red-800 font-medium text-sm uppercase tracking-wide">
            Rendez-vous non honorés
          </h3>
          <div className="space-y-3">
            {overdueReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start gap-3 p-4 rounded-lg transition-colors bg-red-50 hover:bg-red-100 border-l-4 border-red-500 shadow-sm"
              >
                <div className="flex-shrink-0 mt-1">
                  {getTreatmentIcon(reminder.type)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-red-900">
                      {reminder.name}
                    </span>
                    <span className="text-sm text-red-700">
                      {reminder.type}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleComplete(reminder.id)}
                      className="p-2 rounded-full transition-colors text-red-600 hover:text-red-800 hover:bg-red-200"
                      title="Marquer comme fait"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleCancel(reminder.id)}
                      className="p-2 rounded-full transition-colors text-red-600 hover:text-red-800 hover:bg-red-100 transition-colors"
                      title="Annuler"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="relative group pr-2">
                    <InformationCircleIcon className="h-5 w-5 text-red-600 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-red-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      Rendez-vous manqué le {format(new Date(reminder.nextDueDate!), 'd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rendez-vous à venir */}
      {Object.entries(groupedUpcoming).map(([date, dateReminders]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-gray-600 font-medium text-sm uppercase tracking-wide">
            {date}
          </h3>
          <div className="space-y-3">
            {dateReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start gap-3 p-4 rounded-lg transition-colors bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex-shrink-0 mt-1">
                  {getTreatmentIcon(reminder.type)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {reminder.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {reminder.type}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex gap-1">
                  <button
                    onClick={() => handleComplete(reminder.id)}
                    className="p-2 rounded-full transition-colors text-green-600 hover:text-green-800 hover:bg-green-100"
                    title="Marquer comme fait"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleCancel(reminder.id)}
                    className="p-2 rounded-full text-red-600 hover:text-red-800 hover:bg-red-100 transition-colors"
                    title="Annuler"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}; 