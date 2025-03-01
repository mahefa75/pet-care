import { PetService } from './pet.service';
import { SupabasePetService } from './supabase/pet.service';
import { WeightService } from './weight.service';
import { SupabaseWeightService } from './supabase/weight.service';
import { TreatmentService } from './treatment.service';
import { SupabaseTreatmentService } from './supabase/treatment.service';
import { foodService } from './food.service';
import { groomingService } from './grooming.service';
// import { HealthEventService } from './health-event.service';
import { VeterinarianService } from './veterinarian.service';
import { AppointmentService } from './appointment.service';
import { SupabaseFoodService } from './supabase/food.service';
import { SupabaseGroomingService } from './supabase/grooming.service';
import { SupabaseVeterinarianService } from './supabase/veterinarian.service';
import { SupabaseAppointmentService } from './supabase/appointment.service';

// Importer les services Supabase (à créer pour chaque service)
// import { SupabaseTreatmentService } from './supabase/treatment.service';
// etc.

// Enum pour les types de stockage
export enum StorageType {
  DEXIE = 'dexie',
  SUPABASE = 'supabase'
}

// Enum pour les modes de stockage
export enum StorageMode {
  DEXIE_ONLY = 'dexie_only',
  SUPABASE_ONLY = 'supabase_only',
  HYBRID = 'hybrid'
}

// Singleton pour stocker le type de stockage actuel
class StorageManager {
  private static instance: StorageManager;
  private storageType: StorageType = StorageType.DEXIE; // Par défaut, utiliser Dexie
  private storageMode: StorageMode = StorageMode.DEXIE_ONLY; // Par défaut, mode Dexie uniquement

  private constructor() {}

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  public getStorageType(): StorageType {
    return this.storageType;
  }

  public setStorageType(type: StorageType): void {
    this.storageType = type;
    // Sauvegarder le choix dans localStorage pour le conserver entre les sessions
    localStorage.setItem('storageType', type);
    
    // Mettre à jour le mode de stockage en fonction du type
    if (type === StorageType.DEXIE) {
      this.storageMode = StorageMode.DEXIE_ONLY;
      localStorage.setItem('storageMode', StorageMode.DEXIE_ONLY);
    } else {
      // Si on passe à Supabase, on utilise le mode hybride par défaut
      // sauf si le mode Supabase uniquement est déjà configuré
      if (this.storageMode !== StorageMode.SUPABASE_ONLY) {
        this.storageMode = StorageMode.HYBRID;
        localStorage.setItem('storageMode', StorageMode.HYBRID);
      }
    }
  }

  public getStorageMode(): StorageMode {
    return this.storageMode;
  }

  public setStorageMode(mode: StorageMode): void {
    this.storageMode = mode;
    localStorage.setItem('storageMode', mode);
    
    // Mettre à jour le type de stockage en fonction du mode
    if (mode === StorageMode.DEXIE_ONLY) {
      this.storageType = StorageType.DEXIE;
      localStorage.setItem('storageType', StorageType.DEXIE);
    } else {
      this.storageType = StorageType.SUPABASE;
      localStorage.setItem('storageType', StorageType.SUPABASE);
    }
    
    // Mettre à jour le flag de synchronisation locale
    localStorage.setItem('syncWithLocalDb', mode === StorageMode.HYBRID ? 'true' : 'false');
  }

  public initFromLocalStorage(): void {
    // Récupérer le type de stockage
    const savedType = localStorage.getItem('storageType') as StorageType;
    if (savedType && Object.values(StorageType).includes(savedType)) {
      this.storageType = savedType;
    }
    
    // Récupérer le mode de stockage
    const savedMode = localStorage.getItem('storageMode') as StorageMode;
    if (savedMode && Object.values(StorageMode).includes(savedMode)) {
      this.storageMode = savedMode;
    } else {
      // Si le mode n'est pas défini mais que le type est Supabase, on utilise le mode hybride par défaut
      if (this.storageType === StorageType.SUPABASE) {
        this.storageMode = StorageMode.HYBRID;
        localStorage.setItem('storageMode', StorageMode.HYBRID);
      }
    }
  }
}

// Factory pour obtenir l'instance du service approprié
export class ServiceFactory {
  private static storageManager = StorageManager.getInstance();

  // Initialiser le type de stockage depuis localStorage
  static initialize(): void {
    ServiceFactory.storageManager.initFromLocalStorage();
    console.log('ServiceFactory initialisé avec le type de stockage:', ServiceFactory.getStorageType());
    console.log('ServiceFactory initialisé avec le mode de stockage:', ServiceFactory.getStorageMode());
  }

  // Changer le type de stockage
  static setStorageType(type: StorageType): void {
    console.log('ServiceFactory: Changement du type de stockage vers', type);
    ServiceFactory.storageManager.setStorageType(type);
  }

  // Obtenir le type de stockage actuel
  static getStorageType(): StorageType {
    const type = ServiceFactory.storageManager.getStorageType();
    return type;
  }

  // Changer le mode de stockage
  static setStorageMode(mode: StorageMode): void {
    console.log('ServiceFactory: Changement du mode de stockage vers', mode);
    ServiceFactory.storageManager.setStorageMode(mode);
    console.log('ServiceFactory: Nouveau type de stockage après changement de mode:', ServiceFactory.getStorageType());
  }

  // Obtenir le mode de stockage actuel
  static getStorageMode(): StorageMode {
    const mode = ServiceFactory.storageManager.getStorageMode();
    return mode;
  }

  // Vérifier si la synchronisation locale est activée
  static isSyncWithLocalDbEnabled(): boolean {
    return ServiceFactory.storageManager.getStorageMode() === StorageMode.HYBRID;
  }

  // Factory methods pour chaque service
  static getPetService() {
    const storageType = ServiceFactory.storageManager.getStorageType();
    console.log('ServiceFactory: getPetService utilise le type de stockage:', storageType);
    return storageType === StorageType.SUPABASE 
      ? new SupabasePetService() 
      : new PetService();
  }

  static getWeightService() {
    const storageType = ServiceFactory.storageManager.getStorageType();
    return storageType === StorageType.SUPABASE 
      ? new SupabaseWeightService()
      : new WeightService();
  }

  /**
   * Retourne le service de traitement approprié en fonction du type de stockage
   */
  static getTreatmentService(): TreatmentService | SupabaseTreatmentService {
    const storageType = ServiceFactory.storageManager.getStorageType();
    return storageType === StorageType.SUPABASE 
      ? new SupabaseTreatmentService()
      : new TreatmentService();
  }

  static getFoodService() {
    const storageType = ServiceFactory.storageManager.getStorageType();
    // Vérifier si nous devons utiliser Supabase ou Dexie
    if (storageType === StorageType.SUPABASE) {
      // Créer une instance du service Supabase pour la nourriture
      return new SupabaseFoodService();
    } else {
      // Retourner l'instance singleton pour Dexie
      return foodService;
    }
  }

  static getGroomingService() {
    const storageType = ServiceFactory.storageManager.getStorageType();
    // Vérifier si nous devons utiliser Supabase ou Dexie
    if (storageType === StorageType.SUPABASE) {
      // Créer une instance du service Supabase pour le toilettage
      return new SupabaseGroomingService();
    } else {
      // Retourner l'instance singleton pour Dexie
      return groomingService;
    }
  }

  /* 
  static getHealthEventService() {
    const storageType = ServiceFactory.storageManager.getStorageType();
    return storageType === StorageType.SUPABASE 
      ? new HealthEventService() // À remplacer par SupabaseHealthEventService quand disponible
      : new HealthEventService();
  }
  */

  static getVeterinarianService() {
    const storageType = ServiceFactory.storageManager.getStorageType();
    return storageType === StorageType.SUPABASE 
      ? new SupabaseVeterinarianService()
      : new VeterinarianService();
  }

  static getAppointmentService() {
    const storageType = ServiceFactory.storageManager.getStorageType();
    return storageType === StorageType.SUPABASE 
      ? new SupabaseAppointmentService()
      : new AppointmentService();
  }

  // Réinitialiser complètement le stockage et forcer l'utilisation de Supabase
  static forceSupabaseOnly(): void {
    console.log('ServiceFactory: Forçage du mode Supabase uniquement');
    
    // Supprimer toutes les entrées du localStorage liées au stockage
    localStorage.removeItem('storageType');
    localStorage.removeItem('storageMode');
    localStorage.removeItem('syncWithLocalDb');
    
    // Définir explicitement les valeurs dans localStorage
    localStorage.setItem('storageType', StorageType.SUPABASE);
    localStorage.setItem('storageMode', StorageMode.SUPABASE_ONLY);
    localStorage.setItem('syncWithLocalDb', 'false');
    
    // Mettre à jour le StorageManager
    ServiceFactory.storageManager.setStorageMode(StorageMode.SUPABASE_ONLY);
    
    console.log('ServiceFactory: Mode forcé à Supabase uniquement');
    console.log('Type de stockage actuel:', ServiceFactory.getStorageType());
    console.log('Mode de stockage actuel:', ServiceFactory.getStorageMode());
  }
} 