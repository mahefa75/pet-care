interface ApiKeys {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_MEASUREMENT_ID: string;
  VITE_GEMINI_API_KEY: string;
}

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

class ConfigService {
  private static instance: ConfigService;
  private apiKeys: ApiKeys | null = null;

  private constructor() {
    this.loadApiKeys();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadApiKeys(): void {
    try {
      const savedKeys = localStorage.getItem('apiKeys');
      if (savedKeys) {
        const parsedKeys = JSON.parse(savedKeys);
        // Valider que toutes les clés requises sont présentes
        if (this.validateApiKeys(parsedKeys)) {
          this.apiKeys = parsedKeys;
        } else {
          console.error('Configuration invalide dans le localStorage');
          this.apiKeys = null;
        }
      } else {
        this.apiKeys = null;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clés API:', error);
      this.apiKeys = null;
    }
  }

  private validateApiKeys(keys: any): keys is ApiKeys {
    const requiredKeys = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];

    return requiredKeys.every(key => 
      typeof keys[key] === 'string' && keys[key].trim() !== ''
    );
  }

  public getFirebaseConfig(): FirebaseConfig | null {
    this.loadApiKeys(); // Recharger pour avoir les dernières valeurs
    
    if (!this.apiKeys) {
      console.warn('Firebase configuration not found. Some features may be limited.');
      return null;
    }

    const config: FirebaseConfig = {
      apiKey: this.apiKeys.VITE_FIREBASE_API_KEY,
      authDomain: this.apiKeys.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: this.apiKeys.VITE_FIREBASE_PROJECT_ID,
      storageBucket: this.apiKeys.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: this.apiKeys.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: this.apiKeys.VITE_FIREBASE_APP_ID
    };

    if (this.apiKeys.VITE_FIREBASE_MEASUREMENT_ID) {
      config.measurementId = this.apiKeys.VITE_FIREBASE_MEASUREMENT_ID;
    }

    // Valider que toutes les valeurs sont non vides
    const emptyFields = Object.entries(config)
      .filter(([key, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      console.warn(`Incomplete Firebase configuration. Missing fields: ${emptyFields.join(', ')}`);
      return null;
    }

    return config;
  }

  public getGeminiApiKey(): string | null {
    this.loadApiKeys(); // Recharger pour avoir les dernières valeurs
    if (!this.apiKeys?.VITE_GEMINI_API_KEY) {
      console.warn('Gemini API key not found. AI features will be limited.');
      return null;
    }
    return this.apiKeys.VITE_GEMINI_API_KEY;
  }

  public isConfigured(): boolean {
    this.loadApiKeys();
    return this.apiKeys !== null && 
           Object.values(this.apiKeys).some(value => value && value.length > 0);
  }

  public getConfigStatus(): { firebase: boolean; gemini: boolean } {
    this.loadApiKeys();
    
    const firebaseConfig = this.getFirebaseConfig();
    const firebaseConfigured = firebaseConfig !== null;
    const geminiConfigured = this.getGeminiApiKey() !== null;

    return {
      firebase: firebaseConfigured,
      gemini: geminiConfigured
    };
  }

  public async testFirebaseConnection(): Promise<void> {
    try {
      const config = this.getFirebaseConfig();
      
      if (!config) {
        return Promise.reject(new Error('Firebase configuration is missing or incomplete'));
      }

      // Tester la connexion à Firebase
      const { initializeApp, getApp, deleteApp } = await import('firebase/app');
      const { getAuth, signOut } = await import('firebase/auth');

      // Nettoyer toute instance existante
      try {
        const existingApp = getApp();
        await deleteApp(existingApp);
      } catch {
        // Pas d'app existante
      }

      // Créer une nouvelle instance pour le test
      const testApp = initializeApp(config);
      const auth = getAuth(testApp);

      // Si on arrive ici, la connexion est réussie
      await deleteApp(testApp);
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors du test de connexion Firebase:', error);
      return Promise.reject(error);
    }
  }

  public async testGeminiConnection(): Promise<void> {
    try {
      const apiKey = this.getGeminiApiKey();
      if (!apiKey) {
        return Promise.reject(new Error('Gemini API key is not configured'));
      }

      // Tester la connexion à Gemini
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      // Faire un appel de test simple
      await model.generateContent('Test connection');
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors du test de connexion Gemini:', error);
      return Promise.reject(error);
    }
  }
}

export const configService = ConfigService.getInstance(); 