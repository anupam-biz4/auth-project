import React, { useState, ChangeEvent, FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { validateEmail, validatePassword } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import { useAppDispatch } from '../../store/hooks';
import { setProfile } from '../../features/dashboard/dashboardSlice';

/**
 * Login Component
 * Handles user authentication and JWT token management
 */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  interface FormErrors {
    email?: string;
    password?: string;
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
   * Validate login form
   */
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
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
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      setMessage({ type: 'success', text: response.message });

      // Save token and user data
      login(response.data.token, response.data.user);

      // Update persisted dashboard profile immediately
      dispatch(setProfile(response.data.user));

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Login failed. Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <div className='auth-header'>
          <h2>Welcome Back</h2>
          <p>Login to your account</p>
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
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder='Enter your password'
            />
            {errors.password && (
              <span className='error-message'>{errors.password}</span>
            )}
          </div>

          <div style={{ textAlign: 'right', marginTop: '-10px' }}>
            <Link
              to='/forgot-password'
              style={{
                fontSize: '14px',
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              Forgot Password?
            </Link>
          </div>

          <button type='submit' className='btn-primary' disabled={loading}>
            {loading && <span className='loading-spinner'></span>}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className='auth-footer'>
          Don&apos;t have an account?
          <Link to='/signup'>Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
