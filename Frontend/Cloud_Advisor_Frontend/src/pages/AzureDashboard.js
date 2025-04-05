import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MemoizedBarGraph from '../components/Azure/BarGraph';
import MemoizedDonutGraph from '../components/Azure/DonutGraph';
import Metrics from '../components/Azure/Metrics';
import '../styles/Dashboard.css';

const AzureDashboard = () => {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState('daily');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [totalCost, setTotalCost] = useState(0);
    const [averageMonthlyCost, setAverageMonthlyCost] = useState(0);
    const [serviceCount, setServiceCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const roundToTwoDecimals = (number) => Math.round(number * 100) / 100;

    const preciseSum = (nums) => nums.reduce((acc, num) => acc + (num * 100), 0) / 100;

    const calculateMetrics = (data) => {
        const totalCost = preciseSum(data.map(entry => roundToTwoDecimals(entry.service_cost)));
        const uniqueMonths = [...new Set(data.map(entry => entry.date.split('-')[1]))];
        const averageMonthlyCost = roundToTwoDecimals(totalCost / uniqueMonths.length);
        const uniqueServices = [...new Set(data.map(entry => entry.service.trim()))];

        setTotalCost(totalCost);
        setAverageMonthlyCost(averageMonthlyCost);
        setServiceCount(uniqueServices.length);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
    
        try {
            let url;
    
            if (filter === 'custom' && startDate && endDate) {
                url = `http://localhost:5001/api/fetch-cost-usage-date-range?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`;
            } else {
                const endpoints = {
                    daily: 'http://localhost:5001/fetch-cost-usage-daily',
                    monthly: 'http://localhost:5001/fetch-cost-usage-monthly',
                };
                url = endpoints[filter];
            }
    
            console.log("Fetching data from:", url);
            const response = await axios.get(url);
            console.log("Response:", response);
    
            const rawDataKey = filter === 'daily' ? 'cost_usage_daily' : filter === 'monthly' ? 'cost_usage_monthly' : 'cost_usage_date_range';
            const rawData = response.data[rawDataKey] || [];
            console.log("Fetched Raw Data:", rawData);
    
            if (rawData.length === 0) {
                setError('No data available for this period.');
                setLoading(false);
                return;
            }
    
            const formattedData = rawData.map((entry) => ({
                ...entry,
                service_cost: parseFloat(entry.service_cost),
                service: entry.ServiceName ? entry.ServiceName.trim() : 'Unknown Service',
                date: filter === 'daily' ? (entry.UsageDate ? new Date(entry.UsageDate).toLocaleDateString('en-CA') : 'Invalid Date') :
                      filter === 'monthly' ? (entry.month ? entry.month : 'Invalid Date') : (entry.Date ? new Date(entry.Date).toLocaleDateString('en-CA') : 'Invalid Date'),
            }));
    
            console.log("Formatted Data:", formattedData);
            setData(formattedData);
            calculateMetrics(formattedData);
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response) {
                console.error('Response error data:', error.response.data);
                console.error('Response error status:', error.response.status);
                console.error('Response error headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request error:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            setError('Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    }, [filter, startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [filter, fetchData]);

    return (
        <div className="dashboard-container">
            <h2>Azure Service Costs</h2>
            <div className="filters">
                <label>
                    <input
                        type="radio"
                        value="daily"
                        checked={filter === 'daily'}
                        onChange={() => setFilter('daily')}
                    /> Daily
                </label>
                <label>
                    <input
                        type="radio"
                        value="monthly"
                        checked={filter === 'monthly'}
                        onChange={() => setFilter('monthly')}
                    /> Monthly
                </label>
                <label>
                    <input
                        type="radio"
                        value="custom"
                        checked={filter === 'custom'}
                        onChange={() => setFilter('custom')}
                    /> Custom
                </label>
            </div>

            {filter === 'custom' && (
                <div className="date-pickers">
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Start Date"
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="End Date"
                    />
                    <button onClick={fetchData}>Apply Filter</button>
                </div>
            )}

            {loading && <p>Loading data...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && (
                <>
                    <Metrics totalCost={totalCost} averageMonthlyCost={averageMonthlyCost} serviceCount={serviceCount} />
                    <MemoizedBarGraph data={data} filter={filter} />
                    <MemoizedDonutGraph data={data} />
                </>
            )}
        </div>
    );
};

export default AzureDashboard;
