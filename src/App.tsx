import React, { ReactElement } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import SmartRedirect from './components/SmartRedirect';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

/**
 * Main App Component
 * Configures routing and authentication
 */
function App(): ReactElement {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Root redirect - smart redirect based on auth status */}
          <Route path='/' element={<SmartRedirect />} />

          {/* Guest Routes - Only accessible when NOT logged in */}
          <Route
            path='/signup'
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />
          <Route
            path='/login'
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path='/forgot-password'
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path='/reset-password'
            element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
