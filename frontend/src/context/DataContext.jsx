import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {

  // ✅ Get auth object from AuthContext
  const { auth } = useAuth();
  const user = auth?.user;   // <-- the actual logged-in user

  // Dashboard stats state
  const [summaryStats, setSummaryStats] = useState({
    totalLeads: 0,
    opportunities: 0,
    lost: 0,
    totalCustomers: 0,
    revenue: 0
  });

  const [loading, setLoading] = useState(false);

  // Fetch stats from backend
  const fetchDashboardStats = useCallback(async () => {
    if (!user) {
      console.log("⛔ No user in DataContext yet. Not fetching stats.");
      return;
    }

    setLoading(true);
    try {
      console.log("📡 Fetching /leads/stats ...");

      const response = await api.get('/leads/stats');

      console.log("✅ Stats received:", response.data);

      setSummaryStats(response.data);

    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-load stats when user logs in
  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user, fetchDashboardStats]);

  return (
    <DataContext.Provider value={{ summaryStats, fetchDashboardStats, loading }}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook
export const useData = () => useContext(DataContext);

export default DataContext;
