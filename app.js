require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { connectDb } = require('./src/config/db');
const { sendPushNotification } = require('./src/utils/fcmService');
const Account = require('./src/models/Account');
const setupSwagger = require('./src/config/swagger');
const onlineUsersManager = require('./src/utils/onlineUsers');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(express.json());
setupSwagger(app);

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

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

 socket.on('register-user', (userId) => {
  const existingSocketId = onlineUsersManager.getSocketId(userId);
  if (existingSocketId && existingSocketId !== socket.id) {
    onlineUsersManager.remove(userId);
    console.log(`Removed existing socket for user ${userId}`);
  }
  
  onlineUsersManager.add(userId, socket.id);
  console.log(`User ${userId} registered with socket ${socket.id}`);
  io.emit('user-status', { userId, isOnline: true, lastOnline: null });
});

  socket.on('join-room', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined room ${chatId}`);
  });

  socket.on('send-message', async (messageData) => {
    try {
      io.to(messageData.chatID).emit('receive-message', messageData);

      const receiverId = messageData.receiverID;
      const isOnline = onlineUsersManager.has(receiverId);

      if (!isOnline) {
        const receiver = await Account.findById(receiverId);
        if (receiver?.fcmToken) {
          await sendPushNotification(
            receiver.fcmToken,
            `New message from ${messageData.senderName}`,
            messageData.text || 'You have a new message',
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

  socket.on('disconnect', async () => {
    const userId = onlineUsersManager.removeBySocketId(socket.id);
    if (userId) {
      try {
        const updatedAccount = await Account.findByIdAndUpdate(
          userId,
          { lastOnline: new Date() },
          { new: true }
        );
        console.log(`User ${userId} disconnected. Last online: ${updatedAccount.lastOnline}`);
        io.emit('user-status', {
          userId,
          isOnline: false,
          lastOnline: updatedAccount.lastOnline
        });
      } catch (err) {
        console.error(`Error updating lastOnline for user ${userId}:`, err);
      }
    }
  });

  socket.on('user-logout', async (userId) => {
  console.log(`User ${userId} logging out from socket ${socket.id}`);
  onlineUsersManager.remove(userId);
  
  try {
    const updatedAccount = await Account.findByIdAndUpdate(
      userId,
      { lastOnline: new Date() },
      { new: true }
    );
    console.log(`User ${userId} logged out. Last online: ${updatedAccount.lastOnline}`);
    io.emit('user-status', {
      userId,
      isOnline: false,
      lastOnline: updatedAccount.lastOnline
    });
  } catch (err) {
    console.error(`Error updating lastOnline for user ${userId}:`, err);
  }
});
});

const PORT = process.env.PORT || 3000;
connectDb().then(() => {
  server.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error(' Error starting server:', err);
});

module.exports = { onlineUsers: onlineUsersManager };