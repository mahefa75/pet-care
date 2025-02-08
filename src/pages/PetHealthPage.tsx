import React, { useState } from 'react';
import { PetTimeline } from '../components/Timeline/PetTimeline';
import { AddGroomingForm } from '../components/Pet/AddGroomingForm';
import { AddHealthEventForm } from '../components/Pet/AddHealthEventForm';
import { GroomingHistory } from '../components/Pet/GroomingHistory';
import { useParams } from 'react-router-dom';
import { Offcanvas } from '../components/UI/Offcanvas';

export const PetHealthPage: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const [activeForm, setActiveForm] = useState<'grooming' | 'health' | null>(null);
  const [historyKey, setHistoryKey] = useState(0); // Pour forcer le rechargement de l'historique

  if (!petId) {
    return <div>Pet ID not found</div>;
  }

  const handleFormSuccess = () => {
    setActiveForm(null);
    setHistoryKey(prev => prev + 1); // Force le rechargement de l'historique
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Suivi santé et toilettage</h1>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveForm('grooming')}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Ajouter un toilettage
          </button>
          <button
            onClick={() => setActiveForm('health')}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Ajouter un événement santé
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Historique des toilettages */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historique des toilettages</h2>
            <GroomingHistory key={historyKey} petId={petId} />
          </div>
        </div>

        {/* Timeline des événements de santé */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historique des événements de santé</h2>
            <PetTimeline petId={petId} />
          </div>
        </div>
      </div>

      {/* Offcanvas forms */}
      <Offcanvas
        isOpen={activeForm === 'grooming'}
        onClose={() => setActiveForm(null)}
        title="Nouveau toilettage"
        size="xl"
      >
        <AddGroomingForm
          petId={petId}
          onSuccess={handleFormSuccess}
          onCancel={() => setActiveForm(null)}
        />
      </Offcanvas>

      <Offcanvas
        isOpen={activeForm === 'health'}
        onClose={() => setActiveForm(null)}
        title="Nouvel événement santé"
        size="xl"
      >
        <AddHealthEventForm
          petId={petId}
          onSuccess={handleFormSuccess}
          onCancel={() => setActiveForm(null)}
        />
      </Offcanvas>
    </div>
  );
}; 