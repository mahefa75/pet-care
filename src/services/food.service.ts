import { Pet } from '../types/pet';
import { WeightService } from './weight.service';
import { Food } from '../types/food';
import { db } from '../lib/db';

interface FoodRecommendation {
  minPortion: number;
  maxPortion: number;
  isAdult: boolean;
}

const FOOD_RECOMMENDATIONS = {
  '1': {
    '2': { minPortion: 60, maxPortion: 80, isAdult: false },
    '3': { minPortion: 40, maxPortion: 60, isAdult: false },
    '4': { minPortion: 40, maxPortion: 60, isAdult: false },
    '5-6': { minPortion: 40, maxPortion: 60, isAdult: false },
    '7-8': { minPortion: 40, maxPortion: 55, isAdult: false },
    '9+': { minPortion: 0, maxPortion: 0, isAdult: true },
  },
  '2': {
    '2': { minPortion: 90, maxPortion: 110, isAdult: false },
    '3': { minPortion: 70, maxPortion: 90, isAdult: false },
    '4': { minPortion: 70, maxPortion: 90, isAdult: false },
    '5-6': { minPortion: 60, maxPortion: 90, isAdult: false },
    '7-8': { minPortion: 60, maxPortion: 75, isAdult: false },
    '9+': { minPortion: 0, maxPortion: 0, isAdult: true },
  },
  '3': {
    '2': { minPortion: 130, maxPortion: 150, isAdult: false },
    '3': { minPortion: 100, maxPortion: 120, isAdult: false },
    '4': { minPortion: 90, maxPortion: 110, isAdult: false },
    '5-6': { minPortion: 90, maxPortion: 110, isAdult: false },
    '7-8': { minPortion: 75, maxPortion: 90, isAdult: false },
    '9-10': { minPortion: 70, maxPortion: 85, isAdult: false },
    '11+': { minPortion: 0, maxPortion: 0, isAdult: true },
  },
  '4': {
    '2': { minPortion: 170, maxPortion: 190, isAdult: false },
    '3': { minPortion: 130, maxPortion: 150, isAdult: false },
    '4': { minPortion: 120, maxPortion: 140, isAdult: false },
    '5-6': { minPortion: 100, maxPortion: 140, isAdult: false },
    '7-8': { minPortion: 90, maxPortion: 110, isAdult: false },
    '9-10': { minPortion: 80, maxPortion: 100, isAdult: false },
    '11+': { minPortion: 0, maxPortion: 0, isAdult: true },
  },
  '5': {
    '2': { minPortion: 200, maxPortion: 230, isAdult: false },
    '3': { minPortion: 150, maxPortion: 180, isAdult: false },
    '4': { minPortion: 130, maxPortion: 150, isAdult: false },
    '5-6': { minPortion: 130, maxPortion: 150, isAdult: false },
    '7-8': { minPortion: 130, maxPortion: 150, isAdult: false },
    '9-10': { minPortion: 100, maxPortion: 130, isAdult: false },
    '11+': { minPortion: 0, maxPortion: 0, isAdult: true },
  },
  '6': {
    '2': { minPortion: 250, maxPortion: 270, isAdult: false },
    '3': { minPortion: 200, maxPortion: 220, isAdult: false },
    '4': { minPortion: 180, maxPortion: 200, isAdult: false },
    '5-6': { minPortion: 150, maxPortion: 180, isAdult: false },
    '7-8': { minPortion: 150, maxPortion: 170, isAdult: false },
    '9-10': { minPortion: 110, maxPortion: 140, isAdult: false },
    '11-12': { minPortion: 110, maxPortion: 120, isAdult: false },
    '13+': { minPortion: 0, maxPortion: 0, isAdult: true },
  },
  '7': {
    '2': { minPortion: 250, maxPortion: 270, isAdult: false },
    '3': { minPortion: 220, maxPortion: 240, isAdult: false },
    '4': { minPortion: 200, maxPortion: 220, isAdult: false },
    '5-6': { minPortion: 150, maxPortion: 170, isAdult: false },
    '7-8': { minPortion: 150, maxPortion: 170, isAdult: false },
    '9-10': { minPortion: 120, maxPortion: 140, isAdult: false },
    '11-12': { minPortion: 125, maxPortion: 135, isAdult: false },
    '13+': { minPortion: 0, maxPortion: 0, isAdult: true },
  },
  '8': {
    '2': { minPortion: 280, maxPortion: 300, isAdult: false },
    '3': { minPortion: 250, maxPortion: 270, isAdult: false },
    '4': { minPortion: 220, maxPortion: 240, isAdult: false },
    '5-6': { minPortion: 180, maxPortion: 200, isAdult: false },
    '7-8': { minPortion: 170, maxPortion: 190, isAdult: false },
    '9-10': { minPortion: 140, maxPortion: 160, isAdult: false },
    '11+': { minPortion: 0, maxPortion: 0, isAdult: true },
  },
  '9': {
    '2': { minPortion: 305, maxPortion: 325, isAdult: false },
    '3': { minPortion: 275, maxPortion: 295, isAdult: false },
    '4': { minPortion: 240, maxPortion: 260, isAdult: false },
    '5-6': { minPortion: 180, maxPortion: 200, isAdult: false },
    '7-8': { minPortion: 170, maxPortion: 190, isAdult: false },
    '9-10': { minPortion: 165, maxPortion: 175, isAdult: false },
    '11-12': { minPortion: 155, maxPortion: 170, isAdult: false },
    '13+': { minPortion: 0, maxPortion: 0, isAdult: true },
  },
};

