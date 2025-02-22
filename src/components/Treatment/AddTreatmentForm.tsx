import React, { useState } from 'react';
import { TreatmentType, TreatmentStatus } from '../../types/medical';
import { TreatmentService } from '../../services/treatment.service';

interface AddTreatmentFormProps {
  petId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const treatmentService = new TreatmentService();

export const AddTreatmentForm: React.FC<AddTreatmentFormProps> = ({
  petId,
  onSuccess,
  onCancel
}) => {
  const [type, setType] = useState<TreatmentType>(TreatmentType.CHECKUP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Champs communs
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const veterinarianId = 1; // À remplacer par une vraie liste plus tard

  // Champs spécifiques
  const [disease, setDisease] = useState('');
  const [batch, setBatch] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [product, setProduct] = useState('');
  const [weight, setWeight] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState(date);
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [temperature, setTemperature] = useState('');
  const [procedure, setProcedure] = useState('');
  const [anesthesia, setAnesthesia] = useState('');
  const [recovery, setRecovery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const commonFields = {
        petId,
        name,
        date: new Date(date),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        notes,
        veterinarianId,
        status: TreatmentStatus.PENDING,
      };

      switch (type) {
        case TreatmentType.VACCINATION:
          await treatmentService.createVaccination({
            ...commonFields,
            type: TreatmentType.VACCINATION,
            disease,
            batch,
            manufacturer,
            status: TreatmentStatus.PENDING,
          });
          break;

        case TreatmentType.DEWORMING:
          await treatmentService.createDeworming({
            ...commonFields,
            type: TreatmentType.DEWORMING,
            product,
            weight: parseFloat(weight),
            dosage
          });
          break;

        case TreatmentType.MEDICATION:
          await treatmentService.createMedication({
            ...commonFields,
            type: TreatmentType.MEDICATION,
            product,
            dosage,
            frequency,
            duration: parseInt(duration),
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          });
          break;

        case TreatmentType.CHECKUP:
          await treatmentService.createCheckup({
            ...commonFields,
            type: TreatmentType.CHECKUP,
            reason,
            diagnosis,
            prescription,
            weight: parseFloat(weight),
            temperature: temperature ? parseFloat(temperature) : undefined
          });
          break;

        case TreatmentType.SURGERY:
          await treatmentService.createSurgery({
            ...commonFields,
            type: TreatmentType.SURGERY,
            procedure,
            anesthesia,
            recovery
          });
          break;
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout du traitement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderSpecificFields = () => {
    switch (type) {
      case TreatmentType.VACCINATION:
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Maladie
                <input
                  type="text"
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                N° de lot
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fabricant
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </label>
            </div>
          </>
        );

      case TreatmentType.DEWORMING:
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Produit
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Poids (kg)
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  step="0.1"
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Dosage
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>
          </>
        );

      case TreatmentType.MEDICATION:
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Médicament
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Dosage
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fréquence
                <input
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  placeholder="ex: 2 fois par jour"
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Durée (jours)
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="1"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date de début
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </label>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date de fin
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </label>
              </div>
            </div>
          </>
        );

      case TreatmentType.CHECKUP:
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Motif
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Diagnostic
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Prescription
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Poids (kg)
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    step="0.1"
                  />
                </label>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Température (°C)
                  <input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    step="0.1"
                  />
                </label>
              </div>
            </div>
          </>
        );

      case TreatmentType.SURGERY:
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Procédure
                <textarea
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  rows={3}
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Anesthésie
                <input
                  type="text"
                  value={anesthesia}
                  onChange={(e) => setAnesthesia(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Suivi post-opératoire
                <textarea
                  value={recovery}
                  onChange={(e) => setRecovery(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </label>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Type de traitement
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TreatmentType)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            {Object.values(TreatmentType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Nom/Description
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </label>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Prochain rendez-vous
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {renderSpecificFields()}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 
                     bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                   bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}; 