// src/context/DataContext.jsx
import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useAuth(); // We keep this to know IF we should fetch, but the route itself is open.
  
  const [summaryStats, setSummaryStats] = useState({
    totalLeads: 0,
    opportunities: 0,
    lost: 0,
    totalCustomers: 0,
    revenue: 0
  });

  const [loading, setLoading] = useState(false);

  const fetchDashboardStats = useCallback(async () => {
    // If you are logged in, we fetch. 
    // Even if you removed auth check on backend, it's good practice to only fetch when app is ready.
    if (!user) return; 

    setLoading(true);
    try {
      // ---> CHANGED TO NEW ROUTE
      const response = await api.get('/analytics'); 
      console.log("Frontend received stats:", response.data); // Check your browser console!
      setSummaryStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <DataContext.Provider value={{ summaryStats, fetchDashboardStats, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  return useContext(DataContext);
};