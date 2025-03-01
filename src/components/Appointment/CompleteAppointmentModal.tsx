import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../../types/appointment';

// Extension du type Appointment pour inclure les données jointes
interface AppointmentWithDetails extends Appointment {
  service?: {
    id: number;
    name: string;
  };
  veterinarian?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface CompleteAppointmentModalProps {
  isOpen: boolean;
  appointment: AppointmentWithDetails | null;
  onClose: () => void;
  onConfirm: (completionDate: Date, notes?: string) => void;
}

export const CompleteAppointmentModal: React.FC<CompleteAppointmentModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onConfirm,
}) => {
  const [completionDate, setCompletionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (appointment?.notes) {
      setNotes(appointment.notes);
    } else {
      setNotes('');
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(new Date(completionDate), notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-3 sm:p-4">
      <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 w-full max-w-md relative">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Marquer le rendez-vous comme effectué</h2>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de réalisation
            </label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Ajoutez des notes sur le rendez-vous..."
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full sm:w-auto"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 