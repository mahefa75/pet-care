import React, { useState, useEffect } from 'react';
import { Pet, PetStatus, WeightMeasurement } from '../../types/pet';
import { differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';
import { WeightService } from '../../services/weight.service';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon, 
  PhotoIcon,
  TrashIcon
} from '@heroicons/react/24/solid';

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (id: number) => void;
  variant?: 'compact' | 'detailed';
}

const weightService = new WeightService();

export const PetCard: React.FC<PetCardProps> = ({ 
  pet, 
  onEdit, 
  onDelete, 
  variant = 'detailed' 
}) => {
  const [weightTrend, setWeightTrend] = useState<'up' | 'down' | 'stable' | null>(null);
  const [latestWeight, setLatestWeight] = useState<WeightMeasurement | null>(null);
  const [previousWeight, setPreviousWeight] = useState<WeightMeasurement | null>(null);

  useEffect(() => {
    loadWeightTrend();
  }, [pet.id]);

  const loadWeightTrend = async () => {
    try {
      const latest = await weightService.getLatestWeight(pet.id);
      if (latest) {
        setLatestWeight(latest);
        const previous = await weightService.getPreviousWeight(pet.id, latest.date);
        if (previous) {
          setPreviousWeight(previous);
          if (latest.weight > previous.weight) {
            setWeightTrend('up');
          } else if (latest.weight < previous.weight) {
            setWeightTrend('down');
          } else {
            setWeightTrend('stable');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la tendance du poids:', error);
    }
  };

  const renderWeightTrend = () => {
    if (!weightTrend || !previousWeight) return null;

    const icons = {
      up: <ArrowUpIcon className="h-5 w-5 text-green-500" />,
      down: <ArrowDownIcon className="h-5 w-5 text-red-500" />,
      stable: <MinusIcon className="h-5 w-5 text-gray-500" />
    };

    return (
      <div className="flex items-center space-x-1">
        {icons[weightTrend]}
        <span className="text-sm text-gray-500">
          {previousWeight.weight} kg
        </span>
      </div>
    );
  };

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

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(pet);
    }
  };

  const renderWeight = () => {
    if (latestWeight) {
      return (
        <div className="flex items-center space-x-2">
          <p className="text-gray-900">{latestWeight.weight} kg</p>
          {renderWeightTrend()}
        </div>
      );
    }
    return (
      <p className="text-gray-900">{pet.weight} kg</p>
    );
  };

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer relative group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
              <p className="text-sm text-gray-500">{pet.species} - {pet.breed}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pet.status)}`}>
            {pet.status}
          </span>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(pet.id);
            }}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer relative group"
    >
      <div className="flex justify-between">
        <div className="flex space-x-4">
          {pet.photoUrl ? (
            <img
              src={pet.photoUrl}
              alt={pet.name}
              className="h-24 w-24 rounded-lg object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center">
              <PhotoIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{pet.name}</h2>
            <p className="text-gray-600 mt-1">
              {pet.species} - {pet.breed}
            </p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pet.status)}`}>
              {pet.status}
            </span>
          </div>
        </div>
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
          {renderWeight()}
        </div>
      </div>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(pet.id);
          }}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}; 