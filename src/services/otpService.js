/**
 * OTP Service using EmailJS
 * Handles OTP generation and sending via EmailJS API
 */

import logger from '../utils/logger';

const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';
const EMAILJS_SERVICE_ID = 'service_vkf7xvp';
const EMAILJS_TEMPLATE_ID = 'template_38yu1rk';
const EMAILJS_USER_ID = 'mR0yvpHHY7lPhkQ9o';
const OTP_EXPIRY_MINUTES = 10;

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP in localStorage with expiry time
 * @param {string} email - User's email
 * @param {string} otp - OTP code
 */
export const storeOTP = (email, otp) => {
  const expiryTime = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
  const otpData = {
    email: email.toLowerCase(),
    otp: otp,
    expiryTime: expiryTime,
    attempts: 0,
    maxAttempts: 5
  };
  localStorage.setItem(`otp_${email.toLowerCase()}`, JSON.stringify(otpData));
};

/**
 * Get stored OTP for email
 * @param {string} email - User's email
 * @returns {Object|null} OTP data or null if not found/expired
 */
export const getStoredOTP = (email) => {
  try {
    const stored = localStorage.getItem(`otp_${email.toLowerCase()}`);
    if (!stored) return null;
    
    const otpData = JSON.parse(stored);
    
    // Check if expired
    if (Date.now() > otpData.expiryTime) {
      localStorage.removeItem(`otp_${email.toLowerCase()}`);
      return null;
    }
    
    // Check if max attempts exceeded
    if (otpData.attempts >= otpData.maxAttempts) {
      localStorage.removeItem(`otp_${email.toLowerCase()}`);
      return null;
    }
    
    return otpData;
  } catch (error) {
    logger.error('Error getting stored OTP:', error);
    return null;
  }
};

/**
 * Verify OTP
 * @param {string} email - User's email
 * @param {string} inputOTP - OTP entered by user
 * @returns {Object} { valid: boolean, message: string }
 */
export const verifyOTP = (email, inputOTP) => {
  const otpData = getStoredOTP(email);
  
  if (!otpData) {
    return {
      valid: false,
      message: 'OTP has expired or is invalid. Please request a new one.'
    };
  }
  
  // Increment attempts
  otpData.attempts += 1;
  localStorage.setItem(`otp_${email.toLowerCase()}`, JSON.stringify(otpData));
  
  if (otpData.attempts >= otpData.maxAttempts) {
    localStorage.removeItem(`otp_${email.toLowerCase()}`);
    return {
      valid: false,
      message: 'Maximum verification attempts exceeded. Please request a new OTP.'
    };
  }
  
  if (otpData.otp !== inputOTP) {
    const remainingAttempts = otpData.maxAttempts - otpData.attempts;
    return {
      valid: false,
      message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
    };
  }
  
  // OTP is valid - remove it
  localStorage.removeItem(`otp_${email.toLowerCase()}`);
  return {
    valid: true,
    message: 'OTP verified successfully!'
  };
};

/**
 * Send OTP via EmailJS
 * @param {string} email - Recipient email
 * @param {string} userName - User's name
 * @param {string} otp - OTP code to send
 * @returns {Promise<Object>} Success/error response
 */
export const sendOTPEmail = async (email, userName, otp) => {
  try {
    // Validate email format
    if (!email || !email.trim()) {
      throw new Error('Email address is required');
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // EmailJS requires the recipient email in template_params
    // The parameter name depends on how your EmailJS template is configured
    // Common names: to_email, user_email, email, reply_to, recipient_email
    const templateParams = {
      user_name: userName || 'User',
      otp_code: otp,
      expiry_minutes: OTP_EXPIRY_MINUTES.toString(),
      to_email: trimmedEmail, // Most common parameter name for recipient
      user_email: trimmedEmail, // Alternative parameter name
      email: trimmedEmail, // Another common parameter name
      reply_to: trimmedEmail // Sometimes used for recipient
    };

    const data = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_USER_ID,
      template_params: templateParams
    };

    logger.info('Sending OTP email via EmailJS:', { 
      email: email.substring(0, 3) + '***', 
      hasEmail: !!trimmedEmail,
      templateParamsKeys: Object.keys(templateParams)
    });

    const response = await fetch(EMAILJS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    logger.info('EmailJS response status:', response.status);

    const responseText = await response.text();
    logger.info('EmailJS response:', { status: response.status, text: responseText });

    // EmailJS returns 200 OK with "OK" text on success
    // Also check if response text contains "OK" or is empty (both indicate success)
    if (response.ok && (response.status === 200 || responseText === 'OK' || responseText.trim() === '')) {
      // Store OTP for verification
      storeOTP(email, otp);
      logger.info('OTP stored successfully for:', email);
      return {
        success: true,
        message: 'OTP sent successfully! Please check your email.'
      };
    } else {
      // Try to parse error message
      let errorMessage = 'Failed to send OTP email';
      try {
        if (responseText) {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch {
        // If not JSON, use the text as error message
        if (responseText && responseText.trim() !== '') {
          errorMessage = responseText;
        }
      }
      
      // Check for specific EmailJS errors
      if (errorMessage.toLowerCase().includes('recipients address is empty') || 
          errorMessage.toLowerCase().includes('recipient') && errorMessage.toLowerCase().includes('empty')) {
        errorMessage = 'EmailJS Configuration Error: Please configure the "To Email" field in your EmailJS template to use {{to_email}} or {{user_email}}. See EMAILJS_SETUP.md for instructions.';
      }
      
      logger.error('EmailJS error:', { status: response.status, message: errorMessage, responseText });
      throw new Error(errorMessage);
    }
  } catch (error) {
    logger.error('Error sending OTP email:', error);
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Network error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      message: error.message || 'Failed to send OTP. Please try again.'
    };
  }
};

/**
 * Resend OTP
 * @param {string} email - User's email
 * @param {string} userName - User's name
 * @returns {Promise<Object>} Success/error response
 */
export const resendOTP = async (email, userName) => {
  // Generate new OTP
  const newOTP = generateOTP();
  
  // Send email
  return await sendOTPEmail(email, userName, newOTP);
};

/**
 * Clear stored OTP
 * @param {string} email - User's email
 */
export const clearOTP = (email) => {
  localStorage.removeItem(`otp_${email.toLowerCase()}`);
};

