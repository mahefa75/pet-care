import { supabase } from '../../lib/supabase';
import { Food } from '../../types/food';

export class SupabaseFoodService {
  async getAllFoods(): Promise<Food[]> {
    const { data, error } = await supabase
      .from('foods')
      .select('*');

    if (error) {
      console.error('Erreur lors de la récupération des aliments:', error);
      throw new Error(`Erreur lors de la récupération des aliments: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      type: item.type,
      description: item.description || '',
      photoUrl: item.photo_url || undefined,
      portions: item.portions || undefined,
      tableType: item.table_type || undefined
    }));
  }

  async addFood(food: Food): Promise<void> {
    const { error } = await supabase
      .from('foods')
      .insert({
        id: food.id,
        name: food.name,
        brand: food.brand,
        type: food.type,
        description: food.description || null,
        photo_url: food.photoUrl || null,
        portions: food.portions || null,
        table_type: food.tableType || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur lors de l\'ajout d\'un aliment:', error);
      throw new Error(`Erreur lors de l'ajout d'un aliment: ${error.message}`);
    }
  }

  async updateFood(updatedFood: Food): Promise<void> {
    const { error } = await supabase
      .from('foods')
      .update({
        name: updatedFood.name,
        brand: updatedFood.brand,
        type: updatedFood.type,
        description: updatedFood.description || null,
        photo_url: updatedFood.photoUrl || null,
        portions: updatedFood.portions || null,
        table_type: updatedFood.tableType || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedFood.id);

    if (error) {
      console.error('Erreur lors de la mise à jour d\'un aliment:', error);
      throw new Error(`Erreur lors de la mise à jour d'un aliment: ${error.message}`);
    }
  }

  async deleteFood(foodId: string): Promise<void> {
    const { error } = await supabase
      .from('foods')
      .delete()
      .eq('id', parseInt(foodId));

    if (error) {
      console.error('Erreur lors de la suppression d\'un aliment:', error);
      throw new Error(`Erreur lors de la suppression d'un aliment: ${error.message}`);
    }
  }
} 