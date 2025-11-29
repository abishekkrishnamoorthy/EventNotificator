const nodemailer = require('nodemailer');
const functions = require('firebase-functions');
const {
  getEventCreatedTemplate,
  getEventUpdatedTemplate,
  getTodoCreatedTemplate,
  getGroupInvitationTemplate
} = require('./emailTemplates');

// Get config value with fallback to environment variable
const getConfig = (key, defaultValue = '') => {
  try {
    // Try Firebase Functions config first (for production)
    const config = functions.config();
    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
      value = value?.[k];
    }
    if (value) return value;
  } catch (e) {
    // Config not available, use environment variable
  }
  // Fallback to environment variable (for local development)
  return process.env[key.toUpperCase().replace(/\./g, '_')] || defaultValue;
};

// Configure SMTP transporter
const createTransporter = () => {
  const smtpConfig = {
    host: getConfig('smtp.host', 'smtp.gmail.com'),
    port: parseInt(getConfig('smtp.port', '587')),
    secure: getConfig('smtp.port', '587') === '465', // true for 465, false for other ports
    auth: {
      user: getConfig('smtp.user', ''),
      pass: getConfig('smtp.pass', '')
    }
  };

  return nodemailer.createTransport(smtpConfig);
};

// Default sender configuration
const getSender = () => ({
  email: getConfig('sender.email', 'noreply@eventnotificator.com'),
  name: getConfig('sender.name', 'EventNotificator')
});

/**
 * Generic email sender function
 */
const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    const transporter = createTransporter();
    const sender = getSender();

    // Validate configuration
    const smtpUser = getConfig('smtp.user', '');
    const smtpPass = getConfig('smtp.pass', '');
    if (!smtpUser || !smtpPass) {
      throw new Error('SMTP credentials not configured. Please set SMTP credentials in Firebase Functions config or environment variables.');
    }

    // Format recipients
    const recipients = Array.isArray(to) ? to : [to];

    // Validate recipients
    if (!recipients || recipients.length === 0) {
      throw new Error('No recipients specified');
    }

    // Mail options
    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: recipients.join(', '),
      subject: subject,
      html: htmlContent
    };

    if (textContent) {
      mailOptions.text = textContent;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send event created email
 */
const sendEventCreatedEmail = async (data) => {
  const { event, recipients, creatorName } = data;
  
  const htmlContent = getEventCreatedTemplate(event, creatorName);
  const textContent = `
New Event Created

${creatorName} has created a new event and assigned it to you.

Event: ${event.title || 'Untitled Event'}
Date: ${new Date(event.date).toLocaleDateString()}
${event.time ? `Time: ${event.time}` : ''}
${event.description ? `Description: ${event.description}` : ''}

Please mark your calendar and don't forget to attend!
  `.trim();

  return await sendEmail(
    recipients,
    `New Event: ${event.title || 'Untitled Event'}`,
    htmlContent,
    textContent
  );
};

/**
 * Send event updated email
 */
const sendEventUpdatedEmail = async (data) => {
  const { event, recipients, updaterName } = data;
  
  const htmlContent = getEventUpdatedTemplate(event, updaterName);
  const textContent = `
Event Updated

${updaterName} has updated an event that you're assigned to.

Event: ${event.title || 'Untitled Event'}
Date: ${new Date(event.date).toLocaleDateString()}
${event.time ? `Time: ${event.time}` : ''}
${event.description ? `Description: ${event.description}` : ''}

Please review the updated details and mark your calendar accordingly.
  `.trim();

  return await sendEmail(
    recipients,
    `Event Updated: ${event.title || 'Untitled Event'}`,
    htmlContent,
    textContent
  );
};

/**
 * Send todo created email
 */
const sendTodoCreatedEmail = async (data) => {
  const { todo, recipients, creatorName } = data;
  
  const htmlContent = getTodoCreatedTemplate(todo, creatorName);
  const textContent = `
New Todo Assigned

${creatorName} has created a new todo and assigned it to you.

Todo: ${todo.title || 'Untitled Todo'}
Due Date: ${new Date(todo.date).toLocaleDateString()}
${todo.description ? `Description: ${todo.description}` : ''}

Please complete this task by the due date!
  `.trim();

  return await sendEmail(
    recipients,
    `New Todo: ${todo.title || 'Untitled Todo'}`,
    htmlContent,
    textContent
  );
};

/**
 * Send group invitation email
 */
const sendGroupInvitationEmail = async (data) => {
  const { group, recipients, inviterName } = data;
  
  const htmlContent = getGroupInvitationTemplate(group, inviterName);
  const textContent = `
Group Invitation

${inviterName} has added you to a group: ${group.name || 'New Group'}

${group.description ? `Description: ${group.description}` : ''}
${group.members && group.members.length > 0 ? `Members: ${group.members.join(', ')}` : ''}

You can now collaborate with other group members on events and chat together!
  `.trim();

  return await sendEmail(
    recipients,
    `You've been added to: ${group.name || 'New Group'}`,
    htmlContent,
    textContent
  );
};

module.exports = {
  sendEmail,
  sendEventCreatedEmail,
  sendEventUpdatedEmail,
  sendTodoCreatedEmail,
  sendGroupInvitationEmail
};

