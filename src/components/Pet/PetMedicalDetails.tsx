import React, { useState, useEffect } from 'react';
import { TreatmentHistory } from '../Treatment/TreatmentHistory';
import { UpcomingReminders } from '../Treatment/UpcomingReminders';
import { AddTreatmentModal } from '../Treatment/AddTreatmentModal';
import { TreatmentService } from '../../services/treatment.service';

interface PetMedicalDetailsProps {
  petId: number;
}

const treatmentService = new TreatmentService();

export const PetMedicalDetails: React.FC<PetMedicalDetailsProps> = ({
  petId
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTreatments();
  }, [petId]);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      await treatmentService.getTreatments({
        petId,
        page: 1,
        limit: 50
      });
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des traitements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTreatment = () => {
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    loadTreatments(); // Recharger les traitements après l'ajout
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
    <div className="space-y-8">
      {/* Section des rappels */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <UpcomingReminders
          petId={petId}
          onReminderComplete={() => loadTreatments()}
          onReminderCancel={() => loadTreatments()}
        />
      </div>

      {/* Section des traitements */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Historique des traitements</h2>
          <button
            onClick={handleAddTreatment}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Ajouter un traitement
          </button>
        </div>

        <TreatmentHistory petId={petId} />
      </div>

      {/* Modal d'ajout de traitement */}
      <AddTreatmentModal
        isOpen={isAddModalOpen}
        petId={petId}
        onClose={handleModalClose}
        onSuccess={handleModalClose}
      />
    </div>
  );
}; 