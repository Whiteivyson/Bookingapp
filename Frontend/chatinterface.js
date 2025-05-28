// components/ChatInterface.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:7000');

export const ChatInterface = ({ senderId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.emit('join', senderId);
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, [senderId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = { senderId, receiverId, content: newMessage };
    socket.emit('message', msg);
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
      <h3>Chat</h3>
      <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.senderId === senderId ? 'right' : 'left' }}>
            <p style={{ background: '#f1f1f1', padding: 8, borderRadius: 5 }}>{msg.content}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message"
        style={{ width: '80%' }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};
