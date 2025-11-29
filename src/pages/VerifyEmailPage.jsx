import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmailPage = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, resendEmailVerification } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.emailVerified) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resendEmailVerification();
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = () => {
    if (currentUser && currentUser.emailVerified) {
      navigate('/');
    } else {
      setError('Email not verified yet. Please check your email and click the verification link.');
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2><i className="fas fa-envelope"></i> Verify Your Email</h2>
          <p>We've sent a verification email to:</p>
          <p className="auth-email">{currentUser.email}</p>
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

        <div className="auth-message">
          <i className="fas fa-info-circle"></i>
          Please check your email inbox and click the verification link to activate your account.
          <br /><br />
          After verifying, click the button below to continue.
        </div>

        <button
          onClick={handleCheckVerification}
          className="btn btn-primary btn-block"
        >
          <i className="fas fa-check-circle"></i>
          I've Verified My Email
        </button>

        <button
          onClick={handleResend}
          className="btn btn-outline btn-block"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Sending...
            </>
          ) : (
            <>
              <i className="fas fa-redo"></i>
              Resend Verification Email
            </>
          )}
        </button>

        <div className="auth-footer">
          <button
            onClick={() => navigate('/login')}
            className="btn-link"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

