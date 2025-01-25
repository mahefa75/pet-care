import React, { useState, useEffect } from 'react';
import { Treatment, TreatmentType, TreatmentFilters } from '../../types/medical';
import { TreatmentService } from '../../services/treatment.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TreatmentHistoryProps {
  petId: number;
  onAddTreatment?: () => void;
}

const treatmentService = new TreatmentService();

export const TreatmentHistory: React.FC<TreatmentHistoryProps> = ({
  petId,
  onAddTreatment
}) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TreatmentFilters>({
    petId,
    page: 1,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadTreatments();
  }, [filters]);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      const data = await treatmentService.getTreatments(filters);
      setTreatments(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des traitements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTreatmentIcon = (type: TreatmentType) => {
    switch (type) {
      case TreatmentType.VACCINATION:
        return '💉';
      case TreatmentType.DEWORMING:
        return '🪱';
      case TreatmentType.MEDICATION:
        return '💊';
      case TreatmentType.CHECKUP:
        return '👨‍⚕️';
      case TreatmentType.SURGERY:
        return '🏥';
      default:
        return '📋';
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Historique médical</h3>
        {onAddTreatment && (
          <button
            onClick={onAddTreatment}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Ajouter un traitement
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <select
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as TreatmentType || undefined }))}
          value={filters.type || ''}
        >
          <option value="">Tous les types</option>
          {Object.values(TreatmentType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {treatments.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Aucun traitement enregistré</p>
      ) : (
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <div
              key={treatment.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" role="img" aria-label={treatment.type}>
                  {getTreatmentIcon(treatment.type)}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                      <p className="text-sm text-gray-500">{treatment.type}</p>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(treatment.date)}</p>
                  </div>
                  {treatment.nextDueDate && (
                    <p className="mt-2 text-sm text-blue-600">
                      Prochain rendez-vous : {formatDate(treatment.nextDueDate)}
                    </p>
                  )}
                  {treatment.notes && (
                    <p className="mt-2 text-sm text-gray-600">{treatment.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-center space-x-2">
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
          disabled={filters.page === 1}
          onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
        >
          Précédent
        </button>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
          disabled={treatments.length < filters.limit}
          onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}; 