import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchProfile,
  clearProfile,
} from '../../features/dashboard/dashboardSlice';
import { RootState } from '../../store/store';

/**
 * Dashboard Component
 * Protected route - displays user profile
 * Example of JWT authentication in action
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state: RootState) => state.dashboard.profile);
  const status = useAppSelector((state: RootState) => state.dashboard.status);

  // Using user data directly from AuthContext - no need for additional API calls
  // Now also leveraging Redux persisted profile for dashboard

  useEffect(() => {
    if (!profile && status === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile, status]);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    dispatch(clearProfile());
    logout();
    navigate('/login');
  };

  return (
    <div className='dashboard-container'>
      <nav className='dashboard-nav'>
        <div className='nav-brand'>
          <h2>Auth System</h2>
        </div>
        <button onClick={handleLogout} className='btn-logout'>
          Logout
        </button>
      </nav>

      <div className='dashboard-content'>
        <div className='welcome-section'>
          <h1>Welcome, {(profile?.name ?? user?.name) as string}! 🎉</h1>
          <p>
            You have successfully logged in and your session is protected by
            JWT.
          </p>
        </div>

        <div className='profile-card'>
          <h3>Your Profile</h3>
          <div className='profile-info'>
            <div className='info-row'>
              <span className='info-label'>Name:</span>
              <span className='info-value'>
                {(profile?.name ?? user?.name) as string}
              </span>
            </div>
            <div className='info-row'>
              <span className='info-label'>Email:</span>
              <span className='info-value'>
                {(profile?.email ?? user?.email) as string}
              </span>
            </div>
            <div className='info-row'>
              <span className='info-label'>Status:</span>
              <span className='info-value'>
                <span className='status-badge verified'>
                  {(profile?.isVerified ?? user?.isVerified)
                    ? '✓ Verified'
                    : '⚠️ Unverified'}
                </span>
              </span>
            </div>
            <div className='info-row'>
              <span className='info-label'>User ID:</span>
              <span className='info-value'>
                {(profile?.id ?? user?.id) as string}
              </span>
            </div>
          </div>
        </div>

        <div className='features-section'>
          <h3>Features Implemented</h3>
          <div className='features-grid'>
            <div className='feature-item'>
              <div className='feature-icon'>✉️</div>
              <h4>OTP Verification</h4>
              <p>Email-based OTP for signup and password reset</p>
            </div>
            <div className='feature-item'>
              <div className='feature-icon'>🔐</div>
              <h4>JWT Authentication</h4>
              <p>Secure token-based session management</p>
            </div>
            <div className='feature-item'>
              <div className='feature-icon'>🔑</div>
              <h4>Password Reset</h4>
              <p>Secure password reset with OTP verification</p>
            </div>
            <div className='feature-item'>
              <div className='feature-icon'>🛡️</div>
              <h4>Protected Routes</h4>
              <p>Middleware-protected API endpoints</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
