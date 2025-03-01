import { supabase } from '../../lib/supabase';
import { Pet, PetFilters, PetSpecies, PetStatus } from '../../types/pet';

export class SupabasePetService {
  /**
   * Récupère la liste des animaux de compagnie avec filtrage et pagination
   */
  async getPets(filters: PetFilters): Promise<Pet[]> {
    let query = supabase
      .from('pets')
      .select('*')
      .order('name');

    if (filters.species) {
      query = query.eq('species', filters.species);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    
    const { data, error } = await query.range(from, to);

    if (error) {
      console.error('Erreur lors de la récupération des animaux:', error);
      throw new Error(`Erreur lors de la récupération des animaux: ${error.message}`);
    }

    // Convertir les données Supabase en objets Pet
    return data.map(item => this.mapToPet(item));
  }

  /**
   * Récupère un animal par son ID
   */
  async getPetById(id: number): Promise<Pet> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération de l'animal ${id}:`, error);
      throw new Error(`Animal non trouvé: ${error.message}`);
    }

    return this.mapToPet(data);
  }

  /**
   * Crée un nouvel animal
   */
  async createPet(pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pet> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('pets')
      .insert({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birth_date: pet.birthDate ? new Date(pet.birthDate).toISOString() : null,
        weight: pet.weight,
        status: pet.status,
        owner_id: pet.ownerId,
        photo_url: pet.photoUrl || null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de l\'animal:', error);
      throw new Error(`Erreur lors de la création de l'animal: ${error.message}`);
    }

    return this.mapToPet(data);
  }

  /**
   * Met à jour un animal existant
   */
  async updatePet(id: number, petUpdate: Partial<Pet>): Promise<Pet> {
    const now = new Date().toISOString();
    
    // Préparer les données pour Supabase (conversion des noms de propriétés)
    const updateData: any = {
      updated_at: now
    };
    
    if (petUpdate.name !== undefined) updateData.name = petUpdate.name;
    if (petUpdate.species !== undefined) updateData.species = petUpdate.species;
    if (petUpdate.breed !== undefined) updateData.breed = petUpdate.breed;
    if (petUpdate.birthDate !== undefined) {
      updateData.birth_date = petUpdate.birthDate ? new Date(petUpdate.birthDate).toISOString() : null;
    }
    if (petUpdate.weight !== undefined) updateData.weight = petUpdate.weight;
    if (petUpdate.status !== undefined) updateData.status = petUpdate.status;
    if (petUpdate.ownerId !== undefined) updateData.owner_id = petUpdate.ownerId;
    if (petUpdate.photoUrl !== undefined) updateData.photo_url = petUpdate.photoUrl;

    const { data, error } = await supabase
      .from('pets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour de l'animal ${id}:`, error);
      throw new Error(`Erreur lors de la mise à jour de l'animal: ${error.message}`);
    }

    return this.mapToPet(data);
  }

  /**
   * Supprime un animal
   */
  async deletePet(id: number): Promise<void> {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression de l'animal ${id}:`, error);
      throw new Error(`Erreur lors de la suppression de l'animal: ${error.message}`);
    }
  }

  /**
   * Récupère l'historique médical d'un animal
   */
  async getMedicalHistory(petId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (error) {
      console.error(`Erreur lors de la récupération de l'historique médical pour l'animal ${petId}:`, error);
      throw new Error(`Erreur lors de la récupération de l'historique médical: ${error.message}`);
    }

    return data.map(t => ({
      id: t.id,
      petId: t.pet_id,
      date: new Date(t.date),
      diagnosis: t.diagnosis || '',
      treatment: t.treatment || '',
      notes: t.notes || null,
      veterinarianId: t.veterinarian_id || 0
    }));
  }

  /**
   * Convertit un enregistrement Supabase en objet Pet
   */
  private mapToPet(data: any): Pet {
    // Fonction utilitaire pour créer une date valide
    const createSafeDate = (dateString: string | null): Date => {
      if (!dateString) return new Date(); // Date par défaut si null
      
      try {
        const date = new Date(dateString);
        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
          console.warn(`Date invalide détectée: ${dateString}, utilisation de la date actuelle`);
          return new Date();
        }
        return date;
      } catch (error) {
        console.warn(`Erreur lors de la conversion de la date: ${dateString}`, error);
        return new Date();
      }
    };

    return {
      id: data.id,
      name: data.name,
      species: data.species as PetSpecies,
      breed: data.breed,
      birthDate: data.birth_date ? createSafeDate(data.birth_date) : new Date(),
      weight: data.weight || 0,
      status: data.status as PetStatus,
      ownerId: data.owner_id,
      photoUrl: data.photo_url || undefined,
      createdAt: createSafeDate(data.created_at),
      updatedAt: createSafeDate(data.updated_at)
    };
  }
} 