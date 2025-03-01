import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { CompleteAppointmentModal } from './CompleteAppointmentModal';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface AppointmentListProps {
  petId?: number;
  onUpdate?: () => void;
}

// Extension du type Appointment pour inclure les données jointes
interface AppointmentWithDetails extends Appointment {
  service: {
    id: number;
    name: string;
  };
  veterinarian: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

const appointmentService = new AppointmentService();

export const AppointmentList: React.FC<AppointmentListProps> = ({ petId, onUpdate }) => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadAppointments();
  }, [petId, refreshTrigger]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointments({
        petId,
        status: AppointmentStatus.SCHEDULED
      });
      // Ici, nous supposons que le service retourne déjà les données avec les détails
      // ou que nous les ajoutons manuellement
      setAppointments(data as AppointmentWithDetails[]);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (e: React.MouseEvent, appointment: AppointmentWithDetails) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Opening modal for appointment:', appointment);
    setSelectedAppointment(appointment);
    setShowCompleteModal(true);
  };

  const handleConfirmComplete = async (completionDate: Date, notes?: string) => {
    if (!selectedAppointment) return;

    try {
      await appointmentService.updateAppointment(selectedAppointment.id, {
        status: AppointmentStatus.COMPLETED,
        date: completionDate,
        notes: notes || selectedAppointment.notes
      });
      
      setShowCompleteModal(false);
      setSelectedAppointment(null);
      setRefreshTrigger(prev => prev + 1);
      onUpdate?.();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    }
  };

  const handleCancel = async (appointmentId: number) => {
    try {
      await appointmentService.updateAppointment(appointmentId, {
        status: AppointmentStatus.CANCELLED
      });
      setRefreshTrigger(prev => prev + 1);
      onUpdate?.();
    } catch (error) {
      console.error('Erreur lors de l\'annulation du rendez-vous:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24 sm:h-32">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {appointments.length === 0 ? (
        <p className="text-center text-gray-500 py-4 sm:py-8">Aucun rendez-vous programmé</p>
      ) : (
        appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white rounded-lg shadow p-3 sm:p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {appointment.service.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {format(new Date(appointment.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Vétérinaire : {appointment.veterinarian.firstName} {appointment.veterinarian.lastName}
                </p>
                {appointment.notes && (
                  <p className="text-sm text-gray-600 mt-1 sm:mt-2">{appointment.notes}</p>
                )}
              </div>
              <div className="flex gap-2 self-end sm:self-start mt-2 sm:mt-0">
                <button
                  onClick={(e) => handleComplete(e, appointment)}
                  type="button"
                  className="p-1.5 sm:p-2 rounded-full text-green-600 hover:bg-green-50"
                  title="Marquer comme fait"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleCancel(appointment.id)}
                  className="p-1.5 sm:p-2 rounded-full text-red-600 hover:bg-red-50"
                  title="Annuler"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      <CompleteAppointmentModal
        isOpen={showCompleteModal}
        appointment={selectedAppointment}
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleConfirmComplete}
      />
    </div>
  );
};