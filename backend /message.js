// message-service/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 7000;

const sequelize = new Sequelize(
  process.env.DB_NAME || 'creathr_messages',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

const Message = sequelize.define('Message', {
  senderId: { type: DataTypes.UUID, allowNull: false },
  receiverId: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('message', async (msg) => {
    const { senderId, receiverId, content } = msg;
    const savedMessage = await Message.create({ senderId, receiverId, content });
    io.to(receiverId).emit('message', savedMessage);
  });
});

sequelize.sync().then(() => {
  server.listen(PORT, () => console.log(`Message service running on port ${PORT}`));
});
