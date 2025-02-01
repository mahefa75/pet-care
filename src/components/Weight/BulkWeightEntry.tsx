import React, { useState } from 'react';
import { Pet } from '../../types/pet';
import { WeightService } from '../../services/weight.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BulkWeightEntryProps {
  pets: Pet[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface WeightEntry {
  date: string;
  weights: { [key: number]: string };
}

const weightService = new WeightService();

export const BulkWeightEntry: React.FC<BulkWeightEntryProps> = ({
  pets,
  isOpen,
  onClose,
  onSave,
}) => {
  const [entries, setEntries] = useState<WeightEntry[]>([
    { date: format(new Date(), 'yyyy-MM-dd'), weights: {} }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNewRow = () => {
    setEntries([...entries, { date: '', weights: {} }]);
  };

  const removeRow = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateWeight = (rowIndex: number, petId: number, value: string) => {
    const newEntries = [...entries];
    newEntries[rowIndex].weights[petId] = value;
    setEntries(newEntries);
  };

  const updateDate = (rowIndex: number, value: string) => {
    const newEntries = [...entries];
    newEntries[rowIndex].date = value;
    setEntries(newEntries);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Valider les entrées
      const validEntries = entries.filter(entry => {
        return entry.date && Object.values(entry.weights).some(w => w !== '');
      });

      if (validEntries.length === 0) {
        setError('Aucune donnée valide à enregistrer');
        return;
      }

      // Préparer et envoyer les données
      for (const entry of validEntries) {
        for (const [petId, weight] of Object.entries(entry.weights)) {
          if (weight) {
            const weightValue = parseFloat(weight.replace(',', '.'));
            if (!isNaN(weightValue)) {
              await weightService.addWeight(parseInt(petId), {
                date: new Date(entry.date),
                weight: weightValue
              });
            }
          }
        }
      }

      onSave();
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement des poids');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="fixed right-0 top-0 h-full md:w-3/4 lg:w-2/3 bg-white shadow-lg transition-transform duration-300 ease-in-out transform translate-x-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Saisie des poids en masse</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Date
                    </th>
                    {pets.map(pet => (
                      <th key={pet.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {pet.name}
                      </th>
                    ))}
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="date"
                          value={entry.date}
                          onChange={(e) => updateDate(index, e.target.value)}
                          className="block w-40 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </td>
                      {pets.map(pet => (
                        <td key={pet.id} className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={entry.weights[pet.id] || ''}
                            onChange={(e) => updateWeight(index, pet.id, e.target.value)}
                            placeholder="Kg"
                            className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          onClick={() => removeRow(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={addNewRow}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ajouter une ligne
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 