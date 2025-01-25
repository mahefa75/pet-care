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
import { format } from 'date-fns';
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

export const WeightChart: React.FC<WeightChartProps> = ({ weightHistory }) => {
  const sortedHistory = [...weightHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const data = {
    labels: sortedHistory.map(measurement => 
      format(new Date(measurement.date), 'dd MMM yyyy', { locale: fr })
    ),
    datasets: [
      {
        label: 'Poids (kg)',
        data: sortedHistory.map(measurement => measurement.weight),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Évolution du poids'
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