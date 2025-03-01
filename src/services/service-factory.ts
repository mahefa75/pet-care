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
  }

  // Changer le type de stockage
  static setStorageType(type: StorageType): void {
    ServiceFactory.storageManager.setStorageType(type);
  }

  // Obtenir le type de stockage actuel
  static getStorageType(): StorageType {
    return ServiceFactory.storageManager.getStorageType();
  }

  // Changer le mode de stockage
  static setStorageMode(mode: StorageMode): void {
    ServiceFactory.storageManager.setStorageMode(mode);
  }

  // Obtenir le mode de stockage actuel
  static getStorageMode(): StorageMode {
    return ServiceFactory.storageManager.getStorageMode();
  }

  // Vérifier si la synchronisation locale est activée
  static isSyncWithLocalDbEnabled(): boolean {
    return ServiceFactory.storageManager.getStorageMode() === StorageMode.HYBRID;
  }

  // Factory methods pour chaque service
  static getPetService() {
    const storageType = ServiceFactory.storageManager.getStorageType();
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
    // Retourner directement l'instance singleton
    return foodService;
  }

  static getGroomingService() {
    // Retourner directement l'instance singleton
    return groomingService;
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
      ? new VeterinarianService() // À remplacer par SupabaseVeterinarianService quand disponible
      : new VeterinarianService();
  }

  static getAppointmentService() {
    const storageType = ServiceFactory.storageManager.getStorageType();
    return storageType === StorageType.SUPABASE 
      ? new AppointmentService() // À remplacer par SupabaseAppointmentService quand disponible
      : new AppointmentService();
  }
} 