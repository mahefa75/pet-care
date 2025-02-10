import React from 'react';
import { Pet } from '../../types/pet';
import { getFoodRecommendation } from '../../services/food.service';
import { Card, Typography, Box, Divider } from '@mui/material';
import { Restaurant, CompareArrows } from '@mui/icons-material';
import { WeightService } from '../../services/weight.service';
import { foodService } from '../../services/food.service';
import { Food } from '../../types/food';

interface GroupedFoodRecommendationProps {
  pets: Pet[];
}

interface RecommendationGroup {
  pets: Pet[];
  minPortion: number;
  maxPortion: number;
  isAdult: boolean;
}

interface WeightComparison {
  petIds: number[];
  petNames: string[];
  current?: {
    weight: number;
    date: Date;
    notes?: string;
    foods?: Food[];
  };
  previous?: {
    weight: number;
    date: Date;
    notes?: string;
    foods?: Food[];
  };
}

const weightService = new WeightService();

export const GroupedFoodRecommendation: React.FC<GroupedFoodRecommendationProps> = ({ pets }) => {
  const [recommendations, setRecommendations] = React.useState<RecommendationGroup[]>([]);
  const [weightComparisons, setWeightComparisons] = React.useState<WeightComparison[]>([]);

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      const groups: RecommendationGroup[] = [];
      const comparisonsMap = new Map<string, WeightComparison>();
      
      for (const pet of pets) {
        // Fetch food recommendations
        const recommendation = await getFoodRecommendation(pet);
        if (recommendation) {
          const existingGroup = groups.find(
            group => 
              group.minPortion === recommendation.minPortion && 
              group.maxPortion === recommendation.maxPortion &&
              group.isAdult === recommendation.isAdult
          );

          if (existingGroup) {
            existingGroup.pets.push(pet);
          } else {
            groups.push({
              pets: [pet],
              ...recommendation
            });
          }
        }

        // Fetch weight history for comparison
        const weightHistory = await weightService.getWeightHistory(pet.id);
        if (weightHistory.length > 0) {
          const [current, previous] = weightHistory;
          
          if (current || previous) {
            // Créer une clé unique pour ce changement d'alimentation
            const currentFoodIds = current?.foods?.sort().join(',') || '';
            const previousFoodIds = previous?.foods?.sort().join(',') || '';
            const currentNotes = current?.notes || '';
            const previousNotes = previous?.notes || '';
            const key = `${currentFoodIds}|${previousFoodIds}|${currentNotes}|${previousNotes}`;

            const currentFoods = current?.foods ? await Promise.all(
              current.foods.map(async (id) => {
                const allFoods = await foodService.getAllFoods();
                return allFoods.find(f => f.id === id);
              })
            ).then(foods => foods.filter((f: Food | undefined): f is Food => f !== undefined)) : undefined;

            const previousFoods = previous?.foods ? await Promise.all(
              previous.foods.map(async (id) => {
                const allFoods = await foodService.getAllFoods();
                return allFoods.find(f => f.id === id);
              })
            ).then(foods => foods.filter((f: Food | undefined): f is Food => f !== undefined)) : undefined;

            if (comparisonsMap.has(key)) {
              // Ajouter l'animal au groupe existant
              const existingComparison = comparisonsMap.get(key)!;
              existingComparison.petIds.push(pet.id);
              existingComparison.petNames.push(pet.name);
            } else {
              // Créer un nouveau groupe
              comparisonsMap.set(key, {
                petIds: [pet.id],
                petNames: [pet.name],
                current: current ? {
                  weight: current.weight,
                  date: current.date,
                  notes: current.notes,
                  foods: currentFoods
                } : undefined,
                previous: previous ? {
                  weight: previous.weight,
                  date: previous.date,
                  notes: previous.notes,
                  foods: previousFoods
                } : undefined
              });
            }
          }
        }
      }

      setRecommendations(groups);
      // Ne garder que les comparaisons qui ont des changements
      const filteredComparisons = Array.from(comparisonsMap.values()).filter(comparison => {
        const hasChanges = 
          (comparison.current?.foods?.length !== comparison.previous?.foods?.length) ||
          (comparison.current?.notes !== comparison.previous?.notes) ||
          (comparison.current?.foods?.some(food => 
            !comparison.previous?.foods?.find(prevFood => prevFood.id === food.id)
          )) ||
          (comparison.previous?.foods?.some(food => 
            !comparison.current?.foods?.find(currFood => currFood.id === food.id)
          ));
        return hasChanges;
      });
      setWeightComparisons(filteredComparisons);
    };

    fetchRecommendations();
  }, [pets]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Restaurant sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="div">
          Recommandations et changements alimentaires
        </Typography>
      </Box>
      
      <div className="grid grid-cols-2 gap-8 relative">
        {/* Colonne des recommandations */}
        <div>
          <Box display="flex" alignItems="center" mb={2}>
            <Restaurant sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle1" component="div">
              Recommandations
            </Typography>
          </Box>
          
          <div className="space-y-4">
            {recommendations.map((group, index) => (
              <Box key={index} mb={2}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {group.pets.map(pet => pet.name).join(', ')}
                </Typography>
                
                {group.isAdult ? (
                  <Typography>
                    Animal(aux) adulte(s). Veuillez suivre les recommandations pour animaux adultes.
                  </Typography>
                ) : (
                  <Typography>
                    Ration quotidienne recommandée : {group.minPortion} - {group.maxPortion} grammes
                  </Typography>
                )}
              </Box>
            ))}
          </div>
        </div>

        {/* Séparateur vertical */}
        <Divider orientation="vertical" flexItem sx={{ position: 'absolute', right: '50%', height: '100%' }} />

        {/* Colonne des changements d'alimentation */}
        {weightComparisons.length > 0 && (
          <div>
            <Box display="flex" alignItems="center" mb={2}>
              <CompareArrows sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" component="div">
                Changements récents
              </Typography>
            </Box>

            <div className="space-y-4">
              {weightComparisons.map((comparison, index) => (
                <Box key={index} mb={2} className="bg-gray-50 p-3 rounded-lg">
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {comparison.petNames.join(', ')}
                  </Typography>
                  
                  <div className="space-y-3">
                    <div>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom className="text-sm">
                        Alimentation actuelle
                      </Typography>
                      {comparison.current?.foods && comparison.current.foods.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {comparison.current.foods.map(food => (
                            <span
                              key={food.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {food.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {comparison.current?.notes && (
                        <Typography variant="body2" color="text.secondary" className="text-xs">
                          Note : {comparison.current.notes}
                        </Typography>
                      )}
                    </div>

                    <div>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom className="text-sm">
                        Alimentation précédente
                      </Typography>
                      {comparison.previous?.foods && comparison.previous.foods.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {comparison.previous.foods.map(food => (
                            <span
                              key={food.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {food.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {comparison.previous?.notes && (
                        <Typography variant="body2" color="text.secondary" className="text-xs">
                          Note : {comparison.previous.notes}
                        </Typography>
                      )}
                    </div>
                  </div>
                </Box>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}; 