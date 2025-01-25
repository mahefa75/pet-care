import React, { useState, useEffect } from 'react';
import { Pet, MedicalRecord } from './types';
import { PawPrint, Plus, Calendar, Syringe, Shield, Pill } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as db from './lib/db';

function App() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      fetchMedicalRecords(selectedPet.id);
    }
  }, [selectedPet]);

  const fetchPets = async () => {
    const fetchedPets = await db.getPets();
    setPets(fetchedPets);
  };

  const fetchMedicalRecords = async (petId: string) => {
    const records = await db.getMedicalRecords(petId);
    setMedicalRecords(records);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PawPrint className="w-8 h-8 text-blue-600" />
            Pet Care
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Liste des animaux */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Mes animaux</h2>
              <button
                onClick={() => setShowAddPet(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {pets.map(pet => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedPet?.id === pet.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{pet.name}</div>
                  <div className="text-sm text-gray-500">
                    {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Détails de l'animal sélectionné */}
          {selectedPet && (
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPet.name}</h2>
                    <p className="text-gray-600">
                      {selectedPet.species} {selectedPet.breed ? `• ${selectedPet.breed}` : ''}
                    </p>
                    {selectedPet.birth_date && (
                      <p className="text-sm text-gray-500">
                        Né(e) le {format(parseISO(selectedPet.birth_date), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddRecord(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un soin
                  </button>
                </div>

                {/* Prochains soins */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Prochains soins</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {medicalRecords
                      .filter(record => record.next_due_date && isAfter(parseISO(record.next_due_date), new Date()))
                      .sort((a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime())
                      .slice(0, 3)
                      .map(record => (
                        <div key={record.id} className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {record.type === 'vaccination' && <Syringe className="w-5 h-5 text-blue-600" />}
                            {record.type === 'deworming' && <Shield className="w-5 h-5 text-blue-600" />}
                            {record.type === 'checkup' && <Calendar className="w-5 h-5 text-blue-600" />}
                            {record.type === 'other' && <Pill className="w-5 h-5 text-blue-600" />}
                            <span className="font-medium">{record.type}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Prévu le {format(parseISO(record.next_due_date!), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Historique des soins */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Historique des soins</h3>
                  <div className="space-y-4">
                    {medicalRecords.map(record => (
                      <div key={record.id} className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          {record.type === 'vaccination' && <Syringe className="w-5 h-5 text-gray-600" />}
                          {record.type === 'deworming' && <Shield className="w-5 h-5 text-gray-600" />}
                          {record.type === 'checkup' && <Calendar className="w-5 h-5 text-gray-600" />}
                          {record.type === 'other' && <Pill className="w-5 h-5 text-gray-600" />}
                          <span className="font-medium">{record.type}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Effectué le {format(parseISO(record.date), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;