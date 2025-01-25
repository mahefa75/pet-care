import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PetsPage } from './pages/PetsPage';
import { MedicalFollowUpTest } from './components/Treatment/MedicalFollowUpTest';
import { PetDetailsPage } from './pages/PetDetailsPage';

const App: React.FC = () => {
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
                  <Link
                    to="/test-medical"
                    className="text-gray-900 inline-flex items-center px-1 pt-1 
                             border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                  >
                    Test Suivi Médical
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<PetsPage />} />
            <Route path="/test-medical" element={<MedicalFollowUpTest />} />
            <Route path="/pet/:id" element={<PetDetailsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;