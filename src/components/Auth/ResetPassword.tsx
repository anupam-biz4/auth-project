import React, { useState, ChangeEvent, FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { validateOTP, validatePassword } from '../../utils/validation';
import './Auth.css';

/**
 * Reset Password Component
 * Verifies OTP and allows user to set new password
 */
const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: emailFromState,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  interface FormErrors {
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }

  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (name in errors) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    }

    if (!validateOTP(formData.otp)) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      newErrors.newPassword = passwordValidation.message;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      setMessage({ type: 'success', text: response.message });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Password reset failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOTP = async () => {
    if (!formData.email) {
      setMessage({ type: 'error', text: 'Please enter your email' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.forgotPassword({ email: formData.email });
      setMessage({ type: 'success', text: 'OTP resent successfully!' });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to resend OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <div className='auth-header'>
          <h2>Reset Password</h2>
          <p>Enter OTP and set your new password</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className='auth-form'>
          <div className='form-group'>
            <label htmlFor='email'>Email Address</label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder='john@example.com'
            />
            {errors.email && (
              <span className='error-message'>{errors.email}</span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='otp'>OTP</label>
            <input
              type='text'
              id='otp'
              name='otp'
              value={formData.otp}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setFormData(prev => ({ ...prev, otp: value }));
              }}
              className={`form-input ${errors.otp ? 'error' : ''}`}
              placeholder='123456'
              maxLength={6}
              style={{
                textAlign: 'center',
                fontSize: '20px',
                letterSpacing: '8px',
              }}
            />
            {errors.otp && <span className='error-message'>{errors.otp}</span>}
            <button
              type='button'
              onClick={handleResendOTP}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '5px',
                textDecoration: 'underline',
              }}
            >
              Resend OTP
            </button>
          </div>

          <div className='form-group'>
            <label htmlFor='newPassword'>New Password</label>
            <input
              type='password'
              id='newPassword'
              name='newPassword'
              value={formData.newPassword}
              onChange={handleChange}
              className={`form-input ${errors.newPassword ? 'error' : ''}`}
              placeholder='At least 6 characters'
            />
            {errors.newPassword && (
              <span className='error-message'>{errors.newPassword}</span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='confirmPassword'>Confirm New Password</label>
            <input
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder='Re-enter new password'
            />
            {errors.confirmPassword && (
              <span className='error-message'>{errors.confirmPassword}</span>
            )}
          </div>

          <button type='submit' className='btn-primary' disabled={loading}>
            {loading && <span className='loading-spinner'></span>}
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <button
            type='button'
            className='btn-secondary'
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
