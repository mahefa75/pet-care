import React from 'react';
import { Pet, PetStatus } from '../../types/pet';
import { differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (id: number) => void;
  variant?: 'compact' | 'detailed';
}

export const PetCard: React.FC<PetCardProps> = ({ 
  pet, 
  onEdit, 
  onDelete, 
  variant = 'detailed' 
}) => {
  const getStatusColor = (status: PetStatus) => {
    switch (status) {
      case PetStatus.HEALTHY:
        return 'bg-green-100 text-green-800';
      case PetStatus.SICK:
        return 'bg-red-100 text-red-800';
      case PetStatus.TREATMENT:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (birthDate: Date) => {
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

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
            <p className="text-sm text-gray-500">{pet.species} - {pet.breed}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pet.status)}`}>
            {pet.status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{pet.name}</h2>
          <p className="text-gray-600 mt-1">
            {pet.species} - {pet.breed}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pet.status)}`}>
          {pet.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Âge</p>
          <p className="text-gray-900">{calculateAge(pet.birthDate)}</p>
          <p className="text-xs text-gray-500">
            Né(e) le {new Date(pet.birthDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Poids</p>
          <p className="text-gray-900">{pet.weight} kg</p>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-6 flex justify-end space-x-3">
          {onEdit && (
            <button
              onClick={() => onEdit(pet)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Modifier
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(pet.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
                       transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}; 