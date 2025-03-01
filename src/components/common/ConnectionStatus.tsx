import React, { useState, useEffect } from 'react';
import { ServiceFactory, StorageType } from '../../services/service-factory';
import { supabase } from '../../lib/supabase';

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);

  // Vérifier si l'application utilise Supabase
  useEffect(() => {
    const checkStorageType = () => {
      const storageType = ServiceFactory.getStorageType();
      setIsUsingSupabase(storageType === StorageType.SUPABASE);
    };

    // Vérifier au chargement
    checkStorageType();

    // Écouter les changements de type de stockage
    window.addEventListener('storage', (event) => {
      if (event.key === 'storageType') {
        checkStorageType();
      }
    });

    return () => {
      window.removeEventListener('storage', () => {});
    };
  }, []);

  // Vérifier la connexion à Supabase si nécessaire
  useEffect(() => {
    if (isUsingSupabase) {
      const checkSupabaseConnection = async () => {
        try {
          const { error } = await supabase.from('pets').select('count');
          setSupabaseConnected(!error);
        } catch (error) {
          setSupabaseConnected(false);
        }
      };

      checkSupabaseConnection();

      // Vérifier périodiquement la connexion à Supabase
      const interval = setInterval(checkSupabaseConnection, 30000); // Toutes les 30 secondes
      return () => clearInterval(interval);
    } else {
      setSupabaseConnected(null); // Pas pertinent si on n'utilise pas Supabase
    }
  }, [isUsingSupabase]);

  // Surveiller la connexion internet
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ne rien afficher si tout va bien
  if (isOnline && (!isUsingSupabase || supabaseConnected === true)) {
    return null;
  }

  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-40 flex justify-center">
      <div className={`px-4 py-2 rounded-md shadow-md text-white text-sm font-medium ${
        !isOnline ? 'bg-red-500' : 'bg-yellow-500'
      }`}>
        {!isOnline ? (
          <span>Vous êtes hors ligne. Certaines fonctionnalités peuvent ne pas être disponibles.</span>
        ) : isUsingSupabase && supabaseConnected === false ? (
          <span>Connexion à Supabase perdue. Vos données sont enregistrées localement.</span>
        ) : null}
      </div>
    </div>
  );
};

export default ConnectionStatus; 