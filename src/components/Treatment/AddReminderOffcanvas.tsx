import React, { useState } from 'react';
import { TreatmentType, TreatmentStatus } from '../../types/medical';
import { TreatmentService } from '../../services/treatment.service';
import { groomingService } from '../../services/grooming.service';
import { Pet } from '../../types/pet';
import { Offcanvas } from '../UI/Offcanvas';
import { format, addDays } from 'date-fns';

interface AddReminderOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  pets: Pet[];
  onSuccess?: () => void;
}

interface GroomingTypes {
  bath: boolean;
  nailCutting: boolean;
  earCleaning: boolean;
  antiParasites: boolean;
  haircut: boolean;
  other: boolean;
}

const treatmentService = new TreatmentService();

export const AddReminderOffcanvas: React.FC<AddReminderOffcanvasProps> = ({
  isOpen,
  onClose,
  pets,
  onSuccess
}) => {
  const [selectedPets, setSelectedPets] = useState<number[]>([]);
  const [type, setType] = useState<TreatmentType | 'GROOMING'>(TreatmentType.VACCINATION);
  const [date, setDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('');
  const [groomingTypes, setGroomingTypes] = useState<GroomingTypes>({
    bath: false,
    nailCutting: false,
    earCleaning: false,
    antiParasites: false,
    haircut: false,
    other: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPets.length === 0) {
      setError('Veuillez sélectionner au moins un animal');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Créer un rappel pour chaque animal sélectionné
      for (const petId of selectedPets) {
        const commonFields = {
          petId,
          name: `${type} prévu`,
          date: new Date(),
          nextDueDate: new Date(date),
          status: TreatmentStatus.PENDING,
          veterinarianId: 1,
          notes: description
        };

        if (type === 'GROOMING') {
          const selectedTypes = Object.entries(groomingTypes)
            .filter(([_, isSelected]) => isSelected)
            .map(([type]) => type);
          
          await groomingService.addGroomingRecord({
            petId,
            date: new Date(),
            type: selectedTypes.join(','),
            description,
            nextAppointment: new Date(date),
            provider: provider || undefined
          });
        } else {
          switch (type) {
            case TreatmentType.VACCINATION:
              await treatmentService.createVaccination({
                ...commonFields,
                type: TreatmentType.VACCINATION,
                disease: '',
                status: TreatmentStatus.PENDING,
              });
              break;

            case TreatmentType.DEWORMING:
              await treatmentService.createDeworming({
                ...commonFields,
                type: TreatmentType.DEWORMING,
                product: '',
                weight: 0,
                dosage: ''
              });
              break;

            case TreatmentType.MEDICATION:
              await treatmentService.createMedication({
                ...commonFields,
                type: TreatmentType.MEDICATION,
                product: '',
                dosage: '',
                frequency: '',
                duration: 0,
                startDate: new Date(),
                endDate: new Date(date)
              });
              break;

            case TreatmentType.CHECKUP:
              await treatmentService.createCheckup({
                ...commonFields,
                type: TreatmentType.CHECKUP,
                reason: '',
                weight: 0
              });
              break;

            case TreatmentType.SURGERY:
              await treatmentService.createSurgery({
                ...commonFields,
                type: TreatmentType.SURGERY,
                procedure: ''
              });
              break;
          }
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erreur lors de la création des rappels:', err);
      setError('Une erreur est survenue lors de la création des rappels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Offcanvas
      isOpen={isOpen}
      onClose={onClose}
      title={"Ajouter un rappel"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex gap-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* Colonne de gauche - Sélection des animaux */}
        <div className="w-1/3 border-r border-gray-200 pr-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Sélectionner les animaux</h3>
            <p className="text-sm text-gray-500 mb-4">Vous pouvez sélectionner plusieurs animaux</p>
            <div className="space-y-3">
              {pets.map(pet => (
                <label
                  key={pet.id}
                  className={`
                    flex items-center p-3 rounded-lg border cursor-pointer
                    ${selectedPets.includes(pet.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded"
                    checked={selectedPets.includes(pet.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPets([...selectedPets, pet.id]);
                      } else {
                        setSelectedPets(selectedPets.filter(id => id !== pet.id));
                      }
                    }}
                  />
                  <div className="ml-3 flex items-center">
                    {pet.photoUrl && (
                      <img
                        src={pet.photoUrl}
                        alt={pet.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{pet.name}</p>
                      <p className="text-xs text-gray-500">{pet.species}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne de droite - Détails du rappel */}
        <div className="flex-1 space-y-6">
          {/* Type d'intervention */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'intervention
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TreatmentType | 'GROOMING')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={TreatmentType.VACCINATION}>Vaccination</option>
              <option value={TreatmentType.DEWORMING}>Vermifuge</option>
              <option value={TreatmentType.MEDICATION}>Médicament</option>
              <option value={TreatmentType.CHECKUP}>Contrôle</option>
              <option value={TreatmentType.SURGERY}>Chirurgie</option>
              <option value="GROOMING">Toilettage</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {type === 'GROOMING' ? (
            <>
              {/* Types de toilettage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Types de toilettage
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groomingTypes.bath}
                      onChange={(e) => setGroomingTypes({...groomingTypes, bath: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Bain</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groomingTypes.nailCutting}
                      onChange={(e) => setGroomingTypes({...groomingTypes, nailCutting: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Coupe des ongles</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groomingTypes.earCleaning}
                      onChange={(e) => setGroomingTypes({...groomingTypes, earCleaning: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Nettoyage des oreilles</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groomingTypes.antiParasites}
                      onChange={(e) => setGroomingTypes({...groomingTypes, antiParasites: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Traitement antipuces</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groomingTypes.haircut}
                      onChange={(e) => setGroomingTypes({...groomingTypes, haircut: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Coupe de poils</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groomingTypes.other}
                      onChange={(e) => setGroomingTypes({...groomingTypes, other: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Autre</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détails du toilettage..."
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Prestataire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prestataire (optionnel)
                </label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="Nom du toiletteur ou de la clinique..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            /* Description pour les autres types */
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="absolute bottom-0 right-0 left-0 bg-gray-50 px-6 py-3 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Offcanvas>
  );
}; 