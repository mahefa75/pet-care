import React, { useState, useEffect } from 'react';
import { Pet } from '../../types/pet';
import { HealthEvent } from '../../services/healthEvent.service';
import { HealthAdvice, healthAdviceService } from '../../services/healthAdvice.service';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Offcanvas } from '../UI/Offcanvas';
import styles from './HealthAdviceCard.module.css';

interface HealthAdviceCardProps {
  pet: Pet;
  event: HealthEvent;
  onEventUpdate?: () => void;
}

export const HealthAdviceCard: React.FC<HealthAdviceCardProps> = ({ 
  pet, 
  event,
  onEventUpdate 
}) => {
  const [advice, setAdvice] = useState<HealthAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAdvice();
    }
  }, [isOpen, pet.id, event.id]);

  const loadAdvice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Chargement des conseils pour:', { pet, event });
      const result = await healthAdviceService.getAdviceForHealthEvent(pet, event);
      console.log('Conseils reçus:', result);
      setAdvice(result);
    } catch (err: any) {
      console.error('Erreur lors du chargement des conseils:', err);
      setError(err.message || 'Une erreur est survenue lors du chargement des conseils');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdvice = () => {
    setIsOpen(true);
  };

  const handleCloseAdvice = () => {
    setIsOpen(false);
    // Notifier le parent que l'événement a été mis à jour après la fermeture
    onEventUpdate?.();
  };

  if (!pet || !event) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleOpenAdvice}
        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
      >
        <InformationCircleIcon className="h-4 w-4 mr-1" />
        Conseils personnalisés
      </button>

      <Offcanvas
        isOpen={isOpen}
        onClose={handleCloseAdvice}
        title={`Conseils de santé pour ${pet.name}`}
        size="lg"
      >
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Analyse en cours...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : advice ? (
            <>
              {/* Conseil général */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800">{advice.generalAdvice}</p>
              </div>

              {/* Recommandations spécifiques */}
              {advice.specificRecommendations.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Recommandations</h4>
                  <ul className="space-y-2">
                    {advice.specificRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-blue-500">•</span>
                        <span className="ml-2">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Signes d'alerte */}
              {advice.warningSignsToWatch.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-red-800 mb-3">Signes d'alerte à surveiller</h4>
                  <ul className="space-y-2">
                    {advice.warningSignsToWatch.map((sign, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-red-500">⚠</span>
                        <span className="ml-2 text-red-700">{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ajustements du mode de vie */}
              {advice.lifestyleAdjustments.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Ajustements recommandés</h4>
                  <ul className="space-y-2">
                    {advice.lifestyleAdjustments.map((adj, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-green-500">✓</span>
                        <span className="ml-2">{adj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommandation alimentaire */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Alimentation recommandée</h4>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-32 flex-shrink-0">
                    <img
                      src={advice.foodRecommendation.imageUrl}
                      alt={advice.foodRecommendation.productName}
                      className="w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                  <div className="flex-grow">
                    <h5 className="font-medium text-blue-600">
                      {advice.foodRecommendation.productName}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {advice.foodRecommendation.reasonForRecommendation}
                    </p>
                    <div className="mt-3 p-2 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium text-blue-800">
                        Ration quotidienne recommandée :
                      </p>
                      <p className="text-sm text-blue-600">
                        {advice.foodRecommendation.dailyPortion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quand consulter */}
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-red-800 mb-2">Quand consulter un vétérinaire</h4>
                <p className="text-red-700">{advice.whenToConsultVet}</p>
              </div>
            </>
          ) : null}
        </div>
      </Offcanvas>
    </>
  );
}; 