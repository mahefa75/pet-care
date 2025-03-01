interface ApiKeys {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_GEMINI_API_KEY: string;
}

interface SupabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

class ConfigService {
  private static instance: ConfigService;
  private apiKeys: ApiKeys | null = null;

  private constructor() {
    this.loadApiKeys();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadApiKeys() {
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      const keys = JSON.parse(savedKeys);
      if (this.validateApiKeys(keys)) {
        this.apiKeys = keys;
      } else {
        console.warn('Invalid API keys found in localStorage');
        this.apiKeys = null;
      }
    }
  }

  private validateApiKeys(keys: any): keys is ApiKeys {
    const requiredKeys = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    return requiredKeys.every(key => 
      typeof keys[key] === 'string' && keys[key].trim() !== ''
    );
  }

  public getSupabaseConfig(): SupabaseConfig | null {
    this.loadApiKeys();
    
    if (!this.apiKeys) {
      console.warn('Supabase configuration not found. Some features may be limited.');
      return null;
    }

    const config: SupabaseConfig = {
      supabaseUrl: this.apiKeys.VITE_SUPABASE_URL,
      supabaseKey: this.apiKeys.VITE_SUPABASE_ANON_KEY
    };

    const emptyFields = Object.entries(config)
      .filter(([key, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      console.warn(`Incomplete Supabase configuration. Missing fields: ${emptyFields.join(', ')}`);
      return null;
    }

    return config;
  }

  public getGeminiApiKey(): string | null {
    this.loadApiKeys();
    return this.apiKeys?.VITE_GEMINI_API_KEY || null;
  }

  public getConfigStatus(): { supabase: boolean; gemini: boolean } {
    this.loadApiKeys();
    
    const supabaseConfig = this.getSupabaseConfig();
    const supabaseConfigured = supabaseConfig !== null;
    const geminiConfigured = this.getGeminiApiKey() !== null;

    return {
      supabase: supabaseConfigured,
      gemini: geminiConfigured
    };
  }

  public async testSupabaseConnection(): Promise<void> {
    try {
      const config = this.getSupabaseConfig();
      
      if (!config) {
        return Promise.reject(new Error('Supabase configuration is missing or incomplete'));
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(config.supabaseUrl, config.supabaseKey);

      // Test la connexion en essayant de récupérer la version de Supabase
      const { data, error } = await supabase.from('pets').select('count');
      
      if (error) throw error;
      
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors du test de connexion Supabase:', error);
      return Promise.reject(error);
    }
  }
}

export const configService = ConfigService.getInstance(); 