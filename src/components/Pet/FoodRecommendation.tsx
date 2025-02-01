import React from 'react';
import { Pet } from '../../types/pet';
import { getFoodRecommendation } from '../../services/food.service';
import { Card, Typography, Box } from '@mui/material';
import { Restaurant } from '@mui/icons-material';

interface GroupedFoodRecommendationProps {
  pets: Pet[];
}

interface RecommendationGroup {
  pets: Pet[];
  minPortion: number;
  maxPortion: number;
  isAdult: boolean;
}

export const GroupedFoodRecommendation: React.FC<GroupedFoodRecommendationProps> = ({ pets }) => {
  const groupRecommendations = (): RecommendationGroup[] => {
    const groups: RecommendationGroup[] = [];
    
    pets.forEach(pet => {
      const recommendation = getFoodRecommendation(pet);
      if (!recommendation) return;

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
    });

    return groups;
  };

  const recommendationGroups = groupRecommendations();

  if (recommendationGroups.length === 0) {
    return null;
  }

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Restaurant sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="div">
          Recommandations alimentaires
        </Typography>
      </Box>
      
      <div className="space-y-4">
        {recommendationGroups.map((group, index) => (
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
    </Card>
  );
}; 