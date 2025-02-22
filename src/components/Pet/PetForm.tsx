import React, { useState, useEffect } from 'react';
import { Pet, PetSpecies, PetStatus, WeightMeasurement } from '../../types/pet';
import { differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';
import { WeightChart } from './WeightChart';
import { WeightList } from '../Weight/WeightList';
import { AddWeightForm } from './AddWeightForm';
import { PetMedicalDetails } from './PetMedicalDetails';
import { WeightService } from '../../services/weight.service';
import { PhotoService } from '../../services/photo.service';
import { PetPhotoUpload } from './PetPhotoUpload';
import { PlusIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface PetFormProps {
  initialData?: Partial<Pet>;
  onSubmit: (data: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const weightService = new WeightService();
const photoService = new PhotoService();

export const PetFormWithDetails: React.FC<PetFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [weightHistory, setWeightHistory] = useState<WeightMeasurement[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [showWeightHistory, setShowWeightHistory] = useState(false);
  const [showWeightChart, setShowWeightChart] = useState(true);
  const [activeTab, setActiveTab] = useState<'weight' | 'medical'>('weight');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    species: initialData?.species || PetSpecies.DOG,
    breed: initialData?.breed || '',
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
    weight: initialData?.weight || 0,
    status: initialData?.status || PetStatus.HEALTHY,
    ownerId: initialData?.ownerId || 0,
    photoUrl: initialData?.photoUrl || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.id) {
      loadWeightHistory(initialData.id);
    }
  }, [initialData?.id]);

  const loadWeightHistory = async (petId: number) => {
    try {
      const history = await weightService.getWeightHistory(petId);
      setWeightHistory(history);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique du poids:', error);
    }
  };

  const handleWeightAdded = async (petId: number) => {
    await loadWeightHistory(petId);
    setShowAddWeight(false);
    setShowWeightChart(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Gérer l'upload de la photo
      let photoUrl = formData.photoUrl;
      if (photoFile) {
        try {
          photoUrl = await photoService.uploadPhoto(photoFile);
        } catch (err) {
          console.error('Erreur lors de l\'upload de la photo:', err);
          setError('Erreur lors de l\'upload de la photo');
          return;
        }
      }

      // Si on a une ancienne photo et une nouvelle photo, supprimer l'ancienne
      if (initialData?.photoUrl && photoUrl && initialData.photoUrl !== photoUrl) {
        try {
          await photoService.deletePhoto(initialData.photoUrl);
        } catch (err) {
          console.error('Erreur lors de la suppression de l\'ancienne photo:', err);
          // On continue quand même car ce n'est pas bloquant
        }
      }

      await onSubmit({
        ...formData,
        birthDate: new Date(formData.birthDate),
        weight: parseFloat(formData.weight.toString()),
        ownerId: parseInt(formData.ownerId.toString()),
        photoUrl
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
    <div className="space-y-8">
      {/* Section principale avec photo et formulaire */}
      <div className="flex gap-8">
        {/* Colonne de gauche - Photo */}
        <div className="w-1/3">
          <div className="sticky top-6">
            <PetPhotoUpload
              currentPhotoUrl={formData.photoUrl}
              onPhotoChange={setPhotoFile}
            />
          </div>
        </div>

        {/* Colonne de droite - Formulaire */}
        <div className="w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
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
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Système d'onglets et contenu */}
      {initialData?.id && (
        <div className="bg-white rounded-lg shadow-sm">
          {/* Onglets */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('weight')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm
                  ${activeTab === 'weight'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Suivi du poids
              </button>
              <button
                onClick={() => setActiveTab('medical')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm
                  ${activeTab === 'medical'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Suivi médical
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {activeTab === 'weight' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Suivi du poids</h2>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddWeight(!showAddWeight);
                        setShowWeightHistory(false);
                        setShowWeightChart(false);
                      }}
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                        showAddWeight ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                      }`}
                      title="Ajouter une mesure"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWeightHistory(!showWeightHistory);
                        setShowAddWeight(false);
                        setShowWeightChart(false);
                      }}
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                        showWeightHistory ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                      }`}
                      title="Historique des poids"
                    >
                      <ClockIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWeightChart(!showWeightChart);
                        setShowAddWeight(false);
                        setShowWeightHistory(false);
                      }}
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                        showWeightChart ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                      }`}
                      title="Graphique de poids"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {showWeightChart && <WeightChart weightHistory={weightHistory} />}

                {showAddWeight && (
                  <div className="mt-6">
                    <AddWeightForm 
                      petId={initialData.id} 
                      onWeightAdded={() => handleWeightAdded(initialData.id!)} 
                    />
                  </div>
                )}

                {showWeightHistory && (
                  <div className="mt-6">
                    <WeightList 
                      weights={weightHistory} 
                      onWeightUpdated={() => loadWeightHistory(initialData.id!)} 
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'medical' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Suivi médical</h2>
                <PetMedicalDetails petId={initialData.id} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Export aussi le formulaire simple pour d'autres usages
export const PetForm: React.FC<PetFormProps> = (props) => {
  const [formData, setFormData] = useState({
    name: props.initialData?.name || '',
    species: props.initialData?.species || PetSpecies.DOG,
    breed: props.initialData?.breed || '',
    birthDate: props.initialData?.birthDate ? new Date(props.initialData.birthDate).toISOString().split('T')[0] : '',
    weight: props.initialData?.weight || 0,
    status: props.initialData?.status || PetStatus.HEALTHY,
    ownerId: props.initialData?.ownerId || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await props.onSubmit({
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

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={props.onCancel}
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
          {loading ? 'Enregistrement...' : props.initialData ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}; 