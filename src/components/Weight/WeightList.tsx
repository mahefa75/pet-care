import React, { useState } from 'react';
import { WeightMeasurement } from '../../types/pet';
import { WeightService } from '../../services/weight.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface WeightListProps {
  weights: WeightMeasurement[];
  onWeightUpdated: () => void;
}

const weightService = new WeightService();

export const WeightList: React.FC<WeightListProps> = ({ weights, onWeightUpdated }) => {
  const [editingWeight, setEditingWeight] = useState<WeightMeasurement | null>(null);
  const [newWeight, setNewWeight] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (weight: WeightMeasurement) => {
    setEditingWeight(weight);
    setNewWeight(weight.weight.toString());
  };

  const handleSave = async () => {
    if (!editingWeight) return;

    try {
      const weightValue = parseFloat(newWeight);
      if (isNaN(weightValue) || weightValue <= 0) {
        setError('Le poids doit être un nombre positif');
        return;
      }

      await weightService.updateWeight({
        ...editingWeight,
        weight: Math.round(weightValue * 1000) / 1000
      });

      setEditingWeight(null);
      setNewWeight('');
      setError(null);
      onWeightUpdated();
    } catch (err) {
      setError('Erreur lors de la modification du poids');
      console.error(err);
    }
  };

  const handleDelete = async (weightId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette mesure ?')) return;

    try {
      await weightService.deleteWeight(weightId);
      onWeightUpdated();
    } catch (err) {
      setError('Erreur lors de la suppression du poids');
      console.error(err);
    }
  };

  return (
    <div className="mt-4">
      {error && (
        <div className="mb-4 text-red-600 text-sm">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Poids (kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {weights.map(weight => (
              <tr key={weight.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(weight.date), 'dd MMM yyyy', { locale: fr })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingWeight?.id === weight.id ? (
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    weight.weight
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {weight.notes || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingWeight?.id === weight.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={() => {
                          setEditingWeight(null);
                          setNewWeight('');
                          setError(null);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleEdit(weight)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(weight.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 