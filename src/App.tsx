import React, { useState, useEffect } from 'react';
import { Pet, MedicalRecord } from './types';
import { PawPrint, Plus, Calendar, Syringe, Shield, Pill } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as db from './lib/db';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PetsPage } from './pages/PetsPage';

const App: React.FC = () => {
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
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-blue-600">PetCare</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 
                             border-b-2 text-sm font-medium"
                  >
                    Animaux
                  </Link>
                  {/* Autres liens de navigation à ajouter ici */}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<PetsPage />} />
            {/* Autres routes à ajouter ici */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;