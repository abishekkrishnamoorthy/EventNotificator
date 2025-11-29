import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { sanitizeMessage } from '../utils/sanitize';
import logger from '../utils/logger';

const ChatPage = () => {
  const { groups, currentUserEmail } = useApp();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    if (selectedGroup) {
      // Set up real-time listener for chat messages
      unsubscribe = api.subscribeToChatMessages(selectedGroup, (msgs) => {
        if (isMounted) {
          setMessages(msgs);
          scrollToBottom();
        }
      });
    } else {
      if (isMounted) {
        setMessages([]);
      }
    }
    
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedGroup || sending) return;
    
    setSending(true);
    try {
      const sanitizedMessage = sanitizeMessage(messageInput);
      await api.sendChatMessage(selectedGroup, currentUserEmail, sanitizedMessage);
      setMessageInput('');
      // Messages will update automatically via real-time listener
    } catch (error) {
      logger.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const selectedGroupData = groups.find(g => g.id === selectedGroup);

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h3><i className="fas fa-users"></i> Select Group</h3>
        <div className="chat-group-list">
          {groups.length === 0 ? (
            <p className="empty-state">No groups available. Create a group to start chatting!</p>
          ) : (
            groups.map(group => (
              <div
                key={group.id}
                className={`chat-group-item ${selectedGroup === group.id ? 'active' : ''}`}
                onClick={() => setSelectedGroup(group.id)}
              >
                <div className="chat-group-item-name">{group.name}</div>
                <div className="chat-group-item-members">{group.members.length} members</div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="chat-main">
        {selectedGroupData ? (
          <>
            <div className="chat-header">
              <h3>{selectedGroupData.name}</h3>
              <p>{selectedGroupData.members.length} members</p>
            </div>
            <div className="chat-messages">
              {messages.length === 0 ? (
                <p className="empty-state">No messages yet. Start the conversation!</p>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`chat-message ${message.sender === currentUserEmail ? 'own' : 'other'}`}
                  >
                    <div className="chat-message-content">{message.message}</div>
                    <div className="chat-message-info">
                      <span>{message.sender}</span>
                      <span>{new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                />
                <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !messageInput.trim()}>
                  {sending ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="chat-header">
            <p>Select a group to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

