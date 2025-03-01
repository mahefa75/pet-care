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

// Singleton pour stocker le type de stockage actuel
class StorageManager {
  private static instance: StorageManager;
  private storageType: StorageType = StorageType.DEXIE; // Par défaut, utiliser Dexie

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
  }

  public initFromLocalStorage(): void {
    const savedType = localStorage.getItem('storageType') as StorageType;
    if (savedType && Object.values(StorageType).includes(savedType)) {
      this.storageType = savedType;
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