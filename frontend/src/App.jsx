import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/common/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { DataProvider } from './context/DataContext';
import DashboardPage from './pages/DashboardPage';
import CustomerDetailPage from './pages/CustomerDetailPage';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />
            </Route>
            
            <Route path="/" element={<LoginPage />} />
          </Routes>
         
        </main>
      </Router>
       </DataProvider>
    </AuthProvider>
  );
}

export default App;