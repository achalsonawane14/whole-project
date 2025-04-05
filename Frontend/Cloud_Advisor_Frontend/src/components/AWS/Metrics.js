import React from 'react';

const Metrics = ({ totalCost, averageMonthlyCost, serviceCount }) => {
  return (
    <div className="metrics-container">
      <div className="metric">
        <h2>Total Cost</h2>
        <p>${totalCost.toFixed(2)}</p>
      </div>
      <div className="metric">
        <h2>Average Monthly Cost</h2>
        <p>${averageMonthlyCost.toFixed(2)}</p>
      </div>
      <div className="metric">
        <h2>Service Count</h2>
        <p>{serviceCount}</p>
      </div>
    </div>
  );
};

export default Metrics;