const weightService = new WeightService();

export const getFoodRecommendation = async (pet: Pet): Promise<FoodRecommendation | null> => {
  // Récupérer le dernier poids enregistré ou utiliser le poids du profil
  const latestWeight = await weightService.getLatestWeight(pet.id);
  const currentWeight = latestWeight?.weight || pet.weight;

  if (!currentWeight) return null;

  // Si le poids est inférieur à 0.5kg ou supérieur à 9.5kg, pas de recommandation
  if (currentWeight < 0.5 || currentWeight > 9.5) return null;

  // Déterminer la catégorie de poids avec des intervalles précis
  let weightCategory: string;
  if (currentWeight < 2) weightCategory = '1';
  else if (currentWeight < 3) weightCategory = '2';
  else if (currentWeight < 4) weightCategory = '3';
  else if (currentWeight < 5) weightCategory = '4';
  else if (currentWeight < 6) weightCategory = '5';
  else if (currentWeight < 7) weightCategory = '6';
  else if (currentWeight < 8) weightCategory = '7';
  else if (currentWeight < 9) weightCategory = '8';
  else if (currentWeight <= 10) weightCategory = '9';
  else return null;

  const ageInMonths = Math.floor((Date.now() - new Date(pet.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  // Déterminer la catégorie d'âge
  let ageRange = '';
  if (ageInMonths < 2) return null; // Trop jeune pour les recommandations
  else if (ageInMonths === 2) ageRange = '2';
  else if (ageInMonths === 3) ageRange = '3';
  else if (ageInMonths === 4) ageRange = '4';
  else if (ageInMonths >= 5 && ageInMonths <= 6) ageRange = '5-6';
  else if (ageInMonths >= 7 && ageInMonths <= 8) ageRange = '7-8';
  else if (ageInMonths >= 9 && ageInMonths <= 10) ageRange = '9-10';
  else if (ageInMonths >= 11 && ageInMonths <= 12) ageRange = '11-12';
  else ageRange = '13+';

  const weightRecommendations = FOOD_RECOMMENDATIONS[weightCategory as keyof typeof FOOD_RECOMMENDATIONS];
  if (!weightRecommendations) return null;

  // Trouver la recommandation correspondante
  for (const [range, recommendation] of Object.entries(weightRecommendations)) {
    if (range.startsWith(ageRange) || (range.includes('+') && ageInMonths >= parseInt(range))) {
      return recommendation;
    }
  }

  return null;
};

class FoodService {
  async getAllFoods(): Promise<Food[]> {
    return await db.foods.toArray();
  }

  async addFood(food: Food): Promise<void> {
    await db.foods.add(food);
  }

  async updateFood(updatedFood: Food): Promise<void> {
    await db.foods.put(updatedFood);
  }

  async deleteFood(foodId: string): Promise<void> {
    await db.foods.delete(parseInt(foodId));
  }
}

export const foodService = new FoodService(); 