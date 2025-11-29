import { ref, get, set, push, update, remove, onValue, off, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase';
import logger from '../utils/logger';

export const api = {
  // Events
  async getEvents(userId = null, userEmail = null) {
    try {
      const eventsRef = ref(db, 'events');
      const groupsRef = ref(db, 'groups');
      
      // Get user's groups
      let userGroups = [];
      if (userId || userEmail) {
        const groupsSnapshot = await get(groupsRef);
        if (groupsSnapshot.exists()) {
          const groupsData = groupsSnapshot.val();
          Object.keys(groupsData).forEach((groupId) => {
            const group = groupsData[groupId];
            if (group && group.members && Array.isArray(group.members)) {
              const isMember = group.members.some(member => 
                member === userId || 
                member === userEmail ||
                (userEmail && member.toLowerCase() === userEmail.toLowerCase())
              );
              if (isMember) {
                userGroups.push(groupId);
              }
            }
          });
        }
      }
      
      const eventsSnapshot = await get(eventsRef);
      const events = [];
      
      if (eventsSnapshot.exists()) {
        const data = eventsSnapshot.val();
        Object.keys(data).forEach((id) => {
          const event = {
            id: id,
            ...data[id]
          };
          // Filter by user if userId provided
          if (userId || userEmail) {
            const isCreator = event.createdBy === userId || event.createdBy === userEmail;
            const isAssigned = event.assignedTo && Array.isArray(event.assignedTo) && event.assignedTo.some(email => {
              return email === userId || 
                     email === userEmail ||
                     (userEmail && email.toLowerCase() === userEmail.toLowerCase());
            });
            // Check if user is member of any group assigned to event
            const isInGroup = event.groupIds && Array.isArray(event.groupIds) && 
              event.groupIds.some(groupId => userGroups.includes(groupId));
            
            if (isCreator || isAssigned || isInGroup) {
              events.push(event);
            }
          } else {
            events.push(event);
          }
        });
      }
      
      return events;
    } catch (error) {
      logger.error('Error fetching events:', error);
      throw error;
    }
  },

  subscribeToEvents(callback, userId = null, userEmail = null) {
    const eventsRef = ref(db, 'events');
    const groupsRef = ref(db, 'groups');
    
    // First, get all groups to check membership
    let userGroups = [];
    if (userId || userEmail) {
      onValue(groupsRef, (groupsSnapshot) => {
        userGroups = [];
        if (groupsSnapshot.exists()) {
          const groupsData = groupsSnapshot.val();
          Object.keys(groupsData).forEach((groupId) => {
            const group = groupsData[groupId];
            if (group && group.members && Array.isArray(group.members)) {
              const isMember = group.members.some(member => 
                member === userId || 
                member === userEmail ||
                (userEmail && member.toLowerCase() === userEmail.toLowerCase())
              );
              if (isMember) {
                userGroups.push(groupId);
              }
            }
          });
        }
      });
    }
    
    onValue(eventsRef, (snapshot) => {
      const events = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((id) => {
          const event = {
            id: id,
            ...data[id]
          };
          // Filter by user if userId provided
          if (userId || userEmail) {
            const isCreator = event.createdBy === userId || event.createdBy === userEmail;
            const isAssigned = event.assignedTo && Array.isArray(event.assignedTo) && event.assignedTo.some(email => {
              // Check if any assigned email matches user's email or userId
              return email === userId || 
                     email === userEmail ||
                     (userEmail && email.toLowerCase() === userEmail.toLowerCase());
            });
            // Check if user is member of any group assigned to event
            const isInGroup = event.groupIds && Array.isArray(event.groupIds) && 
              event.groupIds.some(groupId => userGroups.includes(groupId));
            
            if (isCreator || isAssigned || isInGroup) {
              events.push(event);
            }
          } else {
            events.push(event);
          }
        });
      }
      callback(events);
    });
    return () => {
      off(eventsRef);
      off(groupsRef);
    };
  },

  async createEvent(eventData, userId = null) {
    try {
      const eventsRef = ref(db, 'events');
      const newEventRef = push(eventsRef);
      const eventId = newEventRef.key;
      
      // Collect all members from groups and individual assignments
      let allMembers = [...(eventData.assignedTo || [])];
      const groupIds = eventData.groupIds || [];
      
      // Fetch members from selected groups
      if (groupIds.length > 0) {
        const groupsRef = ref(db, 'groups');
        const groupsSnapshot = await get(groupsRef);
        
        if (groupsSnapshot.exists()) {
          const groupsData = groupsSnapshot.val();
          groupIds.forEach(groupId => {
            const group = groupsData[groupId];
            if (group && group.members && Array.isArray(group.members)) {
              // Add group members to allMembers, avoiding duplicates
              group.members.forEach(member => {
                if (!allMembers.includes(member)) {
                  allMembers.push(member);
                }
              });
            }
          });
        }
      }
      
      // Add metadata fields
      const eventWithMetadata = {
        ...eventData,
        assignedTo: allMembers,
        groupIds: groupIds,
        createdBy: userId || eventData.createdBy || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Remove groupIds from eventData to avoid duplication
      delete eventWithMetadata.groupIds;
      eventWithMetadata.groupIds = groupIds;
      
      await set(newEventRef, eventWithMetadata);
      
      return {
        id: eventId,
        ...eventWithMetadata
      };
    } catch (error) {
      logger.error('Error creating event:', error);
      throw error;
    }
  },

  async updateEvent(eventId, updateData) {
    try {
      const eventRef = ref(db, `events/${eventId}`);
      const updatePayload = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      // Don't overwrite createdBy and createdAt on update
      await update(eventRef, updatePayload);
      
      return {
        id: eventId,
        ...updateData,
        updatedAt: updatePayload.updatedAt
      };
    } catch (error) {
      logger.error('Error updating event:', error);
      throw error;
    }
  },

  async deleteEvent(eventId) {
    try {
      const eventRef = ref(db, `events/${eventId}`);
      await remove(eventRef);
      return { message: 'Event deleted successfully' };
    } catch (error) {
      logger.error('Error deleting event:', error);
      throw error;
    }
  },

  // Groups
  async getGroups(userId = null, userEmail = null) {
    try {
      const groupsRef = ref(db, 'groups');
      const snapshot = await get(groupsRef);
      const groups = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((id) => {
          const group = {
            id: id,
            ...data[id]
          };
          // Filter by user if userId or userEmail provided
          if (userId || userEmail) {
            const isCreator = group.createdBy === userId || group.createdBy === userEmail;
            const isMember = group.members && Array.isArray(group.members) && (
              group.members.includes(userId) || 
              group.members.includes(userEmail) ||
              (userEmail && group.members.some(m => m.toLowerCase() === userEmail.toLowerCase()))
            );
            if (isCreator || isMember) {
              groups.push(group);
            }
          } else {
            groups.push(group);
          }
        });
      }
      
      return groups;
    } catch (error) {
      logger.error('Error fetching groups:', error);
      throw error;
    }
  },

  subscribeToGroups(callback, userId = null, userEmail = null) {
    const groupsRef = ref(db, 'groups');
    onValue(groupsRef, (snapshot) => {
      const groups = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((id) => {
          const group = {
            id: id,
            ...data[id]
          };
          // Filter by user if userId or userEmail provided
          if (userId || userEmail) {
            const isCreator = group.createdBy === userId || group.createdBy === userEmail;
            const isMember = group.members && Array.isArray(group.members) && (
              group.members.includes(userId) || 
              group.members.includes(userEmail) ||
              (userEmail && group.members.some(m => m.toLowerCase() === userEmail.toLowerCase()))
            );
            if (isCreator || isMember) {
              groups.push(group);
            }
          } else {
            groups.push(group);
          }
        });
      }
      callback(groups);
    });
    return () => off(groupsRef);
  },

  async createGroup(groupData, userId = null, userEmail = null) {
    try {
      const groupsRef = ref(db, 'groups');
      const newGroupRef = push(groupsRef);
      const groupId = newGroupRef.key;
      
      // Ensure creator is in members list
      const members = groupData.members || [];
      const creatorEmail = userEmail || userId;
      if (creatorEmail && !members.includes(creatorEmail)) {
        members.push(creatorEmail);
      }
      
      // Add metadata fields
      const groupWithMetadata = {
        ...groupData,
        members: members,
        createdBy: userId || userEmail || groupData.createdBy || null,
        createdAt: new Date().toISOString()
      };
      
      await set(newGroupRef, groupWithMetadata);
      
      return {
        id: groupId,
        ...groupWithMetadata
      };
    } catch (error) {
      logger.error('Error creating group:', error);
      throw error;
    }
  },

  // Chat
  async getChatMessages(groupId) {
    try {
      const messagesRef = ref(db, `chats/${groupId}/messages`);
      const snapshot = await get(messagesRef);
      const messages = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((id) => {
          messages.push({
            id: id,
            ...data[id]
          });
        });
        // Sort by timestamp
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }
      
      return messages;
    } catch (error) {
      logger.error('Error fetching chat messages:', error);
      throw error;
    }
  },

  subscribeToChatMessages(groupId, callback) {
    const messagesRef = ref(db, `chats/${groupId}/messages`);
    onValue(messagesRef, (snapshot) => {
      const messages = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((id) => {
          messages.push({
            id: id,
            ...data[id]
          });
        });
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }
      callback(messages);
    });
    return () => off(messagesRef);
  },

  async sendChatMessage(groupId, sender, message) {
    try {
      const messageData = {
        sender,
        message,
        groupId,
        timestamp: new Date().toISOString()
      };
      
      const messagesRef = ref(db, `chats/${groupId}/messages`);
      const newMessageRef = push(messagesRef);
      const messageId = newMessageRef.key;
      
      await set(newMessageRef, messageData);
      
      return {
        id: messageId,
        ...messageData
      };
    } catch (error) {
      logger.error('Error sending chat message:', error);
      throw error;
    }
  },

  // User verification status
  async setUserEmailVerified(userId, verified = true) {
    try {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, {
        emailVerified: verified,
        emailVerifiedAt: verified ? new Date().toISOString() : null,
        verifiedViaOTP: verified
      });
      return { success: true };
    } catch (error) {
      logger.error('Error setting user email verified:', error);
      throw error;
    }
  },

  async getUserVerificationStatus(userId) {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      logger.error('Error getting user verification status:', error);
      throw error;
    }
  }
};
