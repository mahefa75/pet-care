interface ApiKeys {
  VITE_GEMINI_API_KEY: string;
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
    const requiredKeys: string[] = [];

    return requiredKeys.every(key => 
      typeof keys[key] === 'string' && keys[key].trim() !== ''
    );
  }

  public getGeminiApiKey(): string | null {
    this.loadApiKeys();
    return this.apiKeys?.VITE_GEMINI_API_KEY || null;
  }

  public getConfigStatus(): { gemini: boolean } {
    this.loadApiKeys();
    
    const geminiConfigured = this.getGeminiApiKey() !== null;

    return {
      gemini: geminiConfigured
    };
  }
}

export const configService = ConfigService.getInstance(); 