import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Smart Redirect Component
 * Redirects users based on authentication status
 * - Authenticated users → Dashboard
 * - Unauthenticated users → Login
 */
const SmartRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            border: '6px solid #f3f3f3',
            borderTop: '6px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
      </div>
    );
  }

  // Redirect based on authentication status
  return isAuthenticated ? (
    <Navigate to='/dashboard' replace />
  ) : (
    <Navigate to='/login' replace />
  );
};

export default SmartRedirect;
