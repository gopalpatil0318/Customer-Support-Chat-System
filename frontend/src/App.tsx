import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/customer/login" element={<PublicRoute><CustomerLogin /></PublicRoute>} />
          <Route path="/customer/signup" element={<PublicRoute><CustomerSignUp /></PublicRoute>} />
          <Route path="/agent/login" element={<PublicRoute><AgentLogin /></PublicRoute>} />
          <Route path="/agent/signup" element={<PublicRoute><AgentSignUp /></PublicRoute>} />
          <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
          <Route path="/admin/signup" element={<PublicRoute><AdminSignUp /></PublicRoute>} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

