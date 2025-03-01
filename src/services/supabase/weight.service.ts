import { supabase } from '../../lib/supabase';
import { WeightMeasurement } from '../../types/pet';

export class SupabaseWeightService {
  async getWeightHistory(petId: number): Promise<WeightMeasurement[]> {
    const { data, error } = await supabase
      .from('weight_measurements')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération de l\'historique de poids:', error);
      throw new Error(`Erreur lors de la récupération de l'historique de poids: ${error.message}`);
    }

    // Convertir les données Supabase en objets WeightMeasurement
    return data.map(item => this.mapToWeightMeasurement(item));
  }

  async addWeightMeasurement(measurement: Omit<WeightMeasurement, 'id'>): Promise<number> {
    // S'assurer que le poids est arrondi à 3 décimales
    const roundedWeight = Math.round(measurement.weight * 1000) / 1000;
    
    const { data, error } = await supabase
      .from('weight_measurements')
      .insert({
        pet_id: measurement.petId,
        date: new Date(measurement.date).toISOString().split('T')[0],
        weight: roundedWeight,
        notes: measurement.notes || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de l\'ajout d\'une mesure de poids:', error);
      throw new Error(`Erreur lors de l'ajout d'une mesure de poids: ${error.message}`);
    }

    return data.id;
  }

  async getLatestWeight(petId: number): Promise<WeightMeasurement | undefined> {
    const { data, error } = await supabase
      .from('weight_measurements')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Code d'erreur pour "aucun résultat trouvé"
        return undefined;
      }
      console.error('Erreur lors de la récupération du dernier poids:', error);
      throw new Error(`Erreur lors de la récupération du dernier poids: ${error.message}`);
    }

    return this.mapToWeightMeasurement(data);
  }

  async getPreviousWeight(petId: number, currentDate: Date): Promise<WeightMeasurement | undefined> {
    const dateStr = new Date(currentDate).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('weight_measurements')
      .select('*')
      .eq('pet_id', petId)
      .lt('date', dateStr)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Code d'erreur pour "aucun résultat trouvé"
        return undefined;
      }
      console.error('Erreur lors de la récupération du poids précédent:', error);
      throw new Error(`Erreur lors de la récupération du poids précédent: ${error.message}`);
    }

    return this.mapToWeightMeasurement(data);
  }

  async updateWeight(measurement: WeightMeasurement): Promise<void> {
    const roundedWeight = Math.round(measurement.weight * 1000) / 1000;
    
    const { error } = await supabase
      .from('weight_measurements')
      .update({
        weight: roundedWeight,
        date: new Date(measurement.date).toISOString().split('T')[0],
        notes: measurement.notes || null
      })
      .eq('id', measurement.id);

    if (error) {
      console.error('Erreur lors de la mise à jour du poids:', error);
      throw new Error(`Erreur lors de la mise à jour du poids: ${error.message}`);
    }
  }

  async deleteWeight(id: number): Promise<void> {
    const { error } = await supabase
      .from('weight_measurements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression du poids:', error);
      throw new Error(`Erreur lors de la suppression du poids: ${error.message}`);
    }
  }

  async addWeight(petId: number, data: {
    date: Date;
    weight: number;
    notes?: string;
    foods?: number[];
  }): Promise<WeightMeasurement> {
    const roundedWeight = Math.round(data.weight * 1000) / 1000;
    
    const { data: insertedData, error } = await supabase
      .from('weight_measurements')
      .insert({
        pet_id: petId,
        date: new Date(data.date).toISOString().split('T')[0],
        weight: roundedWeight,
        notes: data.notes || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de l\'ajout d\'un poids:', error);
      throw new Error(`Erreur lors de l'ajout d'un poids: ${error.message}`);
    }

    return this.mapToWeightMeasurement(insertedData);
  }

  /**
   * Convertit un enregistrement Supabase en objet WeightMeasurement
   */
  private mapToWeightMeasurement(data: any): WeightMeasurement {
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
      weight: Math.round(data.weight * 1000) / 1000,
      notes: data.notes || undefined,
      foods: data.foods || undefined
    };
  }
} 