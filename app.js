require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { connectDb } = require('./src/config/db');
const { sendPushNotification } = require('./src/utils/fcmService');
const Account = require('./src/models/Account');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());

// ✅ Routes
const accountRoutes = require('./src/routes/accountRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const friendshipRoutes = require('./src/routes/friendshipRoutes');
const authRoutes = require('./src/routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friendships', friendshipRoutes);

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(' New client connected:', socket.id);

  socket.on('register-user', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(` User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('join-room', (chatId) => {
    socket.join(chatId);
    console.log(`👥 Socket ${socket.id} joined room ${chatId}`);
  });

  socket.on('send-message', async (messageData) => {
    try {
      io.to(messageData.chatID).emit('receive-message', messageData);

      const receiverId = messageData.receiverID;
      const isOnline = onlineUsers.has(receiverId);

      if (!isOnline) {
        const receiver = await Account.findById(receiverId);
        if (receiver?.fcmToken) {
          await sendPushNotification(
            receiver.fcmToken,
            `New message from ${messageData.senderName}`,
            messageData.text || ' You have a new message',
            {
              chatId: messageData.chatID,
              senderId: messageData.senderID
            }
          );
        }
      }
    } catch (err) {
      console.error(' Error handling message:', err);
    }
  });

  socket.on('typing', ({ chatID, sender }) => {
    socket.to(chatID).emit('typing', { sender });
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(` User ${userId} disconnected`);
        break;
      }
    }
  });
});


const PORT = process.env.PORT || 3000;
connectDb().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Error starting server:', err);
});
