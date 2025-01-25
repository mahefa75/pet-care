import React, { useState, useEffect } from 'react';
import { Reminder, TreatmentType } from '../../types/medical';
import { TreatmentService } from '../../services/treatment.service';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UpcomingRemindersProps {
  petId?: number;
  days?: number;
  onReminderComplete?: (id: number) => void;
  onReminderCancel?: (id: number) => void;
}

const treatmentService = new TreatmentService();

export const UpcomingReminders: React.FC<UpcomingRemindersProps> = ({
  petId,
  days = 30,
  onReminderComplete,
  onReminderCancel
}) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReminders();
  }, [petId, days]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      let data: Reminder[];
      if (petId) {
        data = await treatmentService.getReminders(petId, 'PENDING');
      } else {
        data = await treatmentService.getUpcomingReminders(days);
      }
      setReminders(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des rappels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await treatmentService.updateReminderStatus(id, 'COMPLETED');
      if (onReminderComplete) {
        onReminderComplete(id);
      }
      await loadReminders();
    } catch (err) {
      setError('Erreur lors de la mise à jour du rappel');
      console.error(err);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await treatmentService.updateReminderStatus(id, 'CANCELLED');
      if (onReminderCancel) {
        onReminderCancel(id);
      }
      await loadReminders();
    } catch (err) {
      setError('Erreur lors de l\'annulation du rappel');
      console.error(err);
    }
  };

  const getTreatmentIcon = (type: TreatmentType) => {
    switch (type) {
      case TreatmentType.VACCINATION:
        return '💉';
      case TreatmentType.DEWORMING:
        return '🪱';
      case TreatmentType.MEDICATION:
        return '💊';
      case TreatmentType.CHECKUP:
        return '👨‍⚕️';
      case TreatmentType.SURGERY:
        return '🏥';
      default:
        return '📋';
    }
  };

  const getReminderStatus = (dueDate: Date) => {
    if (isPast(new Date(dueDate)) && !isToday(new Date(dueDate))) {
      return {
        color: 'text-red-600',
        text: 'En retard'
      };
    }
    if (isToday(new Date(dueDate))) {
      return {
        color: 'text-orange-600',
        text: 'Aujourd\'hui'
      };
    }
    return {
      color: 'text-green-600',
      text: 'À venir'
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Rappels à venir</h3>

      {reminders.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Aucun rappel prévu</p>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => {
            const status = getReminderStatus(reminder.dueDate);
            return (
              <div
                key={reminder.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" role="img" aria-label={reminder.type}>
                    {getTreatmentIcon(reminder.type)}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">{reminder.type}</p>
                        <p className={`text-sm font-medium ${status.color}`}>
                          {status.text} - {format(new Date(reminder.dueDate), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleComplete(reminder.id)}
                          className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 
                                   transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Fait
                        </button>
                        <button
                          onClick={() => handleCancel(reminder.id)}
                          className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 
                                   transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 