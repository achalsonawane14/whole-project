import React, { useEffect, useState, useCallback, memo } from 'react';
import BarGraph from '../components/GCP/BarGraph';
import DonutGraph from '../components/GCP/DonutGraph';
import Metrics from '../components/GCP/Metrics';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import '../styles/Dashboard.css';

const MemoizedBarGraph = memo(BarGraph);
const MemoizedDonutGraph = memo(DonutGraph);

const GCPDashboard = memo(() => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('daily');
  const [totalCost, setTotalCost] = useState(0);
  const [averageMonthlyCost, setAverageMonthlyCost] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const roundToTwoDecimals = (number) => Math.round(number * 100) / 100;
  const preciseSum = (nums) => nums.reduce((acc, num) => acc + (num * 100), 0) / 100;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = '';

      if (filter === 'custom' && startDate && endDate) {
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        url = `http://localhost:5000/fetch-gcp-cost-usage-date-range?start_date=${startDateStr}&end_date=${endDateStr}`;
      } else {
        const endpoints = {
          daily: 'http://localhost:5000/fetch-cost-usage-daily',
          monthly: 'http://localhost:5000/fetch-cost-usage-monthly',
          '15days': 'http://localhost:5000/fetch-cost-usage-15days',
        };
        url = endpoints[filter] || endpoints['daily'];
      }

      const response = await axios.get(url);
      console.log("GCP Response data:", response.data);

      const rawData = response.data.cost_usage_date_range ||
                      response.data.cost_usage_daily ||
                      response.data.cost_usage_monthly ||
                      response.data.cost_usage_15days || [];

      const formattedData = rawData.map((entry) => ({
        ...entry,
        service_cost: parseFloat(entry.service_cost),
        date: new Date(entry.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      }));

      const totalCost = preciseSum(formattedData.map((entry) => roundToTwoDecimals(entry.service_cost)));
      const avgMonthlyCost = formattedData.length > 0
        ? totalCost / new Set(formattedData.map((e) => e.date.slice(3, 10))).size
        : 0;

      const uniqueServices = new Set(formattedData.map((entry) => entry.service)).size;

      setData(formattedData);
      setTotalCost(roundToTwoDecimals(totalCost));
      setAverageMonthlyCost(roundToTwoDecimals(avgMonthlyCost));
      setServiceCount(uniqueServices);
    } catch (error) {
      console.error("Error fetching GCP cost data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>GCP Cost Dashboard</h2>
        <div className="filters">
  <div className="filter-options">
    <label className={`filter-option ${filter === 'daily' ? 'active' : ''}`}>
      <input
        type="radio"
        value="daily"
        checked={filter === 'daily'}
        onChange={() => setFilter('daily')}
      />
      Daily
    </label>
    <label className={`filter-option ${filter === 'monthly' ? 'active' : ''}`}>
      <input
        type="radio"
        value="monthly"
        checked={filter === 'monthly'}
        onChange={() => setFilter('monthly')}
      />
      Monthly
    </label>
    <label className={`filter-option ${filter === 'custom' ? 'active' : ''}`}>
      <input
        type="radio"
        value="custom"
        checked={filter === 'custom'}
        onChange={() => setFilter('custom')}
      />
      Custom
    </label>
  </div>
</div>
        {filter === 'custom' && (
          <div className="date-picker-section">
            <label>Start Date: </label>
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
            <label>End Date: </label>
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
          </div>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Metrics
            totalCost={totalCost}
            averageMonthlyCost={averageMonthlyCost}
            serviceCount={serviceCount}
          />
          <MemoizedBarGraph data={data} />
          <MemoizedDonutGraph data={data} />
        </>
      )}
    </div>
  );
});

export default GCPDashboard;
