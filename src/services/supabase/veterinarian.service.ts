import { supabase } from '../../lib/supabase';
import { Veterinarian } from '../veterinarian.service';

export class SupabaseVeterinarianService {
  async getVeterinarians(): Promise<Veterinarian[]> {
    const { data, error } = await supabase
      .from('veterinarians')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erreur lors de la récupération des vétérinaires:', error);
      throw new Error(`Erreur lors de la récupération des vétérinaires: ${error.message}`);
    }

    return data.map(item => this.mapToVeterinarian(item));
  }

  async getVeterinarianById(id: number): Promise<Veterinarian> {
    const { data, error } = await supabase
      .from('veterinarians')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération du vétérinaire avec l'ID ${id}:`, error);
      throw new Error(`Vétérinaire non trouvé: ${error.message}`);
    }

    return this.mapToVeterinarian(data);
  }

  async createVeterinarian(data: Omit<Veterinarian, 'id' | 'createdAt' | 'updatedAt'>): Promise<Veterinarian> {
    const now = new Date().toISOString();
    
    const { data: insertedData, error } = await supabase
      .from('veterinarians')
      .insert({
        name: data.name,
        speciality: data.speciality || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du vétérinaire:', error);
      throw new Error(`Erreur lors de la création du vétérinaire: ${error.message}`);
    }

    return this.mapToVeterinarian(insertedData);
  }

  async updateVeterinarian(id: number, data: Partial<Veterinarian>): Promise<Veterinarian> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.speciality !== undefined) updateData.speciality = data.speciality;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.address !== undefined) updateData.address = data.address;

    const { data: updatedData, error } = await supabase
      .from('veterinarians')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour du vétérinaire avec l'ID ${id}:`, error);
      throw new Error(`Erreur lors de la mise à jour du vétérinaire: ${error.message}`);
    }

    return this.mapToVeterinarian(updatedData);
  }

  async deleteVeterinarian(id: number): Promise<void> {
    const { error } = await supabase
      .from('veterinarians')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression du vétérinaire avec l'ID ${id}:`, error);
      throw new Error(`Erreur lors de la suppression du vétérinaire: ${error.message}`);
    }
  }

  /**
   * Convertit un enregistrement Supabase en objet Veterinarian
   */
  private mapToVeterinarian(data: any): Veterinarian {
    // Fonction utilitaire pour créer une date sécurisée
    const createSafeDate = (dateStr: string | null): Date => {
      if (!dateStr) return new Date();
      
      try {
        const date = new Date(dateStr);
        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
          console.warn(`Date invalide détectée: ${dateStr}, utilisation de la date actuelle`);
          return new Date();
        }
        return date;
      } catch (error) {
        console.warn(`Erreur lors de la conversion de la date: ${dateStr}`, error);
        return new Date();
      }
    };

    return {
      id: data.id,
      name: data.name,
      speciality: data.speciality || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      address: data.address || undefined,
      createdAt: createSafeDate(data.created_at),
      updatedAt: createSafeDate(data.updated_at)
    };
  }
} 