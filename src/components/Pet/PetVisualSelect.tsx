import React, { useState, useEffect } from 'react';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../types/pet';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface PetVisualSelectProps {
  selectedPets: string[];
  onPetSelect: (petId: string) => void;
  multiple?: boolean;
}

export const PetVisualSelect: React.FC<PetVisualSelectProps> = ({
  selectedPets,
  onPetSelect,
  multiple = false
}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const petService = new PetService();
      
      // Récupérer tous les animaux sans filtre de statut
      const allPets = await petService.getPets({ 
        page: 1, 
        limit: 1000 // Augmenter la limite pour être sûr d'avoir tous les animaux
      });

      if (allPets && Array.isArray(allPets)) {
        setPets(allPets);
      } else {
        setError("Format de données invalide");
      }
    } catch (error) {
      console.error('Error loading pets:', error);
      setError("Erreur lors du chargement des animaux");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  const handlePetSelect = (petId: string) => {
    if (multiple) {
      onPetSelect(petId);
    } else {
      if (selectedPets.includes(petId)) {
        onPetSelect('');
      } else {
        onPetSelect(petId);
      }
    }
  };

  const handleRetry = () => {
    loadPets();
  };

  if (loading) {
    return (
      <div className="w-80 animate-pulse space-y-4 p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={handleRetry}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 overflow-y-auto max-h-[calc(100vh-200px)]">
      <div className="sticky top-0 bg-white py-2 mb-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">
          Sélectionner les animaux
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {multiple ? 'Vous pouvez sélectionner plusieurs animaux' : 'Sélectionnez un animal'}
        </p>
      </div>
      
      <div className="space-y-2 px-2">
        {pets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">Aucun animal trouvé</p>
            <button
              onClick={handleRetry}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Actualiser la liste
            </button>
          </div>
        ) : (
          pets.map((pet) => (
            <div
              key={pet.id}
              onClick={() => handlePetSelect(pet.id.toString())}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors
                ${selectedPets.includes(pet.id.toString())
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
            >
              {pet.photoUrl ? (
                <img
                  src={pet.photoUrl}
                  alt={pet.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <PhotoIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{pet.name}</p>
                <p className="text-sm text-gray-500">{pet.species}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 