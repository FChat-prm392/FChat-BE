require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { connectDb } = require('./src/config/db');
const { sendPushNotification } = require('./src/utils/fcmService');
const Account = require('./src/models/Account');
const Chat = require('./src/models/Chat');
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
const messageReactionRoutes = require('./src/routes/messageReactionRoutes');
const friendshipRoutes = require('./src/routes/friendshipRoutes');
const authRoutes = require('./src/routes/authRoutes');
const Message = require('./src/models/Message');

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', messageReactionRoutes);
app.use('/api/friendships', friendshipRoutes);

app.get('/api/chats/:chatId/participants', async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId).populate('participants', '_id fullname username');
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json({
      chatId: chat._id,
      participants: chat.participants.map(p => ({
        _id: p._id,
        fullname: p.fullname,
        username: p.username
      }))
    });
  } catch (error) {
    console.error('Error fetching chat participants:', error);
    res.status(500).json({ error: 'Failed to fetch chat participants' });
  }
});

io.on('connection', (socket) => {
  socket.on('register-user', async (userId) => {
    const existingSocketId = onlineUsersManager.getSocketId(userId);
    if (existingSocketId && existingSocketId !== socket.id) {
      onlineUsersManager.remove(userId);
    }

    onlineUsersManager.add(userId, socket.id);
    io.emit('user-status', { userId, isOnline: true, lastOnline: null });
    
    try {
      const userChats = await Chat.find({
        participants: userId
      }).select('_id');
      
      for (const chat of userChats) {
        socket.join(chat._id.toString());
      }
    } catch (error) {
      console.error(`❌ Error auto-joining chat rooms for user ${userId}:`, error);
    }
  });

  socket.on('join-room', (chatId) => {
    socket.join(chatId);
  });

  socket.on('user-joined-chat', (data) => {
    socket.join(data.chatId);
  });

  socket.on('send-message', async (messageData) => {
    try {
      io.to(messageData.chatID).emit('receive-message', messageData);

      const chatListUpdate = {
        chatId: messageData.chatID,
        lastMessage: messageData.text || '',
        senderName: messageData.senderName || 'Unknown User',
        timestamp: messageData.timestamp || new Date().toISOString()
      };
      
      try {
        const chat = await Chat.findById(messageData.chatID).populate('participants');
        if (chat && chat.participants) {
          chat.participants.forEach(participant => {
            const participantSocketId = onlineUsersManager.getSocketId(participant._id.toString());
            if (participantSocketId) {
              io.to(participantSocketId).emit('chat-list-update', chatListUpdate);
            }
          });
        }
      } catch (chatError) {
        console.error('❌ Error fetching chat for chat list update:', chatError);
      }

      let receiverIds = [];
      try {
        const chat = await Chat.findById(messageData.chatID).populate('participants');
        if (chat && chat.participants) {
          receiverIds = chat.participants
            .map(p => p._id.toString())
            .filter(id => id !== messageData.senderID);
        }
      } catch (chatError) {
        console.error('❌ Error fetching chat participants:', chatError);
        if (messageData.receiverID && messageData.receiverID.trim() !== '') {
          receiverIds = [messageData.receiverID];
        }
      }

      for (const receiverId of receiverIds) {
        const isOnline = onlineUsersManager.has(receiverId);

        if (!isOnline) {
          try {
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
          } catch (fcmError) {
            console.error(`❌ Error sending FCM to ${receiverId}:`, fcmError);
          }
        }
      }
    } catch (err) {
      console.error('❌ Error handling send-message:', err);
    }
  });


socket.on('reaction-added', async (data) => {
  try {
    socket.to(data.chatId).emit('reaction-added', {
      messageId: data.messageId,
      userId: data.userId,
      userName: data.userName,
      emoji: data.emoji,
      timestamp: data.timestamp
    });
    
    try {
      const chat = await Chat.findById(data.chatId).populate('participants');
      if (chat && chat.participants) {
        const offlineParticipants = chat.participants
          .filter(p => p._id.toString() !== data.userId && !onlineUsersManager.has(p._id.toString()));
        
        for (const participant of offlineParticipants) {
          if (participant.fcmToken) {
            await sendPushNotification(
              participant.fcmToken,
              `${data.userName} reacted to your message`,
              `${data.userName} reacted with ${data.emoji}`,
              {
                chatId: data.chatId,
                messageId: data.messageId,
                type: 'reaction'
              }
            );
          }
        }
      }
    } catch (fcmError) {
      console.error('❌ Error sending FCM for reaction:', fcmError);
    }
  } catch (error) {
    console.error('❌ Error handling reaction-added:', error);
  }
});

socket.on('reaction-removed', async (data) => {
  try {
    socket.to(data.chatId).emit('reaction-removed', {
      messageId: data.messageId,
      userId: data.userId,
      userName: data.userName,
      emoji: data.emoji,
      timestamp: data.timestamp
    });
  } catch (error) {
    console.error('❌ Error handling reaction-removed:', error);
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
      let query = {
        senderID: data.userId,
        $or: [
          { 'deliveredTo.0': { $exists: true } },
          { 'readBy.0': { $exists: true } }
        ]
      };

      if (data.chatId) {
        query.chatID = data.chatId;
      }

      const messages = await Message.find(query)
        .sort({ createAt: -1 })
        .limit(50);
      
      let syncCount = 0;
      for (const message of messages) {
        let latestStatus = 'sent';
        let latestTimestamp = message.createAt;
        
        if (message.readBy && message.readBy.length > 0) {
          latestStatus = 'read';
          latestTimestamp = message.readBy[message.readBy.length - 1].timestamp;
        } else if (message.deliveredTo && message.deliveredTo.length > 0) {
          latestStatus = 'delivered';
          latestTimestamp = message.deliveredTo[message.deliveredTo.length - 1].timestamp;
        }
        
        socket.emit('message-status-update', {
          messageId: message._id.toString(),
          status: latestStatus,
          timestamp: latestTimestamp
        });
        
        syncCount++;
      }
      
      socket.emit('status-sync-complete', {
        count: syncCount,
        userId: data.userId,
        chatId: data.chatId || null
      });
    } catch (error) {
      console.error('❌ Error syncing message status:', error);
      socket.emit('sync-error', {
        error: 'Failed to sync message status',
        userId: data.userId
      });
    }
  });

  socket.on('voice-data', (data) => {
    try {
        const { audioData, chatId, userId, timestamp } = data;
        
        socket.to(chatId).emit('voice-data', {
            audioData: audioData,
            userId: userId,
            timestamp: timestamp
        });
    } catch (error) {
        console.error('Error handling voice data:', error);
    }
});

  socket.on('message-delivered', async (data) => {
    
    try {
      const result = await Message.findByIdAndUpdate(
        data.messageId,
        {
          $addToSet: { 
            deliveredTo: { 
              userId: data.userId, 
              timestamp: new Date() 
            }
          }
        },
        { new: true }
      );
      
      if (result) {
        io.to(data.chatId).emit('message-status-update', {
          messageId: data.messageId,
          status: 'delivered',
          userId: data.userId,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('❌ Error updating delivered status:', error);
    }
  });

  socket.on('message-read', async (data) => {
    
    try {
      const result = await Message.findByIdAndUpdate(
        data.messageId,
        {
          $addToSet: { 
            readBy: { 
              userId: data.userId, 
              timestamp: new Date() 
            }
          }
        },
        { new: true }
      );
      
      if (result) {
        io.to(data.chatId).emit('message-status-update', {
          messageId: data.messageId,
          status: 'read',
          userId: data.userId,
          timestamp: new Date()
        });
        
        const message = await Message.findById(data.messageId).populate('senderID');
        if (message && message.senderID) {
          const senderSocketId = onlineUsersManager.getSocketId(message.senderID._id.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('message-status-update', {
              messageId: data.messageId,
              status: 'read',
              userId: data.userId,
              timestamp: new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error updating read status:', error);
    }
  });

  socket.on('typing-start', (data) => {
    socket.to(data.chatId).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      isTyping: true
    });
    
    socket.to(data.chatId).emit('typing-start', {
      chatId: data.chatId,
      userId: data.userId,
      userName: data.userName
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.chatId).emit('user-typing', {
      userId: data.userId,
      isTyping: false
    });
    
    socket.to(data.chatId).emit('typing-stop', {
      chatId: data.chatId,
      userId: data.userId
    });
  });

  socket.on('user-entered-chat', (data) => {
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

  socket.on('call-initiate', (data) => {
    const receiverSocketId = onlineUsersManager.getSocketId(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incoming-call', {
        callId: data.callId,
        chatId: data.chatId,
        callerId: data.callerId,
        callerName: data.callerName || 'Unknown Caller',
        isVideoCall: data.isVideoCall,
        timestamp: data.timestamp
      });
    } else {
      let callAttempted = false;
      
      io.sockets.sockets.forEach((clientSocket) => {
        if (clientSocket.userId === data.receiverId) {
          clientSocket.emit('incoming-call', {
            callId: data.callId,
            chatId: data.chatId,
            callerId: data.callerId,
            callerName: data.callerName || 'Unknown Caller',
            isVideoCall: data.isVideoCall,
            timestamp: data.timestamp
          });
          callAttempted = true;
        }
      });
      
      if (!callAttempted) {
        socket.emit('call-failed', {
          reason: 'Receiver is offline',
          callId: data.callId
        });
      }
    }
  });

  socket.on('call-answer', (data) => {
    const callerSocketId = onlineUsersManager.getSocketId(data.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-answered', {
        callId: data.callId,
        timestamp: data.timestamp
      });
    }
  });

  socket.on('call-decline', (data) => {
    const callerSocketId = onlineUsersManager.getSocketId(data.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-declined', {
        callId: data.callId,
        timestamp: data.timestamp
      });
    }
  });

  socket.on('call-end', (data) => {
    const callerSocketId = onlineUsersManager.getSocketId(data.callerId);
    const receiverSocketId = onlineUsersManager.getSocketId(data.receiverId);
    
    const callEndData = {
      callId: data.callId,
      timestamp: data.timestamp
    };
    
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-ended', callEndData);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call-ended', callEndData);
    }
  });

  socket.on('call-mute', (data) => {
    const otherParticipantId = data.participantId;
    const otherSocketId = onlineUsersManager.getSocketId(otherParticipantId);
    
    if (otherSocketId) {
      io.to(otherSocketId).emit('call-mute-status', {
        callId: data.callId,
        userId: data.userId,
        isMuted: data.isMuted
      });
    }
  });

  socket.on('call-video-toggle', (data) => {
    const otherParticipantId = data.participantId;
    const otherSocketId = onlineUsersManager.getSocketId(otherParticipantId);
    
    if (otherSocketId) {
      io.to(otherSocketId).emit('call-video-status', {
        callId: data.callId,
        userId: data.userId,
        isVideoOn: data.isVideoOn
      });
    }
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
const HOST = '0.0.0.0'; 
connectDb()
  .then(() => {
    server.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
      console.log(`📡 Socket.IO server ready for connections`);
    });
  })
  .catch((err) => {
    console.error('❌ Error starting server:', err);
  });


module.exports = { onlineUsers: onlineUsersManager };