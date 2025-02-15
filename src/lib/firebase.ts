import { auth as firebaseAuth, db as firebaseDb, storage as firebaseStorage } from '../firebase/config';
import { configService } from '../services/config.service';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const reinitializeFirebase = async () => {
  try {
    // Nettoyer les instances existantes
    getApps().forEach(app => {
      deleteApp(app);
    });

    // Récupérer la configuration depuis le configService
    const firebaseConfig = configService.getFirebaseConfig();

    if (!firebaseConfig) {
      console.warn('Impossible de réinitialiser Firebase : configuration manquante ou incomplète');
      return;
    }

    // Initialiser Firebase avec la nouvelle configuration
    const app = initializeApp(firebaseConfig);
    
    // Réinitialiser les services
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    console.log('Firebase réinitialisé avec succès');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de Firebase:', error);
  }
};

// Exporter les services
export const auth = firebaseAuth;
export const db = firebaseDb;
export const storage = firebaseStorage; 