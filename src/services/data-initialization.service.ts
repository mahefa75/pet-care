import { supabase } from '../lib/supabase';
import { ServiceFactory, StorageType } from './service-factory';
import { db } from '../lib/db';

/**
 * Service responsable de l'initialisation des données de l'application
 * Vérifie si l'application doit utiliser Supabase et charge les données si nécessaire
 */
export class DataInitializationService {
  /**
   * Initialise l'application en vérifiant la source de données à utiliser
   */
  async initialize(): Promise<void> {
    console.log('Initialisation du service de données...');
    
    // Initialiser le type de stockage depuis localStorage
    ServiceFactory.initialize();
    
    // Vérifier si l'utilisateur a choisi d'utiliser Supabase
    const useSupabase = ServiceFactory.getStorageType() === StorageType.SUPABASE;
    
    if (useSupabase) {
      console.log('Supabase est configuré comme source de données. Vérification de la connexion...');
      
      // Vérifier la connexion à Supabase
      const isConnected = await this.checkSupabaseConnection();
      
      if (isConnected) {
        console.log('Connexion à Supabase établie. L\'application utilisera Supabase comme source de données.');
        
        // Vérifier si des données existent déjà dans la base locale
        // Si la base locale est vide et que Supabase contient des données, on peut les charger
        await this.loadInitialDataIfNeeded();
      } else {
        console.warn('Impossible de se connecter à Supabase. Retour à la base de données locale.');
        ServiceFactory.setStorageType(StorageType.DEXIE);
      }
    } else {
      console.log('L\'application utilisera la base de données locale (Dexie).');
    }
  }

