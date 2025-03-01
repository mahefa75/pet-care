import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Ces valeurs doivent être remplacées par vos propres valeurs Supabase
// Vous pouvez les trouver dans les paramètres de votre projet Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Vérifier que les clés sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL et Anon Key doivent être définis dans les variables d\'environnement');
}

// Créer le client Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Fonction utilitaire pour vérifier la connexion à Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('pets').select('count').limit(1);
    if (error) {
      console.error('Erreur de connexion à Supabase:', error);
      return false;
    }
    console.log('Connexion à Supabase établie avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification de la connexion à Supabase:', error);
    return false;
  }
} 