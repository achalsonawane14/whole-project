import React from 'react';

const Metrics = ({ totalCost, averageMonthlyCost, serviceCount }) => {
  // Ensure the values have defaults if they are undefined or null
  const displayTotalCost = totalCost !== undefined ? totalCost.toFixed(2) : '0.00';
  const displayAverageMonthlyCost = averageMonthlyCost !== undefined ? averageMonthlyCost.toFixed(2) : '0.00';
  const displayServiceCount = serviceCount !== undefined ? serviceCount : 0;

  return (
    <div className="metrics-container">
      <div className="metric">
        <h2>Total Cost</h2>
        <p>${displayTotalCost}</p>
      </div>
      <div className="metric">
        <h2>Average Monthly Cost</h2>
        <p>${displayAverageMonthlyCost}</p>
      </div>
      <div className="metric">
        <h2>Service Count</h2>
        <p>{displayServiceCount}</p>
      </div>
    </div>
  );
};

export default Metrics;