  /**
   * Vérifie si la connexion à Supabase est établie
   */
  private async checkSupabaseConnection(): Promise<boolean> {
    try {
      // Tenter une requête simple pour vérifier la connexion
      const { error } = await supabase.from('pets').select('count');
      
      if (error) {
        console.error('Erreur de connexion à Supabase:', error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception lors de la vérification de la connexion à Supabase:', error);
      return false;
    }
  }

  /**
   * Vérifie si des données existent déjà dans la base de données locale
   * Si aucune donnée n'existe et que Supabase est disponible, charge les données depuis Supabase
   */
  async loadInitialDataIfNeeded(): Promise<void> {
    try {
      // Vérifier si la base de données locale est vide (pas d'animaux)
      const localPetsCount = await db.pets.count();
      
      if (localPetsCount === 0) {
        console.log('Aucun animal trouvé dans la base locale. Vérification des données dans Supabase...');
        
        // Vérifier si Supabase contient des données
        const { data: supabasePets, error } = await supabase.from('pets').select('*');
        
        if (error) {
          console.error('Erreur lors de la vérification des données dans Supabase:', error.message);
          return;
        }
        
        if (supabasePets && supabasePets.length > 0) {
          console.log(`${supabasePets.length} animaux trouvés dans Supabase. Chargement des données...`);
          
          // Charger les données depuis Supabase vers la base locale
          await this.loadDataFromSupabase();
        } else {
          console.log('Aucune donnée trouvée dans Supabase.');
        }
      } else {
        console.log(`${localPetsCount} animaux trouvés dans la base locale. Pas besoin de charger les données depuis Supabase.`);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des données:', error);
    }
  }

  /**
   * Charge les données depuis Supabase vers la base de données locale
   * Cette méthode est utilisée lorsque l'application est lancée pour la première fois
   * et que des données existent déjà dans Supabase
   */
  private async loadDataFromSupabase(): Promise<void> {
    try {
      console.log('Chargement des données depuis Supabase...');
      
      // Charger les animaux
      const { data: pets, error: petsError } = await supabase.from('pets').select('*');
      if (petsError) {
        throw new Error(`Erreur lors du chargement des animaux: ${petsError.message}`);
      }
      
      if (pets && pets.length > 0) {
        console.log(`Chargement de ${pets.length} animaux...`);
        
        // Convertir les données Supabase en format Dexie
        const dexiePets = pets.map(pet => ({
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          birthDate: new Date(pet.birthdate),
          weight: pet.weight || 0,
          status: pet.status || 'HEALTHY',
          ownerId: pet.owner_id || 0,
          photoUrl: pet.photo_url,
          notes: pet.notes,
          createdAt: new Date(pet.created_at),
          updatedAt: new Date(pet.updated_at)
        }));
        
        // Ajouter les animaux à la base locale
        await db.pets.bulkAdd(dexiePets);
        console.log('Animaux chargés avec succès.');
        
        // Charger les autres données (poids, traitements, etc.)
        await this.loadWeightMeasurements();
        await this.loadTreatments();
        // Ajouter d'autres méthodes pour charger les autres types de données
        
        console.log('Toutes les données ont été chargées depuis Supabase.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données depuis Supabase:', error);
      throw error;
    }
  }

  /**
   * Charge les mesures de poids depuis Supabase
   */
  private async loadWeightMeasurements(): Promise<void> {
    try {
      const { data: weights, error } = await supabase.from('weight_measurements').select('*');
      
      if (error) {
        throw new Error(`Erreur lors du chargement des mesures de poids: ${error.message}`);
      }
      
      if (weights && weights.length > 0) {
        console.log(`Chargement de ${weights.length} mesures de poids...`);
        
        const dexieWeights = weights.map(weight => ({
          id: weight.id,
          petId: weight.pet_id,
          date: new Date(weight.date),
          weight: weight.weight,
          notes: weight.notes,
          foods: weight.foods
        }));
        
        await db.weightMeasurements.bulkAdd(dexieWeights);
        console.log('Mesures de poids chargées avec succès.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mesures de poids:', error);
    }
  }

  /**
   * Charge les traitements depuis Supabase
   */
  private async loadTreatments(): Promise<void> {
    try {
      const { data: treatments, error } = await supabase.from('treatments').select('*');
      
      if (error) {
        throw new Error(`Erreur lors du chargement des traitements: ${error.message}`);
      }
      
      if (treatments && treatments.length > 0) {
        console.log(`Chargement de ${treatments.length} traitements...`);
        
        const dexieTreatments = treatments.map(treatment => ({
          id: treatment.id,
          petId: treatment.pet_id,
          type: treatment.type,
          name: treatment.name,
          date: new Date(treatment.date),
          nextDueDate: treatment.next_due_date ? new Date(treatment.next_due_date) : undefined,
          notes: treatment.notes,
          veterinarianId: treatment.veterinarian_id,
          status: treatment.status || 'COMPLETED',
          createdAt: new Date(treatment.created_at),
          updatedAt: new Date(treatment.updated_at)
        }));
        
        await db.treatments.bulkAdd(dexieTreatments);
        console.log('Traitements chargés avec succès.');
        
        // Charger également les rappels associés
        await this.loadReminders();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des traitements:', error);
    }
  }

  /**
   * Charge les rappels depuis Supabase
   */
  private async loadReminders(): Promise<void> {
    try {
      const { data: reminders, error } = await supabase.from('reminders').select('*');
      
      if (error) {
        throw new Error(`Erreur lors du chargement des rappels: ${error.message}`);
      }
      
      if (reminders && reminders.length > 0) {
        console.log(`Chargement de ${reminders.length} rappels...`);
        
        const dexieReminders = reminders.map(reminder => ({
          id: reminder.id,
          petId: reminder.pet_id,
          treatmentId: reminder.treatment_id,
          type: reminder.type,
          dueDate: new Date(reminder.due_date),
          status: reminder.status,
          notified: reminder.notified,
          createdAt: new Date(reminder.created_at),
          updatedAt: new Date(reminder.updated_at)
        }));
        
        await db.reminders.bulkAdd(dexieReminders);
        console.log('Rappels chargés avec succès.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error);
    }
  }
} 