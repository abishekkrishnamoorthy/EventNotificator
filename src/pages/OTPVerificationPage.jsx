import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verifyOTP, resendOTP, getStoredOTP, clearOTP } from '../services/otpService';
import { api } from '../services/api';
import logger from '../utils/logger';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  
  // Get signup data from location state
  const signupData = location.state || {};
  const { email, password, displayName } = signupData;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Redirect if no signup data
    if (!email || !password) {
      navigate('/signup');
      return;
    }

    // Check if OTP exists and get expiry time
    const otpData = getStoredOTP(email);
    if (otpData) {
      const remaining = Math.max(0, Math.floor((otpData.expiryTime - Date.now()) / 1000));
      setTimeRemaining(remaining);
    } else {
      // No OTP found, redirect to signup
      navigate('/signup');
    }
  }, [email, password, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newOTP = pastedData.split('');
      setOtp(newOTP);
      setError('');
      // Focus last input
      document.getElementById('otp-5')?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // Verify OTP
      const verificationResult = verifyOTP(email, otpString);
      
      if (!verificationResult.valid) {
        setError(verificationResult.message);
        setLoading(false);
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
        return;
      }

      // OTP is valid, now create the account
      setSuccess('OTP verified! Creating your account...');
      
      try {
        // Sign up without Firebase email verification (OTP already verified the email)
        const user = await signup(email, password, displayName, true);
        clearOTP(email);
        
        // Mark email as verified in database (since OTP already verified it)
        if (user && user.uid) {
          try {
            await api.setUserEmailVerified(user.uid, true);
            logger.info('User email marked as verified via OTP');
          } catch (dbError) {
            logger.error('Error setting user verification status:', dbError);
            // Continue anyway - account is created
          }
        }
        
        // Navigate directly to dashboard - email is already verified via OTP
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } catch (signupError) {
        logger.error('Error creating account:', signupError);
        setError(signupError.message || 'Failed to create account. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');
    setCanResend(false);

    try {
      const result = await resendOTP(email, displayName || 'User');
      
      if (result.success) {
        setSuccess(result.message);
        // Reset timer
        const otpData = getStoredOTP(email);
        if (otpData) {
          const remaining = Math.max(0, Math.floor((otpData.expiryTime - Date.now()) / 1000));
          setTimeRemaining(remaining);
        }
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      } else {
        setError(result.message);
        setCanResend(true);
      }
    } catch (error) {
      logger.error('Error resending OTP:', error);
      setError('Failed to resend OTP. Please try again.');
      setCanResend(true);
    } finally {
      setResending(false);
    }
  };

  if (!email || !password) {
    return null; // Will redirect
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2><i className="fas fa-shield-alt"></i> Verify Your Email</h2>
          <p>We've sent a verification code to:</p>
          <p className="auth-email" style={{ fontWeight: '600', color: '#667eea', marginTop: '10px' }}>
            {email}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            <i className="fas fa-check-circle"></i>
            {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp" style={{ textAlign: 'center', display: 'block', marginBottom: '15px' }}>
              Enter the 6-digit code
            </label>
            <div className="otp-input-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="otp-input"
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {timeRemaining !== null && timeRemaining > 0 && (
            <div style={{
              textAlign: 'center',
              marginBottom: '20px',
              color: '#666',
              fontSize: '14px'
            }}>
              <i className="fas fa-clock"></i> Code expires in: {formatTime(timeRemaining)}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Verifying...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>
                Verify & Create Account
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666', marginBottom: '10px', fontSize: '14px' }}>
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !canResend}
            className="btn btn-outline"
            style={{
              width: '100%',
              opacity: (!canResend || resending) ? 0.6 : 1,
              cursor: (!canResend || resending) ? 'not-allowed' : 'pointer'
            }}
          >
            {resending ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Sending...
              </>
            ) : (
              <>
                <i className="fas fa-redo"></i>
                Resend Code
              </>
            )}
          </button>
        </div>

        <div className="auth-footer" style={{ marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => {
              clearOTP(email);
              navigate('/signup');
            }}
            className="btn btn-outline btn-block"
            disabled={loading}
            style={{ background: 'transparent', border: 'none', color: '#667eea', textDecoration: 'underline' }}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;

