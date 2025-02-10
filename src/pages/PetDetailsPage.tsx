import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PetService } from '../services/pet.service';
import { WeightService } from '../services/weight.service';
import { PetMedicalDetails } from '../components/Pet/PetMedicalDetails';
import { WeightChart } from '../components/Pet/WeightChart';
import { AddWeightForm } from '../components/Pet/AddWeightForm';
import { WeightList } from '../components/Weight/WeightList';
import { Pet, WeightMeasurement } from '../types/pet';

const petService = new PetService();
const weightService = new WeightService();

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
      const history = await weightService.getWeightHistory(petId);
      setWeightHistory(history);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique du poids:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error || 'Animal non trouvé'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {pet && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <div className="flex space-x-4">
              <Link
                to={`/pet/${pet.id}/health`}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Suivi santé et toilettage
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations de base */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations</h2>
                <dl className="space-y-4">
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
                      {pet.birthDate ? new Date(pet.birthDate).toLocaleDateString() : 'Non spécifiée'}
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
              <div className="mt-8 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Suivi du poids</h2>
                  <WeightChart weightHistory={weightHistory} />
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter une mesure</h3>
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