/**
 * Input sanitization utilities
 * Removes potentially dangerous characters and limits input length
 */

/**
 * Sanitize text input - removes HTML tags and limits length
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum length (default: 1000)
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text, maxLength = 1000) {
  if (!text || typeof text !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize title - removes HTML and limits to 200 characters
 * @param {string} title - Title to sanitize
 * @returns {string} - Sanitized title
 */
export function sanitizeTitle(title) {
  return sanitizeText(title, 200);
}

/**
 * Sanitize description - removes HTML and limits to 5000 characters
 * @param {string} description - Description to sanitize
 * @returns {string} - Sanitized description
 */
export function sanitizeDescription(description) {
  return sanitizeText(description, 5000);
}

/**
 * Sanitize chat message - removes HTML and limits to 1000 characters
 * @param {string} message - Message to sanitize
 * @returns {string} - Sanitized message
 */
export function sanitizeMessage(message) {
  return sanitizeText(message, 1000);
}

/**
 * Sanitize group name - removes HTML and limits to 100 characters
 * @param {string} name - Group name to sanitize
 * @returns {string} - Sanitized name
 */
export function sanitizeGroupName(name) {
  return sanitizeText(name, 100);
}

/**
 * Sanitize email - basic validation and trimming
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

