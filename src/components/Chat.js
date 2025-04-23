import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Chat = () => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]); // Always initialize as array
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    try {
      let response;
      
      // First try without auth token
      try {
        response = await axios.get('http://localhost:8081/chat/messages');
      } catch (err) {
        // If unauthorized and user is authenticated, try with token
        if (err.response?.status === 401 && isAuthenticated) {
          const token = localStorage.getItem('access_token');
          response = await axios.get('http://localhost:8081/chat/messages', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          throw err;
        }
      }

      // Ensure we always set an array, even if response.data is null
      setMessages(Array.isArray(response?.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load messages');
      setMessages([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]); // Add isAuthenticated to dependencies

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated) return;
  
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('No authentication token found. Please login again.');
      return;
    }
  
    try {
      console.log('Current token:', token); // Debug log
      
      const response = await axios.post(
        'http://localhost:8081/chat/messages',
        { text: newMessage },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      console.error('Full error details:', {
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
  
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('access_token');
        isAuthenticated(false);
      } else {
        setError(err.response?.data?.error || 'Failed to send message');
      }
    }
  };
  if (loading) {
    return <div className="chat-container">Loading messages...</div>;
  }

  return (
    <div className="chat-container" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
      <h3>Chat</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <div style={{ height: '300px', overflowY: 'auto', marginBottom: '10px' }}>
        {messages.length > 0 ? (
          messages.map((message) => (
            <div key={message.id} style={{ marginBottom: '5px' }}>
              <strong>{message.author}: </strong>
              <span>{message.text}</span>
              <div style={{ fontSize: '0.8em', color: '#666' }}>
                {new Date(message.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: '#666', textAlign: 'center' }}>
            No messages yet
          </div>
        )}
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{ width: '70%', padding: '5px' }}
          />
          <button type="submit" style={{ width: '25%', marginLeft: '5%', padding: '5px' }}>
            Send
          </button>
        </form>
      ) : (
        <div style={{ color: '#666', textAlign: 'center' }}>
          Please login to send messages
        </div>
      )}
    </div>
  );
};

export default Chat;