import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutGraph = ({ data }) => {
  if (!data || data.length === 0) return <p>Loading...</p>;

  const services = [...new Set(data.map((d) => d.service))];

  const totalCost = services.reduce((acc, service) => {
    acc[service] = data.filter((d) => d.service === service).reduce((sum, d) => sum + d.service_cost, 0);
    return acc;
  }, {});

  const colors = ['#0D7C66', '#002379', '#3357FF', '#FF33A8', '#FFC733', '#33FFF5', '#8E44AD', '#F1C40F', '#2ECC71'];

  const chartData = {
    labels: services,
    datasets: [
      {
        data: services.map((service) => totalCost[service]),
        backgroundColor: services.map((service, index) => colors[index % colors.length]),
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: { display: true, position: 'right' },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const service = context.label;
            const cost = context.raw;
            const totalCost = context.dataset.data.reduce((sum, value) => sum + value, 0);
            const percentage = ((cost / totalCost) * 100).toFixed(2);

            const servicesWithCosts = context.dataset.data.map((value, index) => ({
              service: context.chart.data.labels[index],
              cost: value,
            }));

            const tooltip = servicesWithCosts.map((svc) => (
              `${svc.service}: ${svc.cost.toFixed(2)}`
            ));

            return [
              `${service}: ${percentage}% (${cost.toFixed(2)})`,
              '',
              ...tooltip.slice(0, tooltip.length - 1),
              `${servicesWithCosts[servicesWithCosts.length - 1].service}: ${servicesWithCosts[servicesWithCosts.length - 1].cost.toFixed(2)}`,
              '',
              `Total: ${totalCost.toFixed(2)}`
            ];
          },
        },
      },
    },
  };

  return (
    <div className="donut-chart-wrapper">
      <div className="donut-chart-container">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DonutGraph;
