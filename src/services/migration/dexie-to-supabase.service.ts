import { db } from '../../lib/db';
import { supabase } from '../../lib/supabase';

export class DexieToSupabaseMigrationService {
  /**
   * Migre toutes les données de Dexie vers Supabase
   */
  async migrateAllData(): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier la connexion à Supabase
      const { data, error } = await supabase.from('pets').select('count');
      if (error) {
        return { 
          success: false, 
          message: `Erreur de connexion à Supabase: ${error.message}` 
        };
      }

      // Migrer les données table par table
      const results = await Promise.all([
        this.migratePets(),
        this.migrateAppointments(),
        this.migrateTreatments(),
        this.migrateWeightMeasurements(),
        this.migrateGrooming(),
        this.migrateHealthEvents(),
        this.migrateFoods(),
        this.migrateVeterinarians()
      ]);

      // Vérifier si toutes les migrations ont réussi
      const failedMigrations = results.filter(r => !r.success);
      
      if (failedMigrations.length > 0) {
        const errorMessages = failedMigrations.map(r => r.message).join('; ');
        return {
          success: false,
          message: `Certaines migrations ont échoué: ${errorMessages}`
        };
      }

      return {
        success: true,
        message: 'Toutes les données ont été migrées avec succès vers Supabase'
      };
    } catch (error) {
      console.error('Erreur lors de la migration des données:', error);
      return {
        success: false,
        message: `Erreur lors de la migration: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Migre les animaux de compagnie de Dexie vers Supabase
   */
  async migratePets(): Promise<{ success: boolean; message: string }> {
    try {
      // Récupérer tous les animaux de Dexie
      const pets = await db.pets.toArray();
      
      if (pets.length === 0) {
        return { success: true, message: 'Aucun animal à migrer' };
      }

      // Convertir les données au format Supabase
      const supabasePets = pets.map(pet => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birth_date: pet.birthDate ? new Date(pet.birthDate).toISOString() : null,
        weight: pet.weight,
        status: pet.status,
        owner_id: pet.ownerId,
        photo_url: pet.photoUrl || null,
        created_at: pet.createdAt.toISOString(),
        updated_at: pet.updatedAt.toISOString()
      }));

      // Insérer les données dans Supabase
      const { error } = await supabase.from('pets').upsert(supabasePets);

      if (error) {
        console.error('Erreur lors de la migration des animaux:', error);
        return {
          success: false,
          message: `Erreur lors de la migration des animaux: ${error.message}`
        };
      }

      return {
        success: true,
        message: `${pets.length} animaux migrés avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la migration des animaux:', error);
      return {
        success: false,
        message: `Erreur lors de la migration des animaux: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Migre les rendez-vous de Dexie vers Supabase
   */
  async migrateAppointments(): Promise<{ success: boolean; message: string }> {
    try {
      // Récupérer tous les rendez-vous de Dexie
      const appointments = await db.appointments.toArray();
      
      if (appointments.length === 0) {
        return { success: true, message: 'Aucun rendez-vous à migrer' };
      }

      // Convertir les données au format Supabase
      const supabaseAppointments = appointments.map(appointment => ({
        id: appointment.id,
        pet_id: appointment.petId,
        date: appointment.date.toISOString().split('T')[0],
        time: appointment.date.toISOString().split('T')[1].substring(0, 5),
        type: appointment.serviceId ? 'service' : 'consultation', // Déduire le type à partir des données disponibles
        location: null, // Pas de location dans le modèle actuel
        notes: appointment.notes || null,
        status: appointment.status,
        reminder_sent: false, // Pas de reminderSent dans le modèle actuel
        created_at: appointment.createdAt.toISOString(),
        updated_at: appointment.updatedAt.toISOString()
      }));

      // Insérer les données dans Supabase
      const { error } = await supabase.from('appointments').upsert(supabaseAppointments);

      if (error) {
        console.error('Erreur lors de la migration des rendez-vous:', error);
        return {
          success: false,
          message: `Erreur lors de la migration des rendez-vous: ${error.message}`
        };
      }

      return {
        success: true,
        message: `${appointments.length} rendez-vous migrés avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la migration des rendez-vous:', error);
      return {
        success: false,
        message: `Erreur lors de la migration des rendez-vous: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Migre les traitements de Dexie vers Supabase
   */
  async migrateTreatments(): Promise<{ success: boolean; message: string }> {
    try {
      // Récupérer tous les traitements de Dexie
      const treatments = await db.treatments.toArray();
      
      if (treatments.length === 0) {
        return { success: true, message: 'Aucun traitement à migrer' };
      }

      // Convertir les données au format Supabase
      const supabaseTreatments = treatments.map(treatment => ({
        id: treatment.id,
        pet_id: treatment.petId,
        type: treatment.type,
        name: treatment.name || treatment.type,
        date: treatment.date.toISOString().split('T')[0],
        next_due_date: treatment.nextDueDate ? treatment.nextDueDate.toISOString().split('T')[0] : null,
        administered_by: null,
        notes: treatment.notes || null,
        created_at: treatment.createdAt.toISOString(),
        updated_at: treatment.updatedAt ? treatment.updatedAt.toISOString() : treatment.createdAt.toISOString()
      }));

      // Insérer les données dans Supabase
      const { error } = await supabase.from('treatments').upsert(supabaseTreatments);

      if (error) {
        console.error('Erreur lors de la migration des traitements:', error);
        return {
          success: false,
          message: `Erreur lors de la migration des traitements: ${error.message}`
        };
      }

      return {
        success: true,
        message: `${treatments.length} traitements migrés avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la migration des traitements:', error);
      return {
        success: false,
        message: `Erreur lors de la migration des traitements: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Migre les mesures de poids de Dexie vers Supabase
   */
  async migrateWeightMeasurements(): Promise<{ success: boolean; message: string }> {
    try {
      // Récupérer toutes les mesures de poids de Dexie
      const weightMeasurements = await db.weightMeasurements.toArray();
      
      if (weightMeasurements.length === 0) {
        return { success: true, message: 'Aucune mesure de poids à migrer' };
      }

      // Convertir les données au format Supabase
      const supabaseWeightMeasurements = weightMeasurements.map(measurement => ({
        id: measurement.id,
        pet_id: measurement.petId,
        date: measurement.date.toISOString().split('T')[0],
        weight: measurement.weight,
        notes: measurement.notes || null,
        created_at: measurement.date.toISOString()
      }));

      // Insérer les données dans Supabase
      const { error } = await supabase.from('weight_measurements').upsert(supabaseWeightMeasurements);

      if (error) {
        console.error('Erreur lors de la migration des mesures de poids:', error);
        return {
          success: false,
          message: `Erreur lors de la migration des mesures de poids: ${error.message}`
        };
      }

      return {
        success: true,
        message: `${weightMeasurements.length} mesures de poids migrées avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la migration des mesures de poids:', error);
      return {
        success: false,
        message: `Erreur lors de la migration des mesures de poids: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Migre les données de toilettage de Dexie vers Supabase
   */
  async migrateGrooming(): Promise<{ success: boolean; message: string }> {
    try {
      // Récupérer toutes les données de toilettage de Dexie
      const groomingRecords = await db.grooming.toArray();
      
      if (groomingRecords.length === 0) {
        return { success: true, message: 'Aucune donnée de toilettage à migrer' };
      }

      // Convertir les données au format Supabase
      const supabaseGroomingRecords = groomingRecords.map(record => ({
        id: record.id,
        pet_id: record.petId,
        date: record.date.toISOString().split('T')[0],
        type: record.type,
        performed_by: record.provider || null,
        notes: record.description || null,
        next_appointment: record.nextAppointment ? record.nextAppointment.toISOString().split('T')[0] : null,
        created_at: record.date.toISOString()
      }));

      // Insérer les données dans Supabase
      const { error } = await supabase.from('grooming').upsert(supabaseGroomingRecords);

      if (error) {
        console.error('Erreur lors de la migration des données de toilettage:', error);
        return {
          success: false,
          message: `Erreur lors de la migration des données de toilettage: ${error.message}`
        };
      }

      return {
        success: true,
        message: `${groomingRecords.length} données de toilettage migrées avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la migration des données de toilettage:', error);
      return {
        success: false,
        message: `Erreur lors de la migration des données de toilettage: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Migre les événements de santé de Dexie vers Supabase
   */
  async migrateHealthEvents(): Promise<{ success: boolean; message: string }> {
    try {
      // Récupérer tous les événements de santé de Dexie
      const healthEvents = await db.healthEvents.toArray();
      
      if (healthEvents.length === 0) {
        return { success: true, message: 'Aucun événement de santé à migrer' };
      }

      // Convertir les données au format Supabase
      const supabaseHealthEvents = healthEvents.map(event => ({
        id: event.id,
        pet_id: event.petId,
        date: event.date.toISOString().split('T')[0],
        type: event.type,
        description: event.description || null,
        severity: event.severity,
        resolved: event.resolved,
        resolution_date: event.resolvedDate ? event.resolvedDate.toISOString().split('T')[0] : null,
        notes: event.notes || null,
        created_at: event.date.toISOString()
      }));

      // Insérer les données dans Supabase
      const { error } = await supabase.from('health_events').upsert(supabaseHealthEvents);

      if (error) {
        console.error('Erreur lors de la migration des événements de santé:', error);
        return {
          success: false,
          message: `Erreur lors de la migration des événements de santé: ${error.message}`
        };
      }

      return {
        success: true,
        message: `${healthEvents.length} événements de santé migrés avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la migration des événements de santé:', error);
      return {
        success: false,
        message: `Erreur lors de la migration des événements de santé: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Migre les aliments de Dexie vers Supabase
   */
  async migrateFoods(): Promise<{ success: boolean; message: string }> {
    try {
      // Récupérer tous les aliments de Dexie
      const foods = await db.foods.toArray();
      
      if (foods.length === 0) {
        return { success: true, message: 'Aucun aliment à migrer' };
      }

      // Obtenir la date actuelle pour les timestamps
      const now = new Date().toISOString();

      // Convertir les données au format Supabase
      const supabaseFoods = foods.map(food => ({
        id: parseInt(String(food.id).substring(0, 9)), // Tronquer l'ID pour qu'il rentre dans un entier PostgreSQL
        name: food.name,
        type: food.type,
        brand: food.brand || null,
        ingredients: food.description || null, // Utiliser description comme ingredients
        nutritional_info: null, // Pas d'info nutritionnelle dans le modèle actuel
        created_at: now, // Utiliser la date actuelle
        updated_at: now  // Utiliser la date actuelle
      }));

      // Insérer les données dans Supabase
      const { error } = await supabase.from('foods').upsert(supabaseFoods);

      if (error) {
        console.error('Erreur lors de la migration des aliments:', error);
        return {
          success: false,
          message: `Erreur lors de la migration des aliments: ${error.message}`
        };
      }

      return {
        success: true,
        message: `${foods.length} aliments migrés avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la migration des aliments:', error);
      return {
        success: false,
        message: `Erreur lors de la migration des aliments: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Migre les vétérinaires de Dexie vers Supabase
   */
  async migrateVeterinarians(): Promise<{ success: boolean; message: string }> {
    try {
      // Récupérer tous les vétérinaires de Dexie
      const veterinarians = await db.veterinarians.toArray();
      
      if (veterinarians.length === 0) {
        return { success: true, message: 'Aucun vétérinaire à migrer' };
      }

      // Obtenir la date actuelle pour les timestamps
      const now = new Date().toISOString();

      // Convertir les données au format Supabase
      const supabaseVeterinarians = veterinarians.map(vet => ({
        id: vet.id,
        name: vet.name,
        speciality: vet.speciality || null,
        clinic: null,
        phone: null,
        email: null,
        address: null,
        notes: null,
        created_at: now, // Utiliser la date actuelle
        updated_at: now  // Utiliser la date actuelle
      }));

      // Insérer les données dans Supabase
      const { error } = await supabase.from('veterinarians').upsert(supabaseVeterinarians);

      if (error) {
        console.error('Erreur lors de la migration des vétérinaires:', error);
        return {
          success: false,
          message: `Erreur lors de la migration des vétérinaires: ${error.message}`
        };
      }

      return {
        success: true,
        message: `${veterinarians.length} vétérinaires migrés avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la migration des vétérinaires:', error);
      return {
        success: false,
        message: `Erreur lors de la migration des vétérinaires: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
} 