import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { PetsPage } from './pages/PetsPage';
import { PetDetailsPage } from './pages/PetDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  return (
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
                className={`${location.pathname === '/' ? 'border-blue-500' : 'border-transparent hover:border-gray-300'} 
                         text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Tableau de bord
              </Link>
              <Link
                to="/pets"
                className={`${location.pathname === '/pets' || location.pathname.startsWith('/pet/') ? 'border-blue-500' : 'border-transparent hover:border-gray-300'} 
                         text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Animaux
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              to="/settings"
              className={`${location.pathname === '/settings' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'} 
                       inline-flex items-center px-3 py-2 rounded-md text-sm font-medium`}
            >
              <Cog6ToothIcon className="h-5 w-5 mr-1" />
              Paramètres
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pets" element={<PetsPage />} />
            <Route path="/pet/:id" element={<PetDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;