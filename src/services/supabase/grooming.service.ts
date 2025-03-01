import { supabase } from '../../lib/supabase';
import { GroomingRecord } from '../grooming.service';

export class SupabaseGroomingService {
  async addGroomingRecord(record: Omit<GroomingRecord, 'id'>): Promise<GroomingRecord> {
    const { data, error } = await supabase
      .from('grooming')
      .insert({
        pet_id: record.petId,
        date: new Date(record.date).toISOString(),
        type: record.type,
        description: record.description,
        next_appointment: record.nextAppointment ? new Date(record.nextAppointment).toISOString() : null,
        provider: record.provider || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de l\'ajout d\'un enregistrement de toilettage:', error);
      throw new Error(`Erreur lors de l'ajout d'un enregistrement de toilettage: ${error.message}`);
    }

    return this.mapToGroomingRecord(data);
  }

  async getGroomingRecordsByPetId(petId: number): Promise<GroomingRecord[]> {
    const { data, error } = await supabase
      .from('grooming')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des enregistrements de toilettage:', error);
      throw new Error(`Erreur lors de la récupération des enregistrements de toilettage: ${error.message}`);
    }

    return data.map(item => this.mapToGroomingRecord(item));
  }

  async getAllGroomingRecords(): Promise<GroomingRecord[]> {
    const { data, error } = await supabase
      .from('grooming')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération de tous les enregistrements de toilettage:', error);
      throw new Error(`Erreur lors de la récupération de tous les enregistrements de toilettage: ${error.message}`);
    }

    return data.map(item => this.mapToGroomingRecord(item));
  }

  async updateGroomingRecord(id: number, updates: Partial<GroomingRecord>): Promise<void> {
    const updateData: any = {};
    
    if (updates.petId !== undefined) updateData.pet_id = updates.petId;
    if (updates.date !== undefined) updateData.date = new Date(updates.date).toISOString();
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.nextAppointment !== undefined) {
      updateData.next_appointment = updates.nextAppointment 
        ? new Date(updates.nextAppointment).toISOString() 
        : null;
    }
    if (updates.provider !== undefined) updateData.provider = updates.provider;
    
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('grooming')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la mise à jour d\'un enregistrement de toilettage:', error);
      throw new Error(`Erreur lors de la mise à jour d'un enregistrement de toilettage: ${error.message}`);
    }
  }

  async deleteGroomingRecord(id: number): Promise<void> {
    const { error } = await supabase
      .from('grooming')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression d\'un enregistrement de toilettage:', error);
      throw new Error(`Erreur lors de la suppression d'un enregistrement de toilettage: ${error.message}`);
    }
  }

  async getUpcomingGrooming(): Promise<GroomingRecord[]> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('grooming')
      .select('*')
      .gt('next_appointment', now)
      .order('next_appointment', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des toilettages à venir:', error);
      throw new Error(`Erreur lors de la récupération des toilettages à venir: ${error.message}`);
    }

    return data.map(item => this.mapToGroomingRecord(item));
  }

  /**
   * Convertit un enregistrement Supabase en objet GroomingRecord
   */
  private mapToGroomingRecord(data: any): GroomingRecord {
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
      petId: data.pet_id,
      date: createSafeDate(data.date),
      type: data.type,
      description: data.description,
      nextAppointment: data.next_appointment ? createSafeDate(data.next_appointment) : undefined,
      provider: data.provider || undefined
    };
  }
}