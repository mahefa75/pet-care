import React, { useState, useEffect } from 'react';
import { TreatmentHistory } from '../Treatment/TreatmentHistory';
import { UpcomingReminders } from '../Treatment/UpcomingReminders';
import { AddTreatmentModal } from '../Treatment/AddTreatmentModal';
import { TreatmentService } from '../../services/treatment.service';
import { PetService } from '../../services/pet.service';

interface PetMedicalDetailsProps {
  petId: number;
}

const treatmentService = new TreatmentService();
const petService = new PetService();

export const PetMedicalDetails: React.FC<PetMedicalDetailsProps> = ({
  petId
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [petName, setPetName] = useState<string>('');

  useEffect(() => {
    loadTreatments();
    loadPetDetails();
  }, [petId]);

  const loadPetDetails = async () => {
    try {
      const pet = await petService.getPetById(petId);
      setPetName(pet.name);
    } catch (err) {
      console.error('Erreur lors du chargement des détails de l\'animal:', err);
    }
  };

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
      <div className="flex justify-center items-center h-24 sm:h-32">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-8">
      {/* Section des rappels */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
        <UpcomingReminders
          petId={petId}
          petName={petName}
          onReminderComplete={() => loadTreatments()}
          onReminderCancel={() => loadTreatments()}
        />
      </div>

      {/* Section des traitements */}
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Historique des traitements</h2>
          <button
            onClick={handleAddTreatment}
            className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
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