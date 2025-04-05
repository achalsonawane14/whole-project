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

const BarGraph = ({ data }) => {
  if (!data || data.length === 0) return <p>Loading...</p>;

  console.log('BarGraph Data:', data);

  const dates = [...new Set(data.map((d) => d.date))].sort((a, b) => new Date(a) - new Date(b));

  const services = [...new Set(data.map((d) => d.service))];

  const colors = [
    '#0D7C66',
    '#002379',
    '#3357FF',
    '#FF33A8',
    '#FFC733',
    '#33FFF5',
    '#8E44AD',
    '#F1C40F',
    '#2ECC71',
    '#E74C3C',
    '#3498DB',
    '#9B59B6',
  ];

  const datasets = services.map((service, index) => ({
    label: service,
    data: dates.map((date) => {
      const entry = data.find(
        (d) => d.date === date && d.service === service
      );
      return entry ? entry.service_cost : 0;
    }),
    backgroundColor: colors[index % colors.length],
  }));

  console.log("Datasets:", datasets);

  const chartData = {
    labels: dates,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill its container
    plugins: {
      legend: {
        display: true,
        position: 'bottom', // Labels below the chart
        labels: {
          font: {
            size: 15,
            weight: 'bold', // Make legend labels bold
          },
          color: '#333', // Darker color for legend labels
          boxWidth: 12,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            const service = context.dataset.label;
            const cost = context.raw;
            const totalCost = context.chart.data.datasets.reduce((sum, dataset) => sum + dataset.data[context.dataIndex], 0);
            const date = context.label;

            const servicesWithCosts = context.chart.data.datasets.map((dataset) => ({
                service: dataset.label,
                cost: dataset.data[context.dataIndex],
            }));

            const tooltip = servicesWithCosts.map((svc) => (
                `${svc.service}: ${svc.cost.toFixed(2)}`
            ));

            return [
                `${service}: ${cost.toFixed(2)}`,
                '',
                ...tooltip.slice(0, tooltip.length - 1), // All legends except the last one
                
                `${servicesWithCosts[servicesWithCosts.length - 1].service}: ${servicesWithCosts[servicesWithCosts.length - 1].cost.toFixed(2)}`, // Last legend
                '',
                `Total: ${totalCost.toFixed(2)}`
            ];
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#333', // Darker color for x-axis title
          font: {
            size: 14,
            weight: 'bold', // Make x-axis title bold
          },
        },
        ticks: {
          color: '#333', // Darker color for x-axis ticks
          font: {
            size: 14,
            weight: 'bold', // Make x-axis ticks bold
          },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10, // Limit x-axis labels
        },
      },
      y: {
        title: {
          display: true,
          text: 'Service Cost',
          color: '#333', // Darker color for y-axis title
          font: {
            size: 15,
            weight: 'bold', // Make y-axis title bold
          },
        },
        ticks: {
          beginAtZero: true,
          precision: 2,
          color: '#333', // Darker color for y-axis ticks
          font: {
            size: 15,
            weight: 'bold', // Make y-axis ticks bold
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
