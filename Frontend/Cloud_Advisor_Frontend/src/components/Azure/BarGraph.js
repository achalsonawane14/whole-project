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

const BarGraph = ({ data, filter }) => {
  if (!data || data.length === 0) return <p>Loading...</p>;

  // Function to format dates to "MMM YYYY" format for monthly data
  const formatDateMonthly = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  // Function to format dates for "15 days" intervals
  const formatDate15Days = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    if (day <= 15) {
        return `1 ${month} - 15 ${month}`;
    } else {
        const startDay = 16;
        const endDay = new Date(year, date.getMonth() + 1, 0).getDate(); // Last day of the month
        return `${startDay} ${month} - ${endDay} ${month}`;
    }
  };

  // Determine the format based on the filter
  const formatDate = (dateStr) => {
    if (filter === 'monthly') {
      return formatDateMonthly(dateStr);
    } else if (filter === '15days') {
      return formatDate15Days(dateStr);
    } else {
      return new Date(dateStr).toLocaleDateString('en-CA');
    }
  };

  const formattedData = data.map((entry) => ({
    ...entry,
    formattedDate: formatDate(entry.date),
  }));

  // Sort the dates for 'monthly' and '15days' filters
  const sortDates = (a, b) => {
    if (filter === 'monthly') {
      return new Date(a) - new Date(b);
    } else if (filter === '15days') {
      const [startA] = a.split(' ')[0];
      const [startB] = b.split(' ')[0];
      return new Date(startA) - new Date(startB);
    } else {
      return new Date(a) - new Date(b);
    }
  };

  const dates = [...new Set(formattedData.map((d) => d.formattedDate))].sort(sortDates);
  const services = [...new Set(formattedData.map((d) => d.service))];

  console.log("Formatted Dates:", dates);

  const colors = [
    '#0D7C66', // Color for service 1
    '#002379', // Color for service 2
    '#3357FF'  // Color for service 3
  ];

  const datasets = services.map((service, index) => ({
    label: service,
    data: dates.map((date) => {
      const entry = formattedData.find((d) => d.formattedDate === date && d.service === service);
      return entry ? entry.service_cost : 0;
    }),
    backgroundColor: colors[index % colors.length],
  }));

  const chartData = { labels: dates, datasets };

  console.log("Chart Data:", chartData);

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

            const servicesWithCosts = context.chart.data.datasets.map(
              (dataset) => ({
                service: dataset.label,
                cost: dataset.data[context.dataIndex],
              })
            );

            const tooltip = servicesWithCosts.map(
              (svc) => `${svc.service}: ${svc.cost.toFixed(2)}`
            );

            return [
              `${service}: ${cost.toFixed(2)}`,
              '',
              ...tooltip.slice(0, tooltip.length - 1),
              `${servicesWithCosts[servicesWithCosts.length - 1].service}: ${servicesWithCosts[servicesWithCosts.length - 1].cost.toFixed(2)}`,
              '',
              `Total: ${totalCost.toFixed(2)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: filter === 'monthly' ? 'Month' : filter === '15days' ? '15-Day Interval' : 'Date', // Change the x-axis label based on the filter
        },
        ticks: {
          color: '#333',
          font: {
            size: 14,
            weight: 'bold',
          },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: filter === '15days' ? 24 : 10, // Adjust maxTicksLimit for 15-day intervals
        },
      },
      y: {
        title: {
          display: true,
          text: 'Service Cost',
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
