import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import AppNavbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Patients from './pages/Patients';
import PreventiveCarePage from './pages/PreventiveCare';
import Profile from './pages/Profile';

import { useAppSelector } from './hooks/redux';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user) {
    const hasPermission = allowedRoles.includes(user.role);
    if (!hasPermission) {
      return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};

const AuthRedirect: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

const LoginRoute: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Login />;
};

const RegisterRoute: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Register />;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <AppNavbar />
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
          
          <Route path="/login" element={<LoginRoute />} />
          
          <Route path="/register" element={<RegisterRoute />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/goals" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Goals />
            </ProtectedRoute>
          } />
          
          <Route path="/preventive-care" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PreventiveCarePage />
            </ProtectedRoute>
          } />
          
          <Route path="/patients" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <Patients />
            </ProtectedRoute>
          } />
          
          <Route path="/assign-goals" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <Patients />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;