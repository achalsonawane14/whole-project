import React, { useEffect, useState, useCallback, memo } from 'react';
import BarGraph from '../components/AWS/BarGraph';
import DonutGraph from '../components/AWS/DonutGraph';
import Metrics from '../components/AWS/Metrics';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import '../styles/Dashboard.css';
import { useHistory } from "react-router-dom";


import UnusedService_AWS from './UnusedService_AWS';

// Optimize BarGraph and DonutGraph by using React.memo
const MemoizedBarGraph = memo(BarGraph);
const MemoizedDonutGraph = memo(DonutGraph);

const AwsDashboard = memo(() => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('daily');
  const [totalCost, setTotalCost] = useState(0);
  const [averageMonthlyCost, setAverageMonthlyCost] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showUnusedServices, setShowUnusedServices] = useState(false); // New state for unused services

  const roundToTwoDecimals = (number) => {
    return Math.round(number * 100) / 100;
  };

  const preciseSum = (nums) => {
    return nums.reduce((acc, num) => {
      return acc + (num * 100);
    }, 0) / 100;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url;

      if (filter === 'custom' && startDate && endDate) {
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        url = `http://localhost:5000/fetch-cost-usage-date-range?start_date=${startDateStr}&end_date=${endDateStr}`;
      } else {
        const endpoints = {
          daily: 'http://localhost:5000/fetch-cost-usage-daily',
          monthly: 'http://localhost:5000/fetch-cost-usage-monthly',
        };
        url = endpoints[filter];
      }

      const response = await axios.get(url);
      console.log("Response data:", response.data);

      let rawData = response.data.cost_usage_date_range ||
                    response.data.cost_usage_daily || 
                    response.data.cost_usage_monthly || [];

      if (rawData.length === 0) {
        console.warn('No data available for the selected filter.');
      }

      const formattedData = rawData.map((entry) => ({
        ...entry,
        service_cost: parseFloat(entry.service_cost),
        date: new Date(entry.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      }));

      console.log("Formatted Data:", formattedData);

      const totalCost = preciseSum(formattedData.map(entry => roundToTwoDecimals(entry.service_cost)));
      console.log("Calculated Total Cost:", totalCost);
      setTotalCost(totalCost);

      const uniqueMonths = [...new Set(formattedData.map(entry => entry.date.split('/')[1]))];
      const averageMonthlyCost = roundToTwoDecimals(totalCost / uniqueMonths.length);
      console.log("Calculated Average Monthly Cost:", averageMonthlyCost);
      setAverageMonthlyCost(averageMonthlyCost);

      const uniqueServices = [...new Set(formattedData.map(entry => entry.service))];
      console.log("Unique Services:", uniqueServices);
      setServiceCount(uniqueServices.length);

      setData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, startDate, endDate]);

  useEffect(() => {
    console.log("AwsDashboard mounted");
    fetchData();
    return () => {
      console.log("AwsDashboard unmounted");
    };
  }, [fetchData]);
const history = useHistory();
  return (
    <div className="dashboard-container">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <h2 className="dashboard-title">AWS Service Costs</h2>
          <div className="filters">
            <label>
              <input
                type="radio"
                value="daily"
                checked={filter === 'daily'}
                onChange={() => setFilter('daily')}
              />
              Daily
            </label>
            <label>
              <input
                type="radio"
                value="monthly"
                checked={filter === 'monthly'}
                onChange={() => setFilter('monthly')}
              />
              Monthly
            </label>
            <label>
              <input
                type="radio"
                value="custom"
                checked={filter === 'custom'}
                onChange={() => setFilter('custom')}
              />
              Custom
            </label>
            
            {/* Button to toggle unused services */}
            {/* <button className="unused-button" onClick={() => history.push("/UnusedService_AWS")}>
  Show Unused Services
</button> */}
          </div>

          {filter === 'custom' && (
            <div className="date-pickers">
              <div>
                <label>Start Date:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              <div>
                <label>End Date:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </div>
          )}

          <Metrics totalCost={totalCost} averageMonthlyCost={averageMonthlyCost} serviceCount={serviceCount} />
          <MemoizedBarGraph data={data} />
          <MemoizedDonutGraph data={data} />

          {/* Show UnusedServices Component when toggled */}
          {/* {showUnusedServices && <UnusedServices onClose={() => setShowUnusedServices(false)} />} */}
        </>
      )}
    </div>
  );
});

export default AwsDashboard;
