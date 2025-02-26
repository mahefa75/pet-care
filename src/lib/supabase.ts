import { createClient } from '@supabase/supabase-js';
import { configService } from '../services/config.service';

// Créer le client Supabase avec la configuration
const getSupabaseClient = () => {
  const config = configService.getSupabaseConfig();
  if (!config) {
    console.warn('Supabase configuration not found. Some features may be limited.');
    return null;
  }

  return createClient(config.supabaseUrl, config.supabaseKey);
};

export const supabase = getSupabaseClient();

// Fonction pour réinitialiser le client Supabase
export const reinitializeSupabase = () => {
  return getSupabaseClient();
};