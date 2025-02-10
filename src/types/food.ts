export interface Food {
  id: number;
  name: string;
  brand: string;
  type: string;
  description: string;
  photoUrl?: string;
  portions?: FoodPortion[];
  tableType?: 'puppy' | 'adult' | 'both';
}

export interface FoodPortion {
  // Critères de sélection
  criteria: {
    weight: {
      min: number;
      max: number;
    };
    age?: {
      min: number;
      max: number;
    };
  };
  // Quantités recommandées selon l'activité
  portions: {
    default: number;
    byActivity: {
      low: number;
      moderate: number;
    };
  };
} 