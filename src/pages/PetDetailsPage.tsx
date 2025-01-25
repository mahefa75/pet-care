import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PetService } from '../services/pet.service';
import { PetMedicalDetails } from '../components/Pet/PetMedicalDetails';
import { Pet } from '../types/pet';

const petService = new PetService();

export const PetDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPet(parseInt(id));
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
        <p className="text-gray-600">{pet.species}</p>
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
        </div>

        {/* Suivi médical */}
        <div className="lg:col-span-2">
          <PetMedicalDetails petId={parseInt(id!)} />
        </div>
      </div>
    </div>
  );
}; 