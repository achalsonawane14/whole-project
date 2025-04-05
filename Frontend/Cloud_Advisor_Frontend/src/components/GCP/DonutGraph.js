import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const fetchDataFromLocalhost = async () => {
  try {
    const response = await fetch("http://localhost:5000/fetch-cost-usage"); 
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    console.log("Fetched Data:", data);

    if (data && Array.isArray(data.cost_usage_data)) {
      return data.cost_usage_data.map(item => ({
        ...item,
        service_cost: parseFloat(item.service_cost) || 0  // Convert string to number
      }));
    } else {
      console.error("Invalid data format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const DonutGraph = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const localData = await fetchDataFromLocalhost();
      setData(localData); // Always an array
    };
    loadData();
  }, []);

  if (!Array.isArray(data) || data.length === 0) {
    console.log("Data is empty or not an array:", data);
    return <p>No data available</p>;
  }

  const services = [...new Set(data.map((d) => d.service))];

  const totalCost = services.reduce((acc, service) => {
    acc[service] = data
      .filter((d) => d.service === service)
      .reduce((sum, d) => {
        const cost = parseFloat(d.service_cost); 
        return sum + (isNaN(cost) ? 0 : cost); // Avoid NaN issues
      }, 0);
    return acc;
  }, {});

  const backgroundColors = services.map(
    () =>
      `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(
        Math.random() * 200
      )}, ${Math.floor(Math.random() * 200)}, 0.7)`
  );

  const chartData = {
    labels: services,
    datasets: [
      {
        data: services.map((service) => totalCost[service]),
        backgroundColor: backgroundColors,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const service = context.label;
            const cost = context.raw;
            const totalCost = context.dataset.data.reduce((sum, value) => sum + value, 0);
            return [`${service}: ${cost.toFixed(2)}`, `Total: ${totalCost.toFixed(2)}`];
          },
        },
      },
    },
  };

  const customLegend = services.map((service, index) => (
    <div key={index} className="legend-item">
      <span className="legend-color-box" style={{ backgroundColor: backgroundColors[index] }}></span>
      <span className="legend-label">{service}</span>
    </div>
  ));

  return (
    <div className="donut-chart-wrapper">
      <div className="donut-chart-container">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="donut-chart-legend">{customLegend}</div>
    </div>
  );
};

export default DonutGraph;
