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

// Routes
const accountRoutes = require('./src/routes/accountRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const friendshipRoutes = require('./src/routes/friendshipRoutes');
const authRoutes = require('./src/routes/authRoutes');
const Message = require('./src/models/Message');

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friendships', friendshipRoutes);

io.on('connection', (socket) => {

  socket.on('register-user', (userId) => {
    const existingSocketId = onlineUsersManager.getSocketId(userId);
    if (existingSocketId && existingSocketId !== socket.id) {
      onlineUsersManager.remove(userId);
    }

    onlineUsersManager.add(userId, socket.id);
    io.emit('user-status', { userId, isOnline: true, lastOnline: null });
  });

  socket.on('join-room', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send-message', async (messageData) => {
    try {
      io.to(messageData.chatID).emit('receive-message', messageData);

      const receiverId = messageData.receiverID;
      const isOnline = onlineUsersManager.has(receiverId);

      if (!isOnline) {
        const receiver = await Account.findById(receiverId);
        if (receiver?.fcmToken) {
          console.log(`📲 Sending FCM to ${receiverId} (${receiver.fcmToken})`);
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
      console.error('❌ Error handling send-message:', err);
    }
  });

  socket.on('message-sent', (data) => {
    socket.emit('message-status-update', {
      messageId: data.messageId,
      status: 'sent',
      timestamp: new Date()
    });
    
    socket.to(data.chatId).emit('message-status-update', {
      messageId: data.messageId,
      status: 'delivered',
      timestamp: new Date()
    });
});

socket.on('sync-message-status', async (data) => {
  
  try {
    const messages = await Message.find({
      senderID: data.userId,
      $or: [
        { 'deliveredTo.0': { $exists: true } },
        { 'readBy.0': { $exists: true } }
      ]
    }).sort({ createAt: -1 }).limit(50); 
    
    for (const message of messages) {
      if (message.readBy && message.readBy.length > 0) {
        socket.emit('message-status-update', {
          messageId: message._id,
          status: 'read',
          timestamp: message.readBy[message.readBy.length - 1].timestamp
        });
      } else if (message.deliveredTo && message.deliveredTo.length > 0) {
        socket.emit('message-status-update', {
          messageId: message._id,
          status: 'delivered',
          timestamp: message.deliveredTo[message.deliveredTo.length - 1].timestamp
        });
      }
    }
    
  } catch (error) {
    console.error('Error syncing message status:', error);
  }
});

socket.on('message-delivered', async (data) => {
  
  try {
    await Message.findByIdAndUpdate(data.messageId, {
      $addToSet: { 
        deliveredTo: { 
          userId: data.userId, 
          timestamp: new Date() 
        }
      }
    });
    
    io.to(data.chatId).emit('message-status-update', {
      messageId: data.messageId,
      status: 'delivered',
      userId: data.userId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error updating delivered status:', error);
  }
});

socket.on('message-read', async (data) => {
  
  try {
    await Message.findByIdAndUpdate(data.messageId, {
      $addToSet: { 
        readBy: { 
          userId: data.userId, 
          timestamp: new Date() 
        }
      }
    });
    
    io.to(data.chatId).emit('message-status-update', {
      messageId: data.messageId,
      status: 'read',
      userId: data.userId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error updating read status:', error);
  }
});

  socket.on('typing-start', (data) => {
    socket.to(data.chatId).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      isTyping: true
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.chatId).emit('user-typing', {
      userId: data.userId,
      isTyping: false
    });
  });

  socket.on('user-entered-chat', (data) => {
    console.log(`👤 user-entered-chat: ${data.userId} entered chat ${data.chatId}`);
    socket.to(data.chatId).emit('user-chat-presence', {
      userId: data.userId,
      isInChat: true
    });
  });

  socket.on('user-left-chat', (data) => {
    socket.to(data.chatId).emit('user-chat-presence', {
      userId: data.userId,
      isInChat: false
    });
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
        io.emit('user-status', {
          userId,
          isOnline: false,
          lastOnline: updatedAccount.lastOnline
        });
      } catch (err) {
        console.error(`❌ Error updating lastOnline for user ${userId}:`, err);
      }
    }
  });

  socket.on('user-logout', async (userId) => {
    onlineUsersManager.remove(userId);

    try {
      const updatedAccount = await Account.findByIdAndUpdate(
        userId,
        { lastOnline: new Date() },
        { new: true }
      );
      io.emit('user-status', {
        userId,
        isOnline: false,
        lastOnline: updatedAccount.lastOnline
      });
    } catch (err) {
      console.error(`❌ Error updating lastOnline for user ${userId}:`, err);
    }
  });
});

const PORT = process.env.PORT || 3000;
connectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error starting server:', err);
  });

module.exports = { onlineUsers: onlineUsersManager };
