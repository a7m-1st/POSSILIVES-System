import React from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface PersonalityChartProps {
  personality: PersonalityTraits;
  title?: string;
}

const PersonalityChart: React.FC<PersonalityChartProps> = ({
  personality,
  title = "Your Personality Profile"
}) => {
  // Prepare data for charts
  const chartData = {
    labels: [
      "Extraversion",
      "Neuroticism", 
      "Agreeableness",
      "Conscientiousness",
      "Openness",
    ],
    datasets: [
      {
        label: "Personality Traits",
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "rgba(0,0,0,1)",
        borderWidth: 2,
        data: [
          personality.extraversion,
          personality.neuroticism,
          personality.agreeableness,
          personality.conscientiousness,
          personality.openness,
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Personality Traits Overview",
      },
      legend: {
        display: true,
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const horizontalChartOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: "Personality Traits (Horizontal View)",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <h3>{title}</h3>
        <div className="row">
          <div className="col-md-6">
            <div style={{ height: '400px', marginBottom: '2rem' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
          <div className="col-md-6">
            <div style={{ height: '400px' }}>
              <Bar data={chartData} options={horizontalChartOptions} />
            </div>
          </div>
        </div>
        
        {/* Additional insights */}
        <div className="mt-3">
          <h5>Personality Insights:</h5>
          <div className="row">
            {Object.entries(personality).map(([trait, value]) => (
              <div key={trait} className="col-md-6 mb-2">
                <small className="text-muted">
                  <strong>{trait.charAt(0).toUpperCase() + trait.slice(1)}:</strong> {value}/10
                  {value >= 7 && <span className="text-success"> (High)</span>}
                  {value >= 4 && value < 7 && <span className="text-warning"> (Moderate)</span>}
                  {value < 4 && <span className="text-danger"> (Low)</span>}
                </small>
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PersonalityChart;
