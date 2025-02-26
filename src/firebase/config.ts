import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { configService } from '../services/config.service';

// Variables pour stocker les services Firebase
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  // Nettoyer les instances existantes
  getApps().forEach(app => {
    deleteApp(app);
  });

  // Récupérer la configuration depuis le configService
  const firebaseConfig = configService.getFirebaseConfig();

  if (firebaseConfig) {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Initialize Firebase services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    console.log('Firebase initialisé avec succès');
  } else {
    console.warn('Firebase non initialisé : configuration manquante ou incomplète');
  }
} catch (error) {
  console.error('Erreur lors de l\'initialisation de Firebase:', error);
}

// Exporter les services (null si non initialisés)
export { auth, db, storage }; 