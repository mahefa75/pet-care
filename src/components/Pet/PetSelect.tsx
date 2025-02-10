import React, { useState, useEffect } from 'react';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../types/pet';

interface PetSelectProps {
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  className?: string;
}

export const PetSelect: React.FC<PetSelectProps> = ({
  value,
  onChange,
  multiple = false,
  className = ''
}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPets = async () => {
      try {
        const petService = new PetService();
        const allPets = await petService.getPets({});
        setPets(allPets);
      } catch (error) {
        console.error('Error loading pets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPets();
  }, []);

  if (loading) {
    return (
      <select className={`${className} animate-pulse bg-gray-100`} disabled>
        <option>Chargement...</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      multiple={multiple}
      className={`${className} mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
    >
      <option value="">Sélectionner un animal</option>
      {pets.map((pet) => (
        <option key={pet.id} value={pet.id.toString()}>
          {pet.name} ({pet.species})
        </option>
      ))}
    </select>
  );
}; 