import React, { useState, useEffect } from 'react';
import { Pet, PetFilters, PetSpecies, PetStatus } from '../../types/pet';
import { PetCard } from './PetCard';
import { PetService } from '../../services/pet.service';

const petService = new PetService();

interface PetListProps {
  onEdit?: (pet: Pet) => void;
  onDelete?: (id: number) => void;
}

export const PetList: React.FC<PetListProps> = ({ onEdit, onDelete }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PetFilters>({
    page: 1,
    limit: 10
  });

  const loadPets = async () => {
    try {
      setLoading(true);
      const data = await petService.getPets(filters);
      setPets(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des animaux');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [filters]);

  const handleSpeciesFilter = (species: PetSpecies | '') => {
    setFilters(prev => ({
      ...prev,
      species: species || undefined,
      page: 1
    }));
  };

  const handleStatusFilter = (status: PetStatus | '') => {
    setFilters(prev => ({
      ...prev,
      status: status || undefined,
      page: 1
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Espèce
          </label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => handleSpeciesFilter(e.target.value as PetSpecies | '')}
            value={filters.species || ''}
          >
            <option value="">Toutes les espèces</option>
            {Object.values(PetSpecies).map((species) => (
              <option key={species} value={species}>
                {species}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => handleStatusFilter(e.target.value as PetStatus | '')}
            value={filters.status || ''}
          >
            <option value="">Tous les statuts</option>
            {Object.values(PetStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onEdit={onEdit}
            onDelete={onDelete}
            variant="detailed"
          />
        ))}
      </div>

      {pets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun animal trouvé</p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md mr-2 disabled:opacity-50"
          disabled={filters.page === 1}
          onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
        >
          Précédent
        </button>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
          disabled={pets.length < filters.limit}
          onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}; 