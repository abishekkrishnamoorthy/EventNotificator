import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { 
  sendEventCreatedEmail, 
  sendEventUpdatedEmail, 
  sendEventReminderEmail,
  sendTodoCreatedEmail, 
  sendGroupInvitationEmail 
} from '../services/emailService';
import logger from '../utils/logger';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [userVerificationStatus, setUserVerificationStatus] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setEvents([]);
      setGroups([]);
      setLoading(false);
      return;
    }

    // Get user identifier (prefer uid, fallback to email)
    const userId = currentUser.uid || null;
    const userEmail = currentUser.email || null;

    // Check user verification status from database
    if (userId) {
      api.getUserVerificationStatus(userId)
        .then((status) => {
          if (status) {
            setUserVerificationStatus(status);
          }
        })
        .catch((error) => {
          logger.error('Error getting user verification status:', error);
        });
    }

    // Set up real-time listeners with user filtering
    const unsubscribeEvents = api.subscribeToEvents((eventsData) => {
      setEvents(eventsData);
      setLoading(false);
    }, userId, userEmail);

    const unsubscribeGroups = api.subscribeToGroups((groupsData) => {
      setGroups(groupsData);
    }, userId, userEmail);

    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeEvents) unsubscribeEvents();
      if (unsubscribeGroups) unsubscribeGroups();
    };
  }, [currentUser]);

  const showNotification = (message, type = 'info') => {
    if (message === null) {
      setNotification(null);
      return;
    }
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const createEvent = async (eventData) => {
    try {
      const userId = currentUser?.uid || currentUser?.email || null;
      const newEvent = await api.createEvent(eventData, userId);
      // State will update automatically via Firebase listener
      showNotification('Event created successfully!', 'success');
      
      // Send email notifications and show status
      const creatorName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'A user';
      const assignedTo = newEvent.assignedTo || [];
      
      // Only send emails if there are assigned members
      if (assignedTo.length > 0) {
        // Get group names if event is assigned to groups
        const groupNames = [];
        if (newEvent.groupIds && Array.isArray(newEvent.groupIds)) {
          newEvent.groupIds.forEach(groupId => {
            const group = groups.find(g => g.id === groupId);
            if (group) {
              groupNames.push(group.name);
            }
          });
        }
        
        const eventWithGroupInfo = {
          ...newEvent,
          groupNames: groupNames.join(', ')
        };
        
        // Send different email templates based on event type
        try {
          if (eventData.type === 'todo') {
            // Send todo notification
            const emailResult = await sendTodoCreatedEmail(eventWithGroupInfo, assignedTo, creatorName);
            if (emailResult) {
              showNotification(`Todo created! Email notifications sent to ${assignedTo.length} member(s)`, 'success');
            }
          } else {
            // Send event notification
            const emailResult = await sendEventCreatedEmail(eventWithGroupInfo, assignedTo, creatorName);
            if (emailResult) {
              showNotification(`Event created! Email notifications sent to ${assignedTo.length} member(s)`, 'success');
            }
          }
        } catch (emailError) {
          logger.error('Failed to send email notification - Full error:', emailError);
          const errorMessage = emailError?.message || 'Unknown error occurred';
          showNotification(`Event created! Email failed: ${errorMessage}`, 'error');
        }
      } else {
        // No assigned members
        showNotification('Event created successfully! No email notifications sent (no assigned members)', 'success');
      }
      
      return newEvent;
    } catch (error) {
      logger.error('Error creating event:', error);
      showNotification('Error creating event', 'error');
      throw error;
    }
  };

  const updateEvent = async (eventId, updateData) => {
    try {
      const updatedEvent = await api.updateEvent(eventId, updateData);
      // State will update automatically via Firebase listener
      showNotification('Event updated successfully!', 'success');
      
      // Send email notifications and show status
      const updaterName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'A user';
      const assignedTo = updateData.assignedTo || [];
      
      // Only send emails if there are assigned members
      if (assignedTo.length > 0) {
        // Get group name if event is assigned to a group
        let groupName = null;
        if (updateData.groupId) {
          const group = groups.find(g => g.id === updateData.groupId);
          groupName = group?.name || null;
        }
        
        const eventWithGroupName = {
          ...updatedEvent,
          groupName
        };
        
        // Send event updated notification (don't send for todos on update, only on create)
        if (updateData.type !== 'todo') {
          try {
            const emailResult = await sendEventUpdatedEmail(eventWithGroupName, assignedTo, updaterName);
            if (emailResult) {
              showNotification(`Event updated! Email notifications sent to ${assignedTo.length} member(s)`, 'success');
            }
          } catch (emailError) {
            logger.error('Failed to send email notification - Full error:', emailError);
            const errorMessage = emailError?.message || 'Unknown error occurred';
            showNotification(`Event updated! Email failed: ${errorMessage}`, 'error');
          }
        }
      }
      
      return updatedEvent;
    } catch (error) {
      logger.error('Error updating event:', error);
      showNotification('Error updating event', 'error');
      throw error;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await api.deleteEvent(eventId);
      // State will update automatically via Firebase listener
      showNotification('Event deleted successfully!', 'success');
    } catch (error) {
      logger.error('Error deleting event:', error);
      showNotification('Error deleting event', 'error');
      throw error;
    }
  };

  const createGroup = async (groupData) => {
    try {
      const userId = currentUser?.uid || null;
      const userEmail = currentUser?.email || null;
      const newGroup = await api.createGroup(groupData, userId, userEmail);
      // State will update automatically via Firebase listener
      showNotification('Group created successfully!', 'success');
      
      // Send email notifications and show status
      const inviterName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'A user';
      const members = groupData.members || [];
      
      // Only send emails if there are members
      if (members.length > 0) {
        const groupWithMembers = {
          ...newGroup,
          members
        };
        
        // Send group invitation emails to all members
        try {
          const emailResult = await sendGroupInvitationEmail(groupWithMembers, members, inviterName);
          if (emailResult) {
            showNotification(`Group created! Invitation emails sent to ${members.length} member(s)`, 'success');
          }
        } catch (emailError) {
          logger.error('Failed to send email notification - Full error:', emailError);
          const errorMessage = emailError?.message || 'Unknown error occurred';
          showNotification(`Group created! Email failed: ${errorMessage}`, 'error');
        }
      } else {
        // No members
        showNotification('Group created successfully! No invitation emails sent (no members)', 'success');
      }
      
      return newGroup;
    } catch (error) {
      logger.error('Error creating group:', error);
      showNotification('Error creating group', 'error');
      throw error;
    }
  };

  const currentUserEmail = currentUser?.email || '';

  // Check if email is verified via OTP only
  const isEmailVerified = userVerificationStatus?.emailVerified || userVerificationStatus?.verifiedViaOTP || false;

  const value = {
    events,
    groups,
    loading,
    currentUserEmail,
    notification,
    showNotification,
    createEvent,
    updateEvent,
    deleteEvent,
    createGroup,
    isEmailVerified,
    userVerificationStatus
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

