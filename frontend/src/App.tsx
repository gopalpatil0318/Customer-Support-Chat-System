import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import CustomerLogin from './pages/CustomerLogin';
import CustomerSignUp from './pages/CustomerSignUp';
import AgentLogin from './pages/AgentLogin';
import AgentSignUp from './pages/AgentSignUp';
import AdminLogin from './pages/AdminLogin';
import AdminSignUp from './pages/AdminSignUp';
import CustomerDashboard from './pages/CustomerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
    
        <Route path="/" element={<LandingPage />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/signup" element={<CustomerSignUp />} />
        <Route path="/agent/login" element={<AgentLogin />} />
        <Route path="/agent/signup" element={<AgentSignUp />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignUp />} />

        {/* Private Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <PrivateRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/agent/dashboard"
          element={
            <PrivateRoute allowedRoles={['agent']}>
              <AgentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
