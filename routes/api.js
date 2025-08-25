const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { sendNotificationEmail } = require('../config/email');
const { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } = require('firebase/firestore');
const { v4: uuidv4 } = require('uuid');

// Get all events
router.get('/events', async (req, res) => {
    try {
        const eventsRef = collection(db, 'events');
        const snapshot = await getDocs(eventsRef);
        const events = [];
        
        snapshot.forEach((doc) => {
            events.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Create new event
router.post('/events', async (req, res) => {
    try {
        const { title, date, description, type, groupId, assignedTo } = req.body;
        
        const eventData = {
            title,
            date,
            description: description || '',
            type: type || 'event',
            groupId: groupId || null,
            assignedTo: assignedTo || [],
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'events'), eventData);
        
        // Send email notifications to assigned users
        if (assignedTo && assignedTo.length > 0) {
            for (const email of assignedTo) {
                await sendNotificationEmail(
                    email,
                    `New task assigned: ${title}`,
                    `You have been assigned a new task: ${title}`,
                    `
                    <h2>New Task Assignment</h2>
                    <p><strong>Task:</strong> ${title}</p>
                    <p><strong>Due Date:</strong> ${date}</p>
                    <p><strong>Description:</strong> ${description || 'No description provided'}</p>
                    <p>Please make sure to complete this task by the due date.</p>
                    `
                );
            }
        }
        
        const newEvent = {
            id: docRef.id,
            ...eventData
        };
        
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Update event
router.put('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const eventRef = doc(db, 'events', id);
        await updateDoc(eventRef, {
            ...updateData,
            updatedAt: new Date().toISOString()
        });
        
        res.json({ id, ...updateData });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const eventRef = doc(db, 'events', id);
        await deleteDoc(eventRef);
        
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Get all groups
router.get('/groups', async (req, res) => {
    try {
        const groupsRef = collection(db, 'groups');
        const snapshot = await getDocs(groupsRef);
        const groups = [];
        
        snapshot.forEach((doc) => {
            groups.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

// Create new group
router.post('/groups', async (req, res) => {
    try {
        const { name, description, members } = req.body;
        
        const groupData = {
            name,
            description: description || '',
            members: members || [],
            createdAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'groups'), groupData);
        
        const newGroup = {
            id: docRef.id,
            ...groupData
        };
        
        res.status(201).json(newGroup);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Failed to create group' });
    }
});

// Test email endpoint
router.post('/test-email', async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        
        const result = await sendNotificationEmail(
            to,
            subject || 'Test Email',
            message || 'This is a test email from your calendar app.',
            `
            <h2>Test Email</h2>
            <p>${message || 'This is a test email from your calendar app.'}</p>
            <p>If you received this email, your email configuration is working correctly!</p>
            `
        );
        
        if (result.success) {
            res.json({ message: 'Test email sent successfully', messageId: result.messageId });
        } else {
            res.status(500).json({ error: 'Failed to send test email', details: result.error });
        }
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ error: 'Failed to send test email' });
    }
});

module.exports = router;