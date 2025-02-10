import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { groomingService, GroomingRecord } from '../../services/grooming.service';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../types/pet';

interface GroomingHistoryProps {
  petId?: number;
  onUpdate?: () => void;
}

export const GroomingHistory: React.FC<GroomingHistoryProps> = ({ petId, onUpdate }) => {
  const [records, setRecords] = useState<GroomingRecord[]>([]);
  const [pets, setPets] = useState<Record<number, Pet>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const groomingTypeLabels: Record<string, string> = {
    bath: 'Bain',
    nail_trimming: 'Coupe des ongles',
    ear_cleaning: 'Nettoyage des oreilles',
    flea_treatment: 'Traitement antipuces',
    haircut: 'Coupe de poils',
    other: 'Autre'
  };

  const loadPets = async () => {
    try {
      const petService = new PetService();
      const allPets = await petService.getPets({ page: 1, limit: 1000 });
      const petsMap = allPets.reduce((acc, pet) => {
        acc[pet.id] = pet;
        return acc;
      }, {} as Record<number, Pet>);
      setPets(petsMap);
    } catch (err) {
      console.error('Error loading pets:', err);
    }
  };

  const loadGroomingHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = petId
        ? await groomingService.getGroomingRecordsByPetId(petId)
        : await groomingService.getAllGroomingRecords();

      // Trier les enregistrements par date décroissante
      const sortedRecords = data.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setRecords(sortedRecords);
    } catch (err) {
      console.error('Error loading grooming history:', err);
      setError('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
    loadGroomingHistory();
  }, [petId]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      try {
        await groomingService.deleteGroomingRecord(id);
        await loadGroomingHistory();
        onUpdate?.();
      } catch (err) {
        console.error('Error deleting grooming record:', err);
        setError('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        {error}
        <button
          onClick={loadGroomingHistory}
          className="ml-2 text-sm underline hover:text-red-800"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        Aucun historique de toilettage disponible
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg p-6">
      <div className="overflow-x-auto">
        <div className="inline-flex gap-6 pb-4">
          {records.map((record) => (
            <div key={record.id} className="flex-none w-[280px]">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-gray-900">
                    {format(new Date(record.date), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                  <button
                    onClick={() => record.id && handleDelete(record.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                {pets[record.petId] && (
                  <div className="text-sm font-medium text-blue-600 mb-2">
                    {pets[record.petId].name}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🛁</span>
                  <div className="font-medium text-gray-800">
                    {groomingTypeLabels[record.type]}
                  </div>
                </div>
                
                {record.description && (
                  <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {record.description}
                  </div>
                )}
                
                {record.provider && (
                  <div className="text-xs text-gray-500 mt-2">
                    Prestataire: {record.provider}
                  </div>
                )}
                
                {record.nextAppointment && (
                  <div className="text-xs text-gray-500 mt-1">
                    Prochain RDV: {format(new Date(record.nextAppointment), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 