import React, { useState } from 'react';
import { WeightService } from '../../services/weight.service';

interface AddWeightFormProps {
  petId: number;
  onWeightAdded: () => void;
}

const weightService = new WeightService();

export const AddWeightForm: React.FC<AddWeightFormProps> = ({ petId, onWeightAdded }) => {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !date) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError('Le poids doit être un nombre positif');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Arrondir à 3 décimales pour éviter les problèmes de précision
      const roundedWeight = Math.round(weightValue * 1000) / 1000;
      
      await weightService.addWeightMeasurement({
        petId,
        weight: roundedWeight,
        date: new Date(date),
        notes: notes.trim() || undefined
      });
      
      setWeight('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      onWeightAdded();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de la mesure');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Accepter uniquement les nombres avec jusqu'à 3 décimales
    if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
      setWeight(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date de la mesure *
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
            Poids (kg) *
          </label>
          <input
            type="number"
            id="weight"
            step="0.001"
            min="0"
            value={weight}
            onChange={handleWeightChange}
            placeholder="0.000"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Précision jusqu'à 3 décimales (0.001)</p>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Commentaires sur la mesure..."
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : 'Ajouter la mesure'}
        </button>
      </div>
    </form>
  );
}; 