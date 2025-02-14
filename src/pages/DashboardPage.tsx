import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { fr } from 'date-fns/locale';
import { WeightService } from '../services/weight.service';
import { PetService } from '../services/pet.service';
import { Pet, WeightMeasurement } from '../types/pet';
import { UpcomingReminders } from '../components/Treatment/UpcomingReminders';
import { CalendarIcon, ChartBarIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import { GroupedFoodRecommendation } from '../components/Pet/FoodRecommendation';
import { BulkWeightEntry } from '../components/Weight/BulkWeightEntry';
import { Button } from '../components/UI/Button';
import { addDays } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const weightService = new WeightService();
const petService = new PetService();

// Fonction pour calculer la régression linéaire
const calculateLinearRegression = (data: { x: number, y: number }[]) => {
  const n = data.length;
  if (n < 2) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

export const DashboardPage: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [weightData, setWeightData] = useState<Map<number, WeightMeasurement[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAnyReminders, setHasAnyReminders] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const remindersMap = new Map<number, boolean>();
  const [isBulkWeightEntryOpen, setIsBulkWeightEntryOpen] = useState(false);
  const [showTrendlines, setShowTrendlines] = useState(false);

  const handleHasReminders = (petId: number, hasReminders: boolean) => {
    remindersMap.set(petId, hasReminders);
    setHasAnyReminders(Array.from(remindersMap.values()).some(value => value));
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Chargement des données...');
      // Charger tous les animaux
      const petsData = await petService.getPets({ page: 1, limit: 50 });
      console.log('Animaux chargés:', petsData);
      setPets(petsData);

      // Charger l'historique des poids pour chaque animal
      const weightMap = new Map<number, WeightMeasurement[]>();
      for (const pet of petsData) {
        const weights = await weightService.getWeightHistory(pet.id);
        console.log(`Poids pour ${pet.name}:`, weights);
        if (weights.length > 0) {
          weightMap.set(pet.id, weights);
        }
      }
      setWeightData(weightMap);
      console.log('Données de poids:', Array.from(weightMap.entries()));
      setError(null);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const datasets = Array.from(weightData.entries()).flatMap(([petId, weights], index) => {
      const pet = pets.find(p => p.id === petId);
      const sortedWeights = [...weights].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Préparer les données pour la régression linéaire
      const regressionData = sortedWeights.map((_, index) => ({
        x: index,
        y: sortedWeights[index].weight
      }));

      // Calculer la régression linéaire
      const regression = calculateLinearRegression(regressionData);

      // Générer les points de projection pour les 14 prochains jours
      const projectionPoints: { x: Date; y: number }[] = [];
      if (regression && sortedWeights.length > 0) {
        const lastDate = new Date(sortedWeights[sortedWeights.length - 1].date);
        for (let i = 1; i <= 14; i++) {
          const projectedDate = addDays(lastDate, i);
          const projectedWeight = regression.slope * (regressionData.length + i - 1) + regression.intercept;
          projectionPoints.push({
            x: projectedDate,
            y: Math.max(0, projectedWeight) // Éviter les poids négatifs
          });
        }
      }

      const baseColor = colors[index % colors.length];
      
      // Dataset pour les données réelles
      const mainDataset = {
        label: pet?.name || 'Inconnu',
        data: sortedWeights.map(w => ({
          x: new Date(w.date),
          y: w.weight
        })),
        borderColor: baseColor,
        backgroundColor: baseColor.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.3
      };

      // Ne retourner le dataset de tendance que si showTrendlines est true
      if (!showTrendlines) {
        return [mainDataset];
      }

      // Dataset pour la tendance
      const trendDataset = {
        label: `${pet?.name || 'Inconnu'} (Tendance)`,
        data: [
          ...sortedWeights.map(w => ({
            x: new Date(w.date),
            y: w.weight
          })),
          ...projectionPoints
        ],
        borderColor: baseColor.replace('rgb', 'rgba').replace(')', ', 0.5)'),
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
        fill: false
      };

      return [mainDataset, trendDataset];
    });

    return {
      datasets
    };
  };

  const colors = [
    'rgb(59, 130, 246)', // blue
    'rgb(16, 185, 129)', // green
    'rgb(239, 68, 68)',  // red
    'rgb(245, 158, 11)', // yellow
    'rgb(139, 92, 246)', // purple
    'rgb(236, 72, 153)', // pink
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Évolution du poids des animaux',
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        callbacks: {
          title: (items: any[]) => {
            if (!items.length) return '';
            const date = new Date(items[0].parsed.x);
            return date.toLocaleDateString('fr-FR');
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'dd/MM/yyyy'
          }
        },
        title: {
          display: true,
          text: 'Date'
        },
        adapters: {
          date: {
            locale: fr
          }
        },
        ticks: {
          maxRotation: 90,
          minRotation: 90
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Poids (kg)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative">
          Aucun animal enregistré
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Graphique des poids */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Suivi des poids</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                      chartType === 'line' ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                    }`}
                    title="Graphique en ligne"
                  >
                    <PresentationChartLineIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                      chartType === 'bar' ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                    }`}
                    title="Graphique en barres"
                  >
                    <ChartBarIcon className="h-5 w-5" />
                  </button>
                  {chartType === 'line' && (
                    <button
                      onClick={() => setShowTrendlines(!showTrendlines)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors ${
                        showTrendlines ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                      }`}
                      title="Afficher/masquer les tendances"
                    >
                      <ArrowTrendingUpIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">Tendances</span>
                    </button>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setIsBulkWeightEntryOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Saisie des poids en masse
              </Button>
            </div>
            {weightData.size > 0 ? (
              <div style={{ height: '400px' }}>
                {chartType === 'line' ? (
                  <Line data={getChartData()} options={options} />
                ) : (
                  <Bar data={getChartData()} options={options} />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Aucune donnée de poids disponible</p>
              </div>
            )}
          </div>

          {/* Recommandations alimentaires */}
          <div className="bg-white rounded-lg shadow-sm">
            <GroupedFoodRecommendation pets={pets} />
          </div>
        </div>

        {/* Rappels et traitements à venir */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Rappels</h2>
          </div>
          <div className="space-y-4">
            {pets.length > 0 ? (
              <>
                <div className="divide-y divide-gray-100">
                  {pets.map(pet => (
                    <div key={pet.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        <h3 className="font-medium text-gray-900">{pet.name}</h3>
                      </div>
                      <UpcomingReminders
                        petId={pet.id}
                        onReminderComplete={() => loadData()}
                        onReminderCancel={() => loadData()}
                        onHasReminders={hasReminders => handleHasReminders(pet.id, hasReminders)}
                      />
                    </div>
                  ))}
                </div>
                {!hasAnyReminders && (
                  <div className="text-center text-gray-500 py-4">
                    Aucun rappel à venir
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Aucun animal enregistré
              </div>
            )}
          </div>
        </div>
      </div>

      <BulkWeightEntry
        pets={pets}
        isOpen={isBulkWeightEntryOpen}
        onClose={() => setIsBulkWeightEntryOpen(false)}
        onSave={loadData}
      />
    </div>
  );
}; 