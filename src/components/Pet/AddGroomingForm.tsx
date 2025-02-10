import React, { useState } from 'react';
import { groomingService } from '../../services/grooming.service';
import { PetVisualSelect } from './PetVisualSelect';

interface AddGroomingFormProps {
  petId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddGroomingForm: React.FC<AddGroomingFormProps> = ({
  petId: initialPetId,
  onSuccess,
  onCancel
}) => {
  const [selectedPets, setSelectedPets] = useState<string[]>(
    initialPetId ? [initialPetId] : []
  );
  const [formData, setFormData] = useState({
    types: [] as string[],
    description: '',
    date: new Date().toISOString().split('T')[0],
    nextAppointment: '',
    provider: ''
  });

  const groomingTypes = [
    { value: 'bath', label: 'Bain' },
    { value: 'nail_trimming', label: 'Coupe des ongles' },
    { value: 'ear_cleaning', label: 'Nettoyage des oreilles' },
    { value: 'flea_treatment', label: 'Traitement antipuces' },
    { value: 'haircut', label: 'Coupe de poils' },
    { value: 'other', label: 'Autre' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPets.length === 0) {
      alert('Veuillez sélectionner au moins un animal');
      return;
    }

    if (formData.types.length === 0) {
      alert('Veuillez sélectionner au moins un type de toilettage');
      return;
    }

    try {
      // Créer un enregistrement pour chaque animal sélectionné
      await Promise.all(
        selectedPets.map(petId =>
          // Pour chaque type de toilettage sélectionné
          Promise.all(formData.types.map(type =>
            groomingService.addGroomingRecord({
              petId,
              date: new Date(formData.date),
              type,
              description: formData.description,
              nextAppointment: formData.nextAppointment ? new Date(formData.nextAppointment) : undefined,
              provider: formData.provider || undefined
            })
          ))
        )
      );
      onSuccess?.();
    } catch (error) {
      console.error('Error adding grooming record:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const handlePetSelect = (petId: string) => {
    setSelectedPets(prev => {
      if (prev.includes(petId)) {
        return prev.filter(id => id !== petId);
      }
      return [...prev, petId];
    });
  };

  return (
    <div className="flex gap-6 h-full">
      {!initialPetId && (
        <div className="flex-none border-r border-gray-200">
          <PetVisualSelect
            selectedPets={selectedPets}
            onPetSelect={handlePetSelect}
            multiple={true}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types de toilettage
            </label>
            <div className="space-y-2">
              {groomingTypes.map(type => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.types.includes(type.value)}
                    onChange={() => handleTypeToggle(type.value)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Détails du toilettage..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prochain rendez-vous (optionnel)
            </label>
            <input
              type="date"
              name="nextAppointment"
              value={formData.nextAppointment}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prestataire (optionnel)
            </label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nom du toiletteur ou de la clinique..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 