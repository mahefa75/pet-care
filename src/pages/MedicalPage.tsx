import React, { useState, useEffect } from 'react';
import { groomingService } from '../services/grooming.service';
import { healthEventService } from '../services/healthEvent.service';
import { AddGroomingForm } from '../components/Pet/AddGroomingForm';
import { AddHealthEventForm } from '../components/Pet/AddHealthEventForm';
import { Offcanvas } from '../components/UI/Offcanvas';
import { PetService } from '../services/pet.service';
import { Timeline } from '../components/Timeline/Timeline';

const MedicalPage: React.FC = () => {
  const [activeForm, setActiveForm] = useState<'grooming' | 'health' | null>(null);
  const [upcomingGrooming, setUpcomingGrooming] = useState<any[]>([]);
  const [activeHealthEvents, setActiveHealthEvents] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);

  useEffect(() => {
    loadUpcomingGrooming();
    loadActiveHealthEvents();
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const petService = new PetService();
      const allPets = await petService.getPets({ page: 1, limit: 100 });
      setPets(allPets);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const loadUpcomingGrooming = async () => {
    try {
      const records = await groomingService.getUpcomingGrooming();
      setUpcomingGrooming(records.map(record => ({
        ...record,
        petName: pets.find(p => p.id.toString() === record.petId)?.name || 'Animal inconnu'
      })));
    } catch (error) {
      console.error('Error loading upcoming grooming:', error);
    }
  };

  const loadActiveHealthEvents = async () => {
    try {
      const events = await healthEventService.getActiveHealthEvents();
      setActiveHealthEvents(events.map(event => ({
        ...event,
        petName: pets.find(p => p.id.toString() === event.petId)?.name || 'Animal inconnu'
      })));
    } catch (error) {
      console.error('Error loading active health events:', error);
    }
  };

  const handleFormSuccess = () => {
    setActiveForm(null);
    loadUpcomingGrooming();
    loadActiveHealthEvents();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Soins et suivis médicaux</h1>
        <div className="flex space-x-4">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Section des toilettages à venir */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Toilettages à venir</h2>
          <div className="space-y-4">
            {upcomingGrooming.length === 0 ? (
              <p className="text-gray-500">Aucun toilettage programmé</p>
            ) : (
              upcomingGrooming.map((record) => (
                <div
                  key={record.id}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <p className="font-medium">{record.petName} - {record.type}</p>
                  <p className="text-sm text-gray-600">{record.description}</p>
                  <p className="text-sm text-gray-500">
                    Prochain rendez-vous: {new Date(record.nextAppointment).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section des événements de santé actifs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Événements de santé actifs</h2>
          <div className="space-y-4">
            {activeHealthEvents.length === 0 ? (
              <p className="text-gray-500">Aucun événement de santé actif</p>
            ) : (
              activeHealthEvents.map((event) => (
                <div
                  key={event.id}
                  className={`border-l-4 pl-4 py-2 ${
                    event.severity === 'high'
                      ? 'border-red-500'
                      : event.severity === 'medium'
                      ? 'border-yellow-500'
                      : 'border-green-500'
                  }`}
                >
                  <p className="font-medium">{event.petName} - {event.type}</p>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <p className="text-sm text-gray-500">
                    Depuis le: {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Timeline des événements */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Historique</h2>
        <div className="mt-8 px-8">
          <Timeline />
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
          onSuccess={handleFormSuccess}
          onCancel={() => setActiveForm(null)}
        />
      </Offcanvas>
    </div>
  );
};

export default MedicalPage; 