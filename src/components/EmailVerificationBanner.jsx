import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Link } from 'react-router-dom';

const EmailVerificationBanner = () => {
  const { currentUser, resendEmailVerification } = useAuth();
  const { isEmailVerified } = useApp();
  const [resending, setResending] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState(false);

  // Don't show banner if email is verified (via Firebase or OTP)
  if (!currentUser || isEmailVerified) {
    return null;
  }

  const handleResend = async () => {
    setResending(true);
    try {
      await resendEmailVerification();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      // Error handled by context
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="email-verification-banner" style={{
      backgroundColor: '#fff3cd',
      border: '1px solid #ffc107',
      padding: '1rem',
      margin: '1rem',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <i className="fas fa-exclamation-triangle" style={{ color: '#856404' }}></i>
        <span style={{ color: '#856404' }}>
          Your email address is not verified. Please verify your email to access all features.
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Link to="/verify-email" style={{ color: '#856404', textDecoration: 'underline' }}>
          Verify Email
        </Link>
        <span>|</span>
        <button
          onClick={handleResend}
          disabled={resending || resendSuccess}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#856404',
            textDecoration: 'underline',
            cursor: resending || resendSuccess ? 'not-allowed' : 'pointer'
          }}
        >
          {resending ? 'Sending...' : resendSuccess ? 'Sent!' : 'Resend'}
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;

