import React, { useState, ChangeEvent, FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateOTP,
} from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import { useAppDispatch } from '../../store/hooks';
import { setProfile } from '../../features/dashboard/dashboardSlice';

/**
 * Signup Component
 * Handles user registration with OTP verification
 */
const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const dispatch = useAppDispatch();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: signup form, 2: OTP verification
  const [loading, setLoading] = useState(false);
  interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
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
   * Validate signup form
   */
  const validateSignupForm = () => {
    const newErrors: FormErrors = {};

    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message;
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle signup form submission
   */
  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateSignupForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setMessage({ type: 'success', text: response.message });
      setStep(2); // Move to OTP verification step
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Signup failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OTP verification
   */
  const handleVerifyOTP = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateOTP(otp)) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifySignupOTP({
        email: formData.email,
        otp: otp,
      });

      setMessage({ type: 'success', text: response.message });

      // Login user automatically after verification
      login(response.data.token, response.data.user);

      // Update persisted dashboard profile immediately
      dispatch(setProfile(response.data.user));

      // Redirect to dashboard or home
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'OTP verification failed',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOTP = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
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
          <h2>{step === 1 ? 'Create Account' : 'Verify Email'}</h2>
          <p>
            {step === 1
              ? 'Sign up to get started'
              : `Enter the OTP sent to ${formData.email}`}
          </p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSignup} className='auth-form'>
            <div className='form-group'>
              <label htmlFor='name'>Full Name</label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder='John Doe'
              />
              {errors.name && (
                <span className='error-message'>{errors.name}</span>
              )}
            </div>

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
              <label htmlFor='password'>Password</label>
              <input
                type='password'
                id='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder='At least 6 characters'
              />
              {errors.password && (
                <span className='error-message'>{errors.password}</span>
              )}
            </div>

            <div className='form-group'>
              <label htmlFor='confirmPassword'>Confirm Password</label>
              <input
                type='password'
                id='confirmPassword'
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder='Re-enter password'
              />
              {errors.confirmPassword && (
                <span className='error-message'>{errors.confirmPassword}</span>
              )}
            </div>

            <button type='submit' className='btn-primary' disabled={loading}>
              {loading && <span className='loading-spinner'></span>}
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className='auth-form'>
            <div className='form-group'>
              <label htmlFor='otp'>Enter OTP</label>
              <input
                type='text'
                id='otp'
                value={otp}
                onChange={e =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className='form-input'
                placeholder='123456'
                maxLength={6}
                style={{
                  textAlign: 'center',
                  fontSize: '20px',
                  letterSpacing: '8px',
                }}
              />
            </div>

            <button type='submit' className='btn-primary' disabled={loading}>
              {loading && <span className='loading-spinner'></span>}
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type='button'
              className='btn-secondary'
              onClick={handleResendOTP}
              disabled={loading}
            >
              Resend OTP
            </button>
          </form>
        )}

        <div className='auth-footer'>
          Already have an account?
          <Link to='/login'>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
