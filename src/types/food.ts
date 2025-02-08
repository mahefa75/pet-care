export interface FoodPortion {
  // Critères de sélection
  criteria: {
    weight?: {
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
    // Pour les aliments qui différencient par niveau d'activité
    byActivity?: {
      low: number;
      moderate: number;
    };
  };
}

export interface Food {
  id: string;
  name: string;
  description: string;
  photoUrl?: string;
  portions: FoodPortion[];
} 