import { createClient } from '@supabase/supabase-js';

// Valeurs par défaut pour le développement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-key';

export const supabase = createClient(supabaseUrl, supabaseKey);