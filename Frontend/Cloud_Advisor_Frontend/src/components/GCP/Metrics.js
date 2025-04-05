import React from "react";

const Metrics = ({ totalCost, averageMonthlyCost, serviceCount }) => {
  return (
    <div className="metrics">
      <div className="metric">
        <h3>Total Cost:</h3>
        <p>${totalCost.toFixed(2)}</p>
      </div>
      <div className="metric">
        <h3>Average Monthly Cost:</h3>
        <p>${averageMonthlyCost.toFixed(2)}</p>
      </div>
      <div className="metric">
        <h3>Service Count:</h3>
        <p>{serviceCount}</p>
      </div>
    </div>
  );
};

export default Metrics;
