import React, { useEffect, useState, useCallback } from 'react';

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const checkConnection = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // On vérifie d'abord l'état du navigateur
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }

      // Ensuite on fait un ping vers Google pour être sûr
      await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
        mode: 'no-cors'
      });
      
      clearTimeout(timeoutId);
      setIsOnline(true);
    } catch (error: unknown) {
      // On ne met pas hors ligne si c'est juste le timeout qui a expiré
      // et que le navigateur dit qu'on est en ligne
      if (error instanceof Error && error.name === 'AbortError' && navigator.onLine) {
        return;
      }
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      // On attend un peu pour laisser le temps à la connexion de se stabiliser
      setTimeout(checkConnection, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      // On vérifie à nouveau après un court délai au cas où c'était une fausse alerte
      setTimeout(checkConnection, 1000);
    };

    // Vérification initiale
    checkConnection();

    // Vérification périodique toutes les 5 secondes
    const intervalId = setInterval(checkConnection, 5000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkConnection]);

  return (
    <div
      className={`
        fixed bottom-4 right-4 text-xs px-2 py-1 rounded-full z-50
        flex items-center gap-1 opacity-80 hover:opacity-100
        transition-all duration-300 ease-in-out cursor-default
        ${isOnline 
          ? 'bg-green-50 text-green-600' 
          : 'bg-red-50 text-red-600'
        }
      `}
    >
      <span 
        className={`
          w-1.5 h-1.5 rounded-full
          ${isOnline ? 'bg-green-600' : 'bg-red-600'}
        `} 
      />
      {isOnline ? 'En ligne' : 'Hors ligne'}
    </div>
  );
};

export default ConnectionStatus; 