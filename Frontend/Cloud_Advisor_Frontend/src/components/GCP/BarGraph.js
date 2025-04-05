// BarGraph.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarGraph = ({ data, source = 'GCP' }) => {
  if (!data || data.length === 0) return <p>Loading...</p>;

  console.log('BarGraph Data:', data, 'Source:', source);

  const dates = [...new Set(data.map((d) => d.date))].sort((a, b) => new Date(a) - new Date(b));
  const services = [...new Set(data.map((d) => d.service))];

  // Generate random colors
  const generateRandomColor = () =>
    `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(
      Math.random() * 200
    )}, ${Math.floor(Math.random() * 200)}, 0.7)`;

  const backgroundColors = services.map(() => generateRandomColor());

  const datasets = services.map((service, index) => ({
    label: service,
    data: dates.map((date) => {
      const entry = data.find((d) => d.date === date && d.service === service);
      return entry ? entry.service_cost : 0;
    }),
    backgroundColor: backgroundColors[index],
    barThickness: 7,
  }));

  const chartData = {
    labels: dates,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 15,
            weight: 'bold',
          },
          color: '#333',
          boxWidth: 12,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const service = context.dataset.label;
            const cost = context.raw;
            const totalCost = context.chart.data.datasets.reduce(
              (sum, dataset) => sum + dataset.data[context.dataIndex],
              0
            );
            return [`${service}: ${cost.toFixed(2)}`, `Total: ${totalCost.toFixed(2)}`];
          },
        },
      },
    },
    scales: {
      x: {
        offset: true,
        categoryPercentage: 0.9,
        barPercentage: 0.8,
        title: {
          display: true,
          text: 'Date',
          color: '#333',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          color: '#333',
          font: {
            size: 14,
            weight: 'bold',
          },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
          maxTicksLimit: dates.length,
        },
      },
      y: {
        title: {
          display: true,
          text: source === 'gcp' ? 'GCP Service Cost' : 'GCP Service Cost',
          color: '#333',
          font: {
            size: 15,
            weight: 'bold',
          },
        },
        ticks: {
          beginAtZero: true,
          precision: 2,
          color: '#333',
          font: {
            size: 15,
            weight: 'bold',
          },
        },
      },
    },
  };

  return (
    <div className="bar-chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarGraph;