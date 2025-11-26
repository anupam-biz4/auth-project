import React, { useState, ChangeEvent, FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { validateEmail } from '../../utils/validation';
import './Auth.css';

/**
 * Forgot Password Component
 * Sends OTP to user's email for password reset
 */
const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  interface FormErrors {
    email?: string;
  }

  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [otpSent, setOtpSent] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return false;
    }
    return true;
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
      const response = await authAPI.forgotPassword({ email });

      setMessage({ type: 'success', text: response.message });
      setOtpSent(true);

      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Failed to send OTP. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <div className='auth-header'>
          <h2>Forgot Password</h2>
          <p>Enter your email to receive an OTP</p>
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
              value={email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder='john@example.com'
              disabled={otpSent}
            />
            {errors.email && (
              <span className='error-message'>{errors.email}</span>
            )}
          </div>

          <button
            type='submit'
            className='btn-primary'
            disabled={loading || otpSent}
          >
            {loading && <span className='loading-spinner'></span>}
            {loading ? 'Sending OTP...' : otpSent ? 'OTP Sent!' : 'Send OTP'}
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

        <div className='auth-footer'>
          Remember your password?
          <Link to='/login'>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
