export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function isDateToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate multiple email addresses (comma-separated)
 * @param {string} emails - Comma-separated email addresses
 * @returns {Object} - { valid: boolean, emails: string[], invalid: string[] }
 */
export function validateEmails(emails) {
  if (!emails || typeof emails !== 'string') {
    return { valid: false, emails: [], invalid: [] };
  }
  
  const emailList = emails
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
  
  const validEmails = [];
  const invalidEmails = [];
  
  emailList.forEach(email => {
    if (isValidEmail(email)) {
      validEmails.push(email);
    } else {
      invalidEmails.push(email);
    }
  });
  
  return {
    valid: invalidEmails.length === 0 && validEmails.length > 0,
    emails: validEmails,
    invalid: invalidEmails
  };
}

