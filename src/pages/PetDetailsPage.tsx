import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ServiceFactory } from '../services/service-factory';
import { PetMedicalDetails } from '../components/Pet/PetMedicalDetails';
import { WeightChart } from '../components/Pet/WeightChart';
import { AddWeightForm } from '../components/Pet/AddWeightForm';
import { WeightList } from '../components/Weight/WeightList';
import { Pet, WeightMeasurement } from '../types/pet';
import { isValid, format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Fonction utilitaire pour créer une date sécurisée
 * @param dateInput Date à convertir (Date ou string)
 * @returns Une date valide formatée en chaîne de caractères ou 'Non spécifiée' si invalide
 */
const formatSafeDate = (dateInput: Date | string | null | undefined): string => {
  if (!dateInput) return 'Non spécifiée';
  
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (!isValid(date)) return 'Non spécifiée';
    return format(date, 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.warn(`Erreur lors de la conversion de la date: ${dateInput}`, error);
    return 'Non spécifiée';
  }
};

export const PetDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPet(parseInt(id));
      loadWeightHistory(parseInt(id));
    }
  }, [id]);

  const loadPet = async (petId: number) => {
    try {
      setLoading(true);
      const petService = ServiceFactory.getPetService();
      const data = await petService.getPetById(petId);
      setPet(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des informations de l\'animal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeightHistory = async (petId: number) => {
    try {
      const weightService = ServiceFactory.getWeightService();
      const history = await weightService.getWeightHistory(petId);
      setWeightHistory(history);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique du poids:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24 sm:h-32">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative">
        {error || 'Animal non trouvé'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-8">
      {error && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 md:p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {pet && (
        <div className="space-y-3 sm:space-y-4 md:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{pet.name}</h1>
            <div>
              <Link
                to={`/pet/${pet.id}/health`}
                className="inline-block w-full sm:w-auto rounded-md bg-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Suivi santé et toilettage
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
            {/* Informations de base */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Informations</h2>
                <dl className="space-y-2 sm:space-y-3 md:space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Espèce</dt>
                    <dd className="mt-1 text-sm text-gray-900">{pet.species}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Race</dt>
                    <dd className="mt-1 text-sm text-gray-900">{pet.breed || 'Non spécifiée'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatSafeDate(pet.birthDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                    <dd className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {pet.status}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Graphique d'évolution du poids */}
              <div className="mt-3 sm:mt-4 md:mt-8 space-y-3 sm:space-y-4 md:space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Suivi du poids</h2>
                  <WeightChart weightHistory={weightHistory} />
                  <div className="mt-3 sm:mt-4 md:mt-6">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Ajouter une mesure</h3>
                    <AddWeightForm 
                      petId={parseInt(id!)} 
                      onWeightAdded={() => loadWeightHistory(parseInt(id!))} 
                    />
                  </div>
                  <WeightList 
                    weights={weightHistory} 
                    onWeightUpdated={() => loadWeightHistory(parseInt(id!))} 
                  />
                </div>
              </div>
            </div>

            {/* Suivi médical */}
            <div className="lg:col-span-2">
              <PetMedicalDetails petId={parseInt(id!)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 