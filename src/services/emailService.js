import logger from '../utils/logger';

/**
 * Email service using EmailJS
 * Sends emails directly from client-side using EmailJS API
 */

const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_vkf7xvp';
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID || 'mR0yvpHHY7lPhkQ9o';
const EMAILJS_EVENT_CREATED_TEMPLATE = import.meta.env.VITE_EMAILJS_EVENT_CREATED_TEMPLATE || 'template_event_created';
const EMAILJS_EVENT_REMINDER_TEMPLATE = import.meta.env.VITE_EMAILJS_EVENT_REMINDER_TEMPLATE || 'template_event_reminder';

/**
 * Check if email service is configured
 */
const isEmailConfigured = () => {
  return !!(EMAILJS_SERVICE_ID && EMAILJS_USER_ID);
};

/**
 * Send email via EmailJS
 */
const sendEmailViaEmailJS = async (templateId, templateParams) => {
  try {
    const response = await fetch(EMAILJS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_USER_ID,
        template_params: templateParams
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS API error: ${response.status} - ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    logger.error('Error sending email via EmailJS:', error);
    throw error;
  }
};

/**
 * Send email notification when event is created
 */
export const sendEventCreatedEmail = async (event, recipients, creatorName = 'A user') => {
  if (!recipients || recipients.length === 0) {
    return null;
  }

  if (!isEmailConfigured()) {
    logger.warn('EmailJS not configured, skipping email send');
    return null;
  }

  try {
    // Format event date and time
    const eventDate = event.date ? new Date(event.date).toLocaleDateString() : 'TBD';
    const eventTime = event.date && event.date.includes('T') 
      ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'All day';

    // Send email to each recipient
    const emailPromises = recipients.map(async (recipientEmail) => {
      const templateParams = {
        to_email: recipientEmail,
        user_email: recipientEmail,
        email: recipientEmail,
        reply_to: recipientEmail,
        event_title: event.title || 'Untitled Event',
        event_date: eventDate,
        event_time: eventTime,
        event_description: event.description || 'No description provided',
        creator_name: creatorName,
        event_location: event.location || 'Not specified'
      };

      return sendEmailViaEmailJS(EMAILJS_EVENT_CREATED_TEMPLATE, templateParams);
    });

    await Promise.all(emailPromises);
    return { success: true, sent: recipients.length };
  } catch (error) {
    logger.error('Error sending event created email:', error);
    throw error;
  }
};

/**
 * Send email notification when event is updated
 */
export const sendEventUpdatedEmail = async (event, recipients, updaterName = 'A user') => {
  if (!recipients || recipients.length === 0) {
    return null;
  }

  if (!isEmailConfigured()) {
    logger.warn('EmailJS not configured, skipping email send');
    return null;
  }

  try {
    // Format event date and time
    const eventDate = event.date ? new Date(event.date).toLocaleDateString() : 'TBD';
    const eventTime = event.date && event.date.includes('T') 
      ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'All day';

    // Send email to each recipient
    const emailPromises = recipients.map(async (recipientEmail) => {
      const templateParams = {
        to_email: recipientEmail,
        user_email: recipientEmail,
        email: recipientEmail,
        reply_to: recipientEmail,
        event_title: event.title || 'Untitled Event',
        event_date: eventDate,
        event_time: eventTime,
        event_description: event.description || 'No description provided',
        updater_name: updaterName,
        event_location: event.location || 'Not specified'
      };

      return sendEmailViaEmailJS(EMAILJS_EVENT_CREATED_TEMPLATE, templateParams);
    });

    await Promise.all(emailPromises);
    return { success: true, sent: recipients.length };
  } catch (error) {
    logger.error('Error sending event updated email:', error);
    throw error;
  }
};

/**
 * Send reminder email 5 minutes before event
 */
export const sendEventReminderEmail = async (event, recipients) => {
  if (!recipients || recipients.length === 0) {
    return null;
  }

  if (!isEmailConfigured()) {
    logger.warn('EmailJS not configured, skipping email send');
    return null;
  }

  try {
    // Format event date and time
    const eventDate = event.date ? new Date(event.date).toLocaleDateString() : 'TBD';
    const eventTime = event.date && event.date.includes('T') 
      ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'All day';

    // Send email to each recipient
    const emailPromises = recipients.map(async (recipientEmail) => {
      const templateParams = {
        to_email: recipientEmail,
        user_email: recipientEmail,
        email: recipientEmail,
        reply_to: recipientEmail,
        event_title: event.title || 'Untitled Event',
        event_date: eventDate,
        event_time: eventTime,
        event_description: event.description || 'No description provided',
        reminder_message: 'This is a reminder that your event starts in 5 minutes!',
        event_location: event.location || 'Not specified'
      };

      return sendEmailViaEmailJS(EMAILJS_EVENT_REMINDER_TEMPLATE, templateParams);
    });

    await Promise.all(emailPromises);
    return { success: true, sent: recipients.length };
  } catch (error) {
    logger.error('Error sending event reminder email:', error);
    throw error;
  }
};

/**
 * Send email notification when todo is created
 */
export const sendTodoCreatedEmail = async (todo, recipients, creatorName = 'A user') => {
  if (!recipients || recipients.length === 0) {
    return null;
  }

  if (!isEmailConfigured()) {
    logger.warn('EmailJS not configured, skipping email send');
    return null;
  }

  try {
    // Format todo date
    const todoDate = todo.date ? new Date(todo.date).toLocaleDateString() : 'TBD';

    // Send email to each recipient
    const emailPromises = recipients.map(async (recipientEmail) => {
      const templateParams = {
        to_email: recipientEmail,
        user_email: recipientEmail,
        email: recipientEmail,
        reply_to: recipientEmail,
        todo_title: todo.title || 'Untitled Todo',
        todo_date: todoDate,
        todo_description: todo.description || 'No description provided',
        creator_name: creatorName
      };

      return sendEmailViaEmailJS(EMAILJS_EVENT_CREATED_TEMPLATE, templateParams);
    });

    await Promise.all(emailPromises);
    return { success: true, sent: recipients.length };
  } catch (error) {
    logger.error('Error sending todo created email:', error);
    throw error;
  }
};

/**
 * Send email notification when user is added to a group
 */
export const sendGroupInvitationEmail = async (group, recipients, inviterName = 'A user') => {
  if (!recipients || recipients.length === 0) {
    return null;
  }

  if (!isEmailConfigured()) {
    logger.warn('EmailJS not configured, skipping email send');
    return null;
  }

  try {
    // Send email to each recipient
    const emailPromises = recipients.map(async (recipientEmail) => {
      const templateParams = {
        to_email: recipientEmail,
        user_email: recipientEmail,
        email: recipientEmail,
        reply_to: recipientEmail,
        group_name: group.name || 'Untitled Group',
        group_description: group.description || 'No description provided',
        inviter_name: inviterName
      };

      return sendEmailViaEmailJS(EMAILJS_EVENT_CREATED_TEMPLATE, templateParams);
    });

    await Promise.all(emailPromises);
    return { success: true, sent: recipients.length };
  } catch (error) {
    logger.error('Error sending group invitation email:', error);
    throw error;
  }
};

export default {
  sendEventCreatedEmail,
  sendEventUpdatedEmail,
  sendEventReminderEmail,
  sendTodoCreatedEmail,
  sendGroupInvitationEmail,
  isEmailConfigured
};
