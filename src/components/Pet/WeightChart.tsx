import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { WeightMeasurement } from '../../types/pet';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeightChartProps {
  weightHistory: WeightMeasurement[];
}

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

export const WeightChart: React.FC<WeightChartProps> = ({ weightHistory }) => {
  const sortedHistory = [...weightHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Préparer les données pour la régression linéaire
  const regressionData = sortedHistory.map((measurement, index) => ({
    x: index,
    y: measurement.weight
  }));

  // Calculer la régression linéaire
  const regression = calculateLinearRegression(regressionData);

  // Générer les points de projection pour les 14 prochains jours
  const projectionPoints: { date: Date; weight: number }[] = [];
  if (regression && sortedHistory.length > 0) {
    const lastDate = new Date(sortedHistory[sortedHistory.length - 1].date);
    for (let i = 1; i <= 14; i++) {
      const projectedDate = addDays(lastDate, i);
      const projectedWeight = regression.slope * (regressionData.length + i - 1) + regression.intercept;
      projectionPoints.push({
        date: projectedDate,
        weight: Math.max(0, projectedWeight) // Éviter les poids négatifs
      });
    }
  }

  // Combiner les dates historiques et projetées pour les labels
  const allDates = [
    ...sortedHistory.map(m => new Date(m.date)),
    ...projectionPoints.map(p => p.date)
  ];

  const data = {
    labels: allDates.map(date => 
      format(date, 'dd MMM yyyy', { locale: fr })
    ),
    datasets: [
      {
        label: 'Poids (kg)',
        data: sortedHistory.map(measurement => measurement.weight),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3
      },
      {
        label: 'Tendance',
        data: [
          ...sortedHistory.map(measurement => measurement.weight),
          ...projectionPoints.map(point => point.weight)
        ],
        borderColor: 'rgba(107, 114, 128, 0.5)',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        tension: 0
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Évolution du poids'
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(3)} kg`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Poids (kg)'
        }
      }
    }
  };

  if (weightHistory.length < 2) {
    return (
      <div className="text-center text-gray-500 py-4">
        Pas assez de données pour afficher un graphique
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line data={data} options={options} />
    </div>
  );
}; 