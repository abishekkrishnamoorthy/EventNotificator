import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendOTPEmail, generateOTP } from '../services/otpService';
import logger from '../utils/logger';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && currentUser.emailVerified) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!email || !email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);

    try {
      // Generate and send OTP
      const otp = generateOTP();
      logger.info('Generated OTP, sending email...', { email: email.substring(0, 3) + '***' });
      
      const result = await sendOTPEmail(email.trim(), displayName || 'User', otp);
      
      logger.info('OTP send result:', { success: result.success });
      
      if (result && result.success) {
        // Small delay to ensure OTP is stored
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate to OTP verification page with signup data
        navigate('/otp-verification', {
          replace: true,
          state: {
            email: email.trim(),
            password,
            displayName: displayName || ''
          }
        });
        // Don't set loading to false here as we're navigating away
      } else {
        const errorMsg = result?.message || 'Failed to send verification code';
        logger.error('OTP send failed:', errorMsg);
        setError(errorMsg);
        setLoading(false);
      }
    } catch (err) {
      logger.error('Error in signup process:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign up with Google');
      setLoading(false);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2><i className="fas fa-user-plus"></i> Sign Up</h2>
          <p>Create a new account to get started.</p>
        </div>

        {error && (
          <div className="auth-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="displayName">Name (Optional)</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password (min 6 characters)"
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Creating account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          onClick={handleGoogleSignup}
          className="btn btn-outline btn-block"
          disabled={loading}
        >
          <i className="fab fa-google"></i>
          Continue with Google
        </button>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

