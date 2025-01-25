import React, { useState } from 'react';
import { Pet } from '../types/pet';
import { PetList } from '../components/Pet/PetList';
import { PetForm } from '../components/Pet/PetForm';
import { PetService } from '../services/pet.service';

const petService = new PetService();

export const PetsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddClick = () => {
    setSelectedPet(null);
    setShowForm(true);
  };

  const handleEditClick = (pet: Pet) => {
    setSelectedPet(pet);
    setShowForm(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet animal ?')) {
      try {
        await petService.deletePet(id);
        // Forcer le rechargement de la liste
        window.location.reload();
      } catch (err) {
        setError('Erreur lors de la suppression de l\'animal');
        console.error(err);
      }
    }
  };

  const handleSubmit = async (data: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedPet) {
        await petService.updatePet(selectedPet.id, data);
      } else {
        await petService.createPet(data);
      }
      setShowForm(false);
      // Forcer le rechargement de la liste
      window.location.reload();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Animaux</h1>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                   transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Ajouter un animal
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button
            className="absolute top-0 right-0 p-4"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedPet ? 'Modifier un animal' : 'Ajouter un animal'}
          </h2>
          <PetForm
            initialData={selectedPet || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <PetList
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}
    </div>
  );
}; 