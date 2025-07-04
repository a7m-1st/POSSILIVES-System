import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, AreaChart, Area } from 'recharts';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { api } from '../../api/axiosConfig.ts';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaChartLine, FaCalendarAlt, FaFilter, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Statistics.css';

const ACTION_TYPES = {
  CREATE: 'C',
  READ: 'R',
  UPDATE: 'U',
  DELETE: 'D',
};

const TARGET_TYPES = {
  USERHABIT: 'USERHABIT',
  GENERATION: 'GENERATION',
  INFLUENCE: 'INFLUENCE',
  NOTIFICATION: 'NOTIFICATION',
};

const FILTERS = {
  ALL: 'all',
  FUTURES: 'futures',
  HABITS: 'habits',
  INFLUENCE: 'influence',
};

const TIME_RANGES = {
  WEEK: 'week',
  MONTH: 'month',
  THREE_MONTHS: 'three_months',
  YEAR: 'year',
  CUSTOM: 'custom',
};

const Statistics = () => {
  const [statisticsData, setStatisticsData] = useState([]);
  const [activeFilter, setActiveFilter] = useState(FILTERS.ALL);
  const [timeRange, setTimeRange] = useState(TIME_RANGES.MONTH);
  const [startDate, setStartDate] = useState(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState('line');
  const [summaryData, setSummaryData] = useState({
    totalFutures: 0,
    totalHabits: 0,
    totalInfluence: 0,
    averageInfluence: 0
  });

  useEffect(() => {
    fetchStatistics(activeFilter);
  }, []);

  const getTargetTypeFromFilter = (filter) => {
    switch (filter) {
      case FILTERS.FUTURES:
        return TARGET_TYPES.GENERATION;
      case FILTERS.HABITS:
        return TARGET_TYPES.USERHABIT;
      case FILTERS.INFLUENCE:
        return TARGET_TYPES.INFLUENCE;
      default:
        return TARGET_TYPES.GENERATION;
    }
  };

  const getFilterLabel = (filter) => {
    switch (filter) {
      case FILTERS.FUTURES:
        return 'Futures Generated';
      case FILTERS.HABITS:
        return 'Habits Created';
      case FILTERS.INFLUENCE:
        return 'Influence Changes';
      default:
        return 'All Data';
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    let newStartDate;
    
    switch (range) {
      case TIME_RANGES.WEEK:
        newStartDate = subDays(new Date(), 7);
        break;
      case TIME_RANGES.MONTH:
        newStartDate = subMonths(new Date(), 1);
        break;
      case TIME_RANGES.THREE_MONTHS:
        newStartDate = subMonths(new Date(), 3);
        break;
      case TIME_RANGES.YEAR:
        newStartDate = subYears(new Date(), 1);
        break;
      case TIME_RANGES.CUSTOM:
        setShowCustomRange(true);
        return;
      default:
        newStartDate = subMonths(new Date(), 1);
    }
    
    setStartDate(newStartDate);
    setEndDate(new Date());
    setShowCustomRange(false);
    
    fetchStatistics(activeFilter, newStartDate, new Date());
  };

  const applyCustomDateRange = () => {
    fetchStatistics(activeFilter, startDate, endDate);
  };
  const fetchStatistics = async (filter, start = startDate, end = endDate) => {
    setIsLoading(true);
    setError(null);

    try {
      const action = ACTION_TYPES.READ;
      const targetType = getTargetTypeFromFilter(filter);

      // Convert dates to KL timezone (UTC+8) and set appropriate times
      const klOffset = 8 * 60; // KL is UTC+8
      const startDateKL = new Date(start);
      const endDateKL = new Date(end);
      
      // Set start time to beginning of day in KL time (00:00 KL = 16:00 UTC previous day)
      startDateKL.setHours(0, 0, 0, 0);
      const startTimeUTC = new Date(startDateKL.getTime() - (klOffset * 60 * 1000));
      
      // Set end time to end of day in KL time (23:59 KL = 15:59 UTC next day)
      endDateKL.setHours(23, 59, 59, 999);
      const endTimeUTC = new Date(endDateKL.getTime() - (klOffset * 60 * 1000));

      const params = {
        startTime: startTimeUTC.toISOString(),
        endTime: endTimeUTC.toISOString(),
      };

      const response = await api.get(`/api/audit/statistics/${action}/${targetType}`, { params });
      const data = response.data[0];

      if (!data || !data.stats) {
        throw new Error('Invalid data format received from server');
      }      const chartData = data.stats.map(item => {
        // Convert UTC date back to KL timezone for display
        const utcDate = new Date(item.date);
        const klDate = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for KL time
        
        return {
          date: format(klDate, 'MMM dd'),
          _rawDate: klDate,
          futures: item.futuresGenerated,
          habits: item.habitsCreated,
          influence: item.habitsInfluenceChanged,
        };
      });

      chartData.sort((a, b) => a._rawDate - b._rawDate);

      setStatisticsData(chartData);

      const totalFutures = data.stats.reduce((sum, item) => sum + item.futuresGenerated, 0);
      const totalHabits = data.stats.reduce((sum, item) => sum + item.habitsCreated, 0);
      const totalInfluence = data.stats.reduce((sum, item) => sum + item.habitsInfluenceChanged, 0);

      setSummaryData({
        totalFutures,
        totalHabits,
        totalInfluence,
        averageInfluence: data.averageInfluence || 0,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to load statistics data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    fetchStatistics(filter);
  };

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart data={statisticsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fill: '#666' }} />
          <YAxis tick={{ fill: '#666' }} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          {(activeFilter === FILTERS.ALL || activeFilter === FILTERS.FUTURES) && (
            <Line 
              type="monotone" 
              dataKey="futures" 
              stroke="#6C5CE7" 
              strokeWidth={2}
              name="Futures Generated" 
              activeDot={{ r: 8, fill: '#6C5CE7' }} 
            />
          )}
          {(activeFilter === FILTERS.ALL || activeFilter === FILTERS.HABITS) && (
            <Line 
              type="monotone" 
              dataKey="habits" 
              stroke="#00B894" 
              strokeWidth={2}
              name="Habits Created" 
              activeDot={{ r: 6, fill: '#00B894' }}
            />
          )}
          {(activeFilter === FILTERS.ALL || activeFilter === FILTERS.INFLUENCE) && (
            <Line 
              type="monotone" 
              dataKey="influence" 
              stroke="#FF7675" 
              strokeWidth={2}
              name="Influence Changes" 
              activeDot={{ r: 6, fill: '#FF7675' }}
            />
          )}
        </LineChart>
      );
    } else {
      return (
        <AreaChart data={statisticsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fill: '#666' }} />
          <YAxis tick={{ fill: '#666' }} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          {(activeFilter === FILTERS.ALL || activeFilter === FILTERS.FUTURES) && (
            <Area 
              type="monotone" 
              dataKey="futures" 
              stroke="#6C5CE7" 
              fill="#6C5CE7" 
              fillOpacity={0.2}
              name="Futures Generated" 
            />
          )}
          {(activeFilter === FILTERS.ALL || activeFilter === FILTERS.HABITS) && (
            <Area 
              type="monotone" 
              dataKey="habits" 
              stroke="#00B894" 
              fill="#00B894" 
              fillOpacity={0.2}
              name="Habits Created" 
            />
          )}
          {(activeFilter === FILTERS.ALL || activeFilter === FILTERS.INFLUENCE) && (
            <Area 
              type="monotone" 
              dataKey="influence" 
              stroke="#FF7675" 
              fill="#FF7675" 
              fillOpacity={0.2}
              name="Influence Changes" 
            />
          )}
        </AreaChart>
      );
    }
  };

  return (
    <motion.div 
      className="statistics-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="statistics-header">
        <h2><FaChartLine className="header-icon" /> Your Progress Statistics</h2>
      </div>

      <div className="controls-container">
        <div className="filter-section">
          <div className="filter-label">
            <FaFilter /> Data Type
          </div>
          <Dropdown className="filter-dropdown">
            <Dropdown.Toggle variant="outline-primary">
              {getFilterLabel(activeFilter)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item active={activeFilter === FILTERS.ALL} onClick={() => handleFilterChange(FILTERS.ALL)}>
                All Data
              </Dropdown.Item>
              <Dropdown.Item active={activeFilter === FILTERS.FUTURES} onClick={() => handleFilterChange(FILTERS.FUTURES)}>
                Futures Generated
              </Dropdown.Item>
              <Dropdown.Item active={activeFilter === FILTERS.HABITS} onClick={() => handleFilterChange(FILTERS.HABITS)}>
                Habits Created
              </Dropdown.Item>
              <Dropdown.Item active={activeFilter === FILTERS.INFLUENCE} onClick={() => handleFilterChange(FILTERS.INFLUENCE)}>
                Influence Changes
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="timerange-section">
          <div className="filter-label">
            <FaCalendarAlt /> Time Range
          </div>
          <Dropdown className="filter-dropdown">
            <Dropdown.Toggle variant="outline-primary">
              {timeRange === TIME_RANGES.CUSTOM ? 'Custom Range' : 
               timeRange === TIME_RANGES.WEEK ? 'Last Week' :
               timeRange === TIME_RANGES.MONTH ? 'Last Month' :
               timeRange === TIME_RANGES.THREE_MONTHS ? 'Last 3 Months' : 'Last Year'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item active={timeRange === TIME_RANGES.WEEK} onClick={() => handleTimeRangeChange(TIME_RANGES.WEEK)}>
                Last Week
              </Dropdown.Item>
              <Dropdown.Item active={timeRange === TIME_RANGES.MONTH} onClick={() => handleTimeRangeChange(TIME_RANGES.MONTH)}>
                Last Month
              </Dropdown.Item>
              <Dropdown.Item active={timeRange === TIME_RANGES.THREE_MONTHS} onClick={() => handleTimeRangeChange(TIME_RANGES.THREE_MONTHS)}>
                Last 3 Months
              </Dropdown.Item>
              <Dropdown.Item active={timeRange === TIME_RANGES.YEAR} onClick={() => handleTimeRangeChange(TIME_RANGES.YEAR)}>
                Last Year
              </Dropdown.Item>
              <Dropdown.Item active={timeRange === TIME_RANGES.CUSTOM} onClick={() => handleTimeRangeChange(TIME_RANGES.CUSTOM)}>
                Custom Range
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="chart-type-section">
          <div className="filter-label">
            Chart Type
          </div>
          <Form.Check
            type="switch"
            id="chart-type-switch"
            label={chartType === 'line' ? 'Line Chart' : 'Area Chart'}
            checked={chartType === 'area'}
            onChange={() => setChartType(chartType === 'line' ? 'area' : 'line')}
          />
        </div>
      </div>

      {showCustomRange && (
        <motion.div 
          className="date-range-container"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="date-pickers">
            <div className="date-picker-wrapper">
              <label>Start Date</label>              <DatePicker
                selected={startDate}
                onChange={date => date && setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                className="form-control"
              />
            </div>
            <div className="date-picker-wrapper">
              <label>End Date</label>              <DatePicker
                selected={endDate}
                onChange={date => date && setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                className="form-control"
              />
            </div>
          </div>
          <Button variant="primary" onClick={applyCustomDateRange}>
            Apply Date Range
          </Button>
        </motion.div>
      )}

      <motion.div 
        className="chart-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading statistics...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <Button variant="primary" onClick={() => fetchStatistics(activeFilter)}>
              Retry
            </Button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </motion.div>

      <motion.div 
        className="summary-blocks"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.div 
          className="summary-block"
          whileHover={{ y: -5, boxShadow: '0 8px 15px rgba(108, 92, 231, 0.2)' }}
        >
          <div className="summary-icon" style={{ backgroundColor: 'rgba(108, 92, 231, 0.1)' }}>
            <FaStar style={{ color: '#6C5CE7' }} />
          </div>
          <h3>Futures Generated</h3>
          <p className="summary-value">{summaryData.totalFutures}</p>
          <p className="summary-label">Total creations</p>
        </motion.div>
        
        <motion.div 
          className="summary-block"
          whileHover={{ y: -5, boxShadow: '0 8px 15px rgba(0, 184, 148, 0.2)' }}
        >
          <div className="summary-icon" style={{ backgroundColor: 'rgba(0, 184, 148, 0.1)' }}>
            <FaStar style={{ color: '#00B894' }} />
          </div>
          <h3>Habits Created</h3>
          <p className="summary-value">{summaryData.totalHabits}</p>
          <p className="summary-label">New habits added</p>
        </motion.div>
        
        <motion.div 
          className="summary-block"
          whileHover={{ y: -5, boxShadow: '0 8px 15px rgba(255, 118, 117, 0.2)' }}
        >
          <div className="summary-icon" style={{ backgroundColor: 'rgba(255, 118, 117, 0.1)' }}>
            <FaStar style={{ color: '#FF7675' }} />
          </div>
          <h3>Influence Changes</h3>
          <p className="summary-value">{summaryData.totalInfluence}</p>
          <p className="summary-label">Total updates</p>
        </motion.div>
        
        <motion.div 
          className="summary-block"
          whileHover={{ y: -5, boxShadow: '0 8px 15px rgba(83, 82, 237, 0.2)' }}
        >
          <div className="summary-icon" style={{ backgroundColor: 'rgba(83, 82, 237, 0.1)' }}>
            <FaStar style={{ color: '#5352ED' }} />
          </div>
          <h3>Average Influence</h3>
          <p className="summary-value">{summaryData.averageInfluence.toFixed(2)}</p>
          <p className="summary-label">Per habit</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Statistics;