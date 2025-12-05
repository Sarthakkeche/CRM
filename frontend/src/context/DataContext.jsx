import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import api from '../api/axios'; // Uses your existing axios setup
import { useAuth } from './AuthContext'; // We only fetch data if user is logged in

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  
  // This state holds the numbers for your Home Page
  const [summaryStats, setSummaryStats] = useState({
    totalLeads: 0,
    opportunities: 0,
    totalCustomers: 0
  });

  const [loading, setLoading] = useState(false);

  // Function to fetch the latest numbers from the backend
  const fetchDashboardStats = useCallback(async () => {
    if (!user) return; // Don't fetch if no one is logged in

    setLoading(true);
    try {
      // We will call a new endpoint that aggregates data from Leads and Customers
      const response = await api.get('/leads/stats'); 
      setSummaryStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Automatically fetch stats when the provider loads (app starts)
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <DataContext.Provider value={{ summaryStats, fetchDashboardStats, loading }}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use this context easily
export const useData = () => {
  return useContext(DataContext);
};