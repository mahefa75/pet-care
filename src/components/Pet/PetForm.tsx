import React, { useState } from 'react';
import { Pet, PetSpecies, PetStatus } from '../../types/pet';
import { differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';

interface PetFormProps {
  initialData?: Partial<Pet>;
  onSubmit: (data: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

export const PetForm: React.FC<PetFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    species: initialData?.species || PetSpecies.DOG,
    breed: initialData?.breed || '',
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
    weight: initialData?.weight || 0,
    status: initialData?.status || PetStatus.HEALTHY,
    ownerId: initialData?.ownerId || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        ...formData,
        birthDate: new Date(formData.birthDate),
        weight: parseFloat(formData.weight.toString()),
        ownerId: parseInt(formData.ownerId.toString())
      });
    } catch (err) {
      setError('Une erreur est survenue lors de l\'enregistrement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' || name === 'ownerId' 
        ? parseFloat(value) 
        : value
    }));
  };

  // Calculer l'âge à partir de la date de naissance
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const years = differenceInYears(today, birth);
    
    if (years === 0) {
      const totalMonths = differenceInMonths(today, birth);
      if (totalMonths === 0) {
        const days = differenceInDays(today, birth);
        return `${days} jour${days > 1 ? 's' : ''}`;
      }
      
      // Calculer les jours restants après les mois complets
      const monthsDate = new Date(birth);
      monthsDate.setMonth(birth.getMonth() + totalMonths);
      const remainingDays = differenceInDays(today, monthsDate);
      
      if (remainingDays === 0) {
        return `${totalMonths} mois`;
      }
      return `${totalMonths} mois et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
    }
    
    return `${years} an${years > 1 ? 's' : ''}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nom
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="species" className="block text-sm font-medium text-gray-700">
          Espèce
        </label>
        <select
          id="species"
          name="species"
          value={formData.species}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.values(PetSpecies).map((species) => (
            <option key={species} value={species}>
              {species}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
          Race
        </label>
        <input
          type="text"
          id="breed"
          name="breed"
          value={formData.breed}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
            Date de naissance
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500"
          />
          {formData.birthDate && (
            <p className="mt-1 text-sm text-gray-500">
              Âge: {calculateAge(formData.birthDate)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
            Poids (kg)
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            required
            min="0"
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          État de santé
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.values(PetStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700">
          ID du propriétaire
        </label>
        <input
          type="number"
          id="ownerId"
          name="ownerId"
          value={formData.ownerId}
          onChange={handleChange}
          required
          min="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 
                   hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}; 