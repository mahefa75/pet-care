import React, { useState } from 'react';
import { healthEventService } from '../../services/healthEvent.service';
import { PetVisualSelect } from './PetVisualSelect';

interface AddHealthEventFormProps {
  petId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddHealthEventForm: React.FC<AddHealthEventFormProps> = ({
  petId: initialPetId,
  onSuccess,
  onCancel
}) => {
  const [selectedPets, setSelectedPets] = useState<string[]>(
    initialPetId ? [initialPetId] : []
  );
  const [formData, setFormData] = useState({
    type: 'illness',
    description: '',
    date: new Date().toISOString().split('T')[0],
    severity: 'low',
    notes: '',
    resolved: false,
    resolvedDate: ''
  });

  const eventTypes = [
    { value: 'illness', label: 'Maladie' },
    { value: 'injury', label: 'Blessure' },
    { value: 'behavior_change', label: 'Changement de comportement' },
    { value: 'other', label: 'Autre' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyen' },
    { value: 'high', label: 'Élevé' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPets.length === 0) {
      alert('Veuillez sélectionner au moins un animal');
      return;
    }

    try {
      // Créer un enregistrement pour chaque animal sélectionné
      await Promise.all(
        selectedPets.map(petId =>
          healthEventService.addHealthEvent({
            petId,
            date: new Date(formData.date),
            type: formData.type,
            description: formData.description,
            severity: formData.severity as 'low' | 'medium' | 'high',
            notes: formData.notes || undefined,
            resolved: formData.resolved,
            resolvedDate: formData.resolvedDate ? new Date(formData.resolvedDate) : undefined
          })
        )
      );
      onSuccess?.();
    } catch (error) {
      console.error('Error adding health event:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
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
            <label className="block text-sm font-medium text-gray-700">
              Type d'événement
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Niveau de gravité
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {severityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
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
              placeholder="Description de l'événement..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes additionnelles
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Notes supplémentaires..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="resolved"
              checked={formData.resolved}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Problème résolu
            </label>
          </div>

          {formData.resolved && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date de résolution
              </label>
              <input
                type="date"
                name="resolvedDate"
                value={formData.resolvedDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

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