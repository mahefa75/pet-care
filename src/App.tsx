import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { PetsPage } from './pages/PetsPage';
import { PetDetailsPage } from './pages/PetDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { Cog6ToothIcon, Bars3Icon, HomeIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { PawPrint } from 'lucide-react';
import MedicalPage from './pages/MedicalPage';
import { PetHealthPage } from './pages/PetHealthPage';
import ConnectionStatus from './components/common/ConnectionStatus';
import { Offcanvas } from './components/UI/Offcanvas';
import { DataInitializationService } from './services/data-initialization.service';

// Initialiser le service de données
const dataInitService = new DataInitializationService();

// Composant de navigation mobile en bas de l'écran
const MobileNavBar: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full h-full ${
            location.pathname === '/' ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <HomeIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Accueil</span>
        </Link>
        <Link
          to="/pets"
          className={`flex flex-col items-center justify-center w-full h-full ${
            location.pathname === '/pets' || location.pathname.startsWith('/pet/') 
              ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <PawPrint className="h-6 w-6" />
          <span className="text-xs mt-1">Animaux</span>
        </Link>
        <Link
          to="/medical"
          className={`flex flex-col items-center justify-center w-full h-full ${
            location.pathname === '/medical' ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <BeakerIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Soins</span>
        </Link>
        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center w-full h-full ${
            location.pathname === '/settings' ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <Cog6ToothIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Réglages</span>
        </Link>
      </div>
    </div>
  );
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">PetCare</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
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
              <Link
                to="/medical"
                className={`${location.pathname === '/medical' ? 'border-blue-500' : 'border-transparent hover:border-gray-300'} 
                         text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Soins et suivis médicaux
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button - masqué car remplacé par la barre de navigation en bas */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="hidden md:flex md:items-center">
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
      
      {/* Mobile menu as Offcanvas */}
      <Offcanvas 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        title="Menu"
        size="md"
      >
        <div className="space-y-4">
          <Link
            to="/"
            className={`${location.pathname === '/' 
              ? 'bg-blue-50 border-blue-500 text-blue-700' 
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} 
              block pl-3 pr-4 py-3 border-l-4 text-base font-medium rounded-md`}
            onClick={() => setIsMenuOpen(false)}
          >
            Tableau de bord
          </Link>
          <Link
            to="/pets"
            className={`${location.pathname === '/pets' || location.pathname.startsWith('/pet/') 
              ? 'bg-blue-50 border-blue-500 text-blue-700' 
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} 
              block pl-3 pr-4 py-3 border-l-4 text-base font-medium rounded-md`}
            onClick={() => setIsMenuOpen(false)}
          >
            Animaux
          </Link>
          <Link
            to="/medical"
            className={`${location.pathname === '/medical' 
              ? 'bg-blue-50 border-blue-500 text-blue-700' 
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} 
              block pl-3 pr-4 py-3 border-l-4 text-base font-medium rounded-md`}
            onClick={() => setIsMenuOpen(false)}
          >
            Soins et suivis médicaux
          </Link>
          <Link
            to="/settings"
            className={`${location.pathname === '/settings' 
              ? 'bg-blue-50 border-blue-500 text-blue-700' 
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} 
              block pl-3 pr-4 py-3 border-l-4 text-base font-medium rounded-md`}
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center">
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Paramètres
            </div>
          </Link>
        </div>
      </Offcanvas>
    </nav>
  );
};

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Initialiser le service de données au démarrage de l'application
    const initializeData = async () => {
      try {
        await dataInitService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des données:', error);
        setInitError(error instanceof Error ? error.message : 'Erreur inconnue');
        setIsInitialized(true); // On considère l'app comme initialisée même en cas d'erreur
      }
    };

    initializeData();
  }, []);

  // Afficher un écran de chargement pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur si l'initialisation a échoué
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">Erreur d'initialisation</h1>
          <p className="text-gray-600 mb-4">{initError}</p>
          <p className="text-gray-500 text-sm">
            Veuillez vérifier votre connexion internet et rafraîchir la page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <ConnectionStatus />
        <main className="pt-16 pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pets" element={<PetsPage />} />
            <Route path="/pet/:id" element={<PetDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/medical" element={<MedicalPage />} />
            <Route path="/pet/:id/health" element={<PetHealthPage />} />
          </Routes>
        </main>
        <MobileNavBar />
      </div>
    </Router>
  );
};

export default App;