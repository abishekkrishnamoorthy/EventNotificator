const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const {
  sendEventCreatedEmail,
  sendEventUpdatedEmail,
  sendTodoCreatedEmail,
  sendGroupInvitationEmail
} = require('./emailFunctions');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// EmailJS configuration constants
const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

/**
 * Cloud Function: Send event created email
 */
exports.sendEventCreatedEmail = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send emails'
    );
  }

  try {
    const { event, recipients, creatorName } = data;
    
    if (!event || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Event, recipients array, and creatorName are required'
      );
    }

    const result = await sendEventCreatedEmail({ event, recipients, creatorName });
    return result;
  } catch (error) {
    console.error('Error in sendEventCreatedEmail:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to send event created email'
    );
  }
});

/**
 * Cloud Function: Send event updated email
 */
exports.sendEventUpdatedEmail = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send emails'
    );
  }

  try {
    const { event, recipients, updaterName } = data;
    
    if (!event || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Event, recipients array, and updaterName are required'
      );
    }

    const result = await sendEventUpdatedEmail({ event, recipients, updaterName });
    return result;
  } catch (error) {
    console.error('Error in sendEventUpdatedEmail:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to send event updated email'
    );
  }
});

/**
 * Cloud Function: Send todo created email
 */
exports.sendTodoCreatedEmail = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send emails'
    );
  }

  try {
    const { todo, recipients, creatorName } = data;
    
    if (!todo || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Todo, recipients array, and creatorName are required'
      );
    }

    const result = await sendTodoCreatedEmail({ todo, recipients, creatorName });
    return result;
  } catch (error) {
    console.error('Error in sendTodoCreatedEmail:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to send todo created email'
    );
  }
});

/**
 * Cloud Function: Send group invitation email
 */
exports.sendGroupInvitationEmail = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send emails'
    );
  }

  try {
    const { group, recipients, inviterName } = data;
    
    if (!group || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Group, recipients array, and inviterName are required'
      );
    }

    const result = await sendGroupInvitationEmail({ group, recipients, inviterName });
    return result;
  } catch (error) {
    console.error('Error in sendGroupInvitationEmail:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to send group invitation email'
    );
  }
});

/**
 * Scheduled Cloud Function: Send event reminders 5 minutes before event start
 * Runs every minute to check for events starting in 5 minutes
 */
exports.sendEventReminders = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  try {
    console.log('Checking for events starting in 5 minutes...');
    
    const db = admin.database();
    
    const now = new Date();
    
    // Get all events
    const eventsRef = db.ref('events');
    const eventsSnapshot = await eventsRef.once('value');
    
    if (!eventsSnapshot.exists()) {
      console.log('No events found');
      return null;
    }
    
    const events = eventsSnapshot.val();
    const eventsToRemind = [];
    
    // Check each event
    for (const [eventId, event] of Object.entries(events)) {
      if (!event.date || event.type !== 'event') {
        continue; // Skip events without date or non-event types
      }
      
      try {
        const eventDate = new Date(event.date);
        
        // Check if event starts in approximately 5 minutes (within 1 minute window)
        const timeDiff = eventDate.getTime() - now.getTime();
        const fiveMinutesInMs = 5 * 60 * 1000;
        const oneMinuteInMs = 60 * 1000;
        
        // Event should start between 4 minutes and 5 minutes from now
        if (timeDiff >= (fiveMinutesInMs - oneMinuteInMs) && timeDiff <= fiveMinutesInMs) {
          // Check if reminder already sent
          const reminderKey = `reminders/${eventId}`;
          const reminderRef = db.ref(reminderKey);
          const reminderSnapshot = await reminderRef.once('value');
          
          if (!reminderSnapshot.exists()) {
            eventsToRemind.push({
              id: eventId,
              ...event
            });
            
            // Mark reminder as sent
            await reminderRef.set({
              sentAt: now.toISOString(),
              eventId: eventId
            });
          }
        }
      } catch (error) {
        console.error(`Error processing event ${eventId}:`, error);
        continue;
      }
    }
    
    if (eventsToRemind.length === 0) {
      console.log('No events need reminders at this time');
      return null;
    }
    
    console.log(`Found ${eventsToRemind.length} event(s) to send reminders for`);
    
    // EmailJS configuration
    const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';
    const EMAILJS_SERVICE_ID = functions.config().emailjs?.service_id || process.env.EMAILJS_SERVICE_ID || 'service_vkf7xvp';
    const EMAILJS_USER_ID = functions.config().emailjs?.user_id || process.env.EMAILJS_USER_ID || 'mR0yvpHHY7lPhkQ9o';
    const EMAILJS_REMINDER_TEMPLATE = functions.config().emailjs?.reminder_template || process.env.EMAILJS_REMINDER_TEMPLATE || 'template_event_reminder';
    
    // Send reminders for each event
    for (const event of eventsToRemind) {
      try {
        const recipients = event.assignedTo || [];
        
        if (recipients.length === 0) {
          console.log(`Event ${event.id} has no assigned members, skipping reminder`);
          continue;
        }
        
        // Format event date and time
        const eventDate = event.date ? new Date(event.date).toLocaleDateString() : 'TBD';
        const eventTime = event.date && event.date.includes('T') 
          ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'All day';
        
        // Send reminder email to each recipient via EmailJS
        const emailPromises = recipients.map(async (recipientEmail) => {
          try {
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
            
            const response = await axios.post(EMAILJS_API_URL, {
              service_id: EMAILJS_SERVICE_ID,
              template_id: EMAILJS_REMINDER_TEMPLATE,
              user_id: EMAILJS_USER_ID,
              template_params: templateParams
            });
            
            console.log(`Reminder sent to ${recipientEmail} for event ${event.id}`);
            return { success: true, recipient: recipientEmail };
          } catch (error) {
            console.error(`Error sending reminder to ${recipientEmail}:`, error.message);
            return { success: false, recipient: recipientEmail, error: error.message };
          }
        });
        
        await Promise.all(emailPromises);
        console.log(`Reminders sent for event ${event.id} to ${recipients.length} recipient(s)`);
      } catch (error) {
        console.error(`Error processing reminder for event ${event.id}:`, error);
      }
    }
    
    console.log('Reminder check completed');
    return null;
  } catch (error) {
    console.error('Error in sendEventReminders:', error);
    throw error;
  }
});

