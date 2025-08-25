const cron = require('node-cron');
const { db } = require('../config/firebase');
const { sendNotificationEmail } = require('../config/email');
const { collection, getDocs, query, where } = require('firebase/firestore');

// Check for events due today and send notifications
const checkDailyNotifications = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('date', '==', today));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(async (doc) => {
            const event = doc.data();
            
            if (event.assignedTo && event.assignedTo.length > 0) {
                for (const email of event.assignedTo) {
                    await sendNotificationEmail(
                        email,
                        `Reminder: ${event.title} is due today`,
                        `Don't forget about your task: ${event.title}`,
                        `
                        <h2>Task Reminder</h2>
                        <p><strong>Task:</strong> ${event.title}</p>
                        <p><strong>Due Date:</strong> ${event.date}</p>
                        <p><strong>Description:</strong> ${event.description || 'No description provided'}</p>
                        <p>This task is due today. Please make sure to complete it.</p>
                        `
                    );
                }
            }
        });
        
        console.log(`Daily notification check completed for ${today}`);
    } catch (error) {
        console.error('Error in daily notification check:', error);
    }
};

// Schedule daily notifications at 9:00 AM
cron.schedule('0 9 * * *', checkDailyNotifications);

// Check for upcoming events (1 day before)
const checkUpcomingNotifications = async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('date', '==', tomorrowStr));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(async (doc) => {
            const event = doc.data();
            
            if (event.assignedTo && event.assignedTo.length > 0) {
                for (const email of event.assignedTo) {
                    await sendNotificationEmail(
                        email,
                        `Upcoming: ${event.title} is due tomorrow`,
                        `Reminder: Your task "${event.title}" is due tomorrow`,
                        `
                        <h2>Upcoming Task</h2>
                        <p><strong>Task:</strong> ${event.title}</p>
                        <p><strong>Due Date:</strong> ${event.date}</p>
                        <p><strong>Description:</strong> ${event.description || 'No description provided'}</p>
                        <p>This task is due tomorrow. Please prepare accordingly.</p>
                        `
                    );
                }
            }
        });
        
        console.log(`Upcoming notification check completed for ${tomorrowStr}`);
    } catch (error) {
        console.error('Error in upcoming notification check:', error);
    }
};

// Schedule upcoming notifications at 6:00 PM
cron.schedule('0 18 * * *', checkUpcomingNotifications);

module.exports = { checkDailyNotifications, checkUpcomingNotifications };