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
const geminiRoutes = require('./src/routes/geminiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', messageReactionRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/gemini', geminiRoutes);

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

// Debug endpoint to check online users
app.get('/api/debug/online-users', (req, res) => {
  try {
    const allOnlineUsers = onlineUsersManager.getAll();
    const onlineUsersArray = Array.from(allOnlineUsers.entries()).map(([userId, socketId]) => ({
      userId,
      socketId,
      socketExists: io.sockets.sockets.has(socketId)
    }));
    
    const totalSockets = io.sockets.sockets.size;
    const socketList = Array.from(io.sockets.sockets.keys());
    
    res.json({
      onlineUsers: onlineUsersArray,
      totalSockets: totalSockets,
      socketIds: socketList,
      timestamp: new Date().toISOString()
    });
    
    console.log(`🔍 Debug request - Online users: ${onlineUsersArray.length}, Total sockets: ${totalSockets}`);
  } catch (error) {
    console.error('Error fetching online users debug info:', error);
    res.status(500).json({ error: 'Failed to fetch debug info' });
  }
});

// Debug endpoint to check connection stability
app.get('/api/debug/connection-health', (req, res) => {
  try {
    const serverUptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const totalConnections = io.sockets.sockets.size;
    const onlineUsers = onlineUsersManager.getAll();
    
    res.json({
      serverUptime: serverUptime,
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
      },
      totalConnections: totalConnections,
      registeredUsers: onlineUsers.size,
      timestamp: new Date().toISOString()
    });
    
    console.log(`💊 Health check - Uptime: ${Math.round(serverUptime)}s, Connections: ${totalConnections}, Users: ${onlineUsers.size}`);
  } catch (error) {
    console.error('Error fetching connection health:', error);
    res.status(500).json({ error: 'Failed to fetch health info' });
  }
});

io.on('connection', (socket) => {
  console.log(`🔗 New socket connection established: ${socket.id}`);
  console.log(`🔗 Connection details - Address: ${socket.handshake.address}, Headers: ${JSON.stringify(socket.handshake.headers['user-agent']?.substring(0, 100))}`);

  // Add connection stability monitoring
  socket.on('connect', () => {
    console.log(`✅ Socket ${socket.id} officially connected`);
  });

  socket.on('connect_error', (error) => {
    console.log(`❌ Socket ${socket.id} connection error:`, error);
  });

  socket.on('error', (error) => {
    console.log(`❌ Socket ${socket.id} error:`, error);
  });

  socket.on('register-user', async (data) => {
    // Handle both old format (string) and new format (object)
    let userId, registrationInfo;
    
    if (typeof data === 'string') {
      userId = data;
      registrationInfo = { userId, socketId: socket.id, platform: 'unknown' };
    } else {
      userId = data.userId || data;
      registrationInfo = {
        userId: data.userId,
        socketId: data.socketId || socket.id,
        platform: data.platform || 'unknown',
        timestamp: data.timestamp || Date.now()
      };
    }
    
    console.log(`👤 User registration attempt - UserId: ${userId}, SocketId: ${socket.id}`);
    console.log(`📊 Registration info:`, registrationInfo);
    
    // Check if this user is already registered with a different socket
    const existingSocketId = onlineUsersManager.getSocketId(userId);
    if (existingSocketId && existingSocketId !== socket.id) {
      console.log(`⚠️ User ${userId} already has socket ${existingSocketId}, removing old connection`);
      // Disconnect the old socket if it exists
      const oldSocket = io.sockets.sockets.get(existingSocketId);
      if (oldSocket) {
        console.log(`🔌 Disconnecting old socket ${existingSocketId} for user ${userId}`);
        oldSocket.disconnect();
      }
      onlineUsersManager.remove(userId);
    }

    // Register the user with new socket
    onlineUsersManager.add(userId, socket.id);
    console.log(`✅ User ${userId} registered with socket ${socket.id}`);
    
    // Store userId on socket for easier lookup
    socket.userId = userId;
    
    // Log current online users for debugging
    const allOnlineUsers = onlineUsersManager.getAll();
    console.log(`📊 Current online users after registration: ${JSON.stringify(Object.fromEntries(allOnlineUsers))}`);
    
    // Send registration confirmation back to client
    socket.emit('registration-verified', {
      userId: userId,
      socketId: socket.id,
      isOnline: true,
      timestamp: Date.now(),
      registrationInfo: registrationInfo,
      totalOnlineUsers: allOnlineUsers.size
    });
    
    console.log(`✅ Registration verification sent to user ${userId} - Socket: ${socket.id}, Total online: ${allOnlineUsers.size}`);
    
    // Broadcast user online status to all clients
    io.emit('user-status', { userId, isOnline: true, lastOnline: null });
    console.log(`📡 Emitted user-status for ${userId}: online`);
    
    try {
      const userChats = await Chat.find({
        participants: userId
      }).select('_id');
      
      console.log(`📋 Found ${userChats.length} chats for user ${userId}`);
      
      for (const chat of userChats) {
        socket.join(chat._id.toString());
        console.log(`🏠 User ${userId} joined chat room: ${chat._id.toString()}`);
      }
      
      console.log(`✅ User ${userId} successfully joined all chat rooms`);
    } catch (error) {
      console.error(`❌ Error auto-joining chat rooms for user ${userId}:`, error);
      socket.emit('registration-failed', {
        userId: userId,
        error: 'Failed to join chat rooms'
      });
    }
    
    // Set up disconnect reason tracking
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket ${socket.id} (User: ${userId}) disconnected. Reason: ${reason}`);
      
      // Log additional details about the disconnect
      if (reason === 'transport close') {
        console.log(`🔌 Transport close for user ${userId} - likely client closed connection`);
      } else if (reason === 'ping timeout') {
        console.log(`🔌 Ping timeout for user ${userId} - connection lost or poor network`);
      } else if (reason === 'transport error') {
        console.log(`🔌 Transport error for user ${userId} - network issue`);
      } else if (reason === 'server shutdown') {
        console.log(`🔌 Server shutdown disconnect for user ${userId}`);
      } else {
        console.log(`🔌 Other disconnect reason for user ${userId}: ${reason}`);
      }
    });
  });

  socket.on('join-room', (data) => {
    // Handle both old format (string) and new format (object)
    let chatId, roomInfo;
    
    if (typeof data === 'string') {
      chatId = data;
      roomInfo = { chatId, socketId: socket.id };
    } else {
      chatId = data.chatId || data;
      roomInfo = {
        chatId: data.chatId,
        socketId: data.socketId || socket.id,
        platform: data.platform || 'unknown',
        timestamp: data.timestamp || Date.now()
      };
    }
    
    console.log(`🏠 Socket ${socket.id} joining room: ${chatId}`);
    console.log(`📊 Room join info:`, roomInfo);
    socket.join(chatId);
    
    // Send room join confirmation back to client
    socket.emit('room-connectivity-test', {
      chatId: chatId,
      socketId: socket.id,
      canReceive: true,
      participantCount: io.sockets.adapter.rooms.get(chatId)?.size || 0,
      timestamp: Date.now()
    });
  });

  socket.on('user-joined-chat', (data) => {
    console.log(`👥 User joined chat - Data:`, data);
    socket.join(data.chatId);
    console.log(`✅ Socket ${socket.id} joined chat room: ${data.chatId}`);
  });

  // Handle registration verification requests
  socket.on('verify-registration', (data) => {
    let userId, verificationData;
    
    if (typeof data === 'string') {
      userId = data;
      verificationData = { userId };
    } else {
      userId = data.userId;
      verificationData = data;
    }
    
    console.log(`🔍 Registration verification request for user: ${userId}`);
    
    const isRegistered = onlineUsersManager.has(userId);
    const socketId = onlineUsersManager.getSocketId(userId);
    const allOnlineUsers = onlineUsersManager.getAll();
    
    // Check if socket still exists
    const socketExists = socketId ? io.sockets.sockets.has(socketId) : false;
    
    socket.emit('registration-verified', {
      userId: userId,
      socketId: socketId || socket.id,
      isOnline: isRegistered,
      timestamp: Date.now(),
      socketExists: socketExists,
      currentSocketMatches: socketId === socket.id,
      totalOnlineUsers: allOnlineUsers.size,
      verificationRequested: true
    });
    
    console.log(`✅ Verification response sent - User: ${userId}, Registered: ${isRegistered}, Socket exists: ${socketExists}, Current socket matches: ${socketId === socket.id}`);
  });

  // Handle heartbeat to maintain connection
  socket.on('heartbeat', (data) => {
    const userId = data.userId;
    const isRegistered = onlineUsersManager.has(userId);
    const currentSocketId = onlineUsersManager.getSocketId(userId);
    
    console.log(`💓 Heartbeat from user: ${userId}, Socket: ${socket.id}, Registered: ${isRegistered}, Current socket: ${currentSocketId}`);
    
    // If user is not registered or has different socket, re-register
    if (!isRegistered || currentSocketId !== socket.id) {
      console.log(`⚠️ Heartbeat: Re-registering user ${userId} with socket ${socket.id}`);
      
      // Remove any existing registration
      if (isRegistered) {
        onlineUsersManager.remove(userId);
      }
      
      // Re-register with current socket
      onlineUsersManager.add(userId, socket.id);
      socket.userId = userId;
      
      // Log updated online users
      const allOnlineUsers = onlineUsersManager.getAll();
      console.log(`📊 Online users after heartbeat re-registration: ${JSON.stringify(Object.fromEntries(allOnlineUsers))}`);
      
      // Broadcast updated user status
      io.emit('user-status', { userId, isOnline: true, lastOnline: null });
      console.log(`📡 Re-emitted user-status for ${userId}: online`);
    }
    
    // Send heartbeat acknowledgment
    socket.emit('heartbeat-ack', {
      userId: userId,
      socketId: socket.id,
      isRegistered: true,
      timestamp: Date.now()
    });
    
    console.log(`💓 Heartbeat ACK sent to user: ${userId}`);
  });

  // Handle connection testing
  socket.on('test-connection', (data) => {
    console.log(`🧪 Connection test from user: ${data.userId}, Chat: ${data.chatId}`);
    
    socket.emit('test-connection-result', {
      userId: data.userId,
      chatId: data.chatId,
      socketId: socket.id,
      connected: true,
      timestamp: Date.now()
    });
  });

  // Handle room connectivity testing
  socket.on('test-room-connectivity', (data) => {
    console.log(`🏠🧪 Room connectivity test for chat: ${data.chatId}, Socket: ${socket.id}`);
    
    const roomSize = io.sockets.adapter.rooms.get(data.chatId)?.size || 0;
    
    socket.emit('room-connectivity-test', {
      chatId: data.chatId,
      socketId: socket.id,
      canReceive: true,
      participantCount: roomSize,
      timestamp: Date.now()
    });
  });

  socket.on('send-message', async (messageData) => {
    console.log(`📤 Send message event received from socket ${socket.id}:`, {
      chatID: messageData.chatID,
      senderID: messageData.senderID,
      text: messageData.text?.substring(0, 50) + '...',
      timestamp: messageData.timestamp
    });

    try {
      // First emit to the room
      io.to(messageData.chatID).emit('receive-message', messageData);
      console.log(`📨 Message emitted to chat room: ${messageData.chatID}`);
      
      // Log room participants for debugging
      const roomSockets = io.sockets.adapter.rooms.get(messageData.chatID);
      console.log(`🏠 Room ${messageData.chatID} has ${roomSockets?.size || 0} connected sockets: ${roomSockets ? Array.from(roomSockets).join(', ') : 'none'}`);

      const chatListUpdate = {
        chatId: messageData.chatID,
        lastMessage: messageData.text || '',
        senderName: messageData.senderName || 'Unknown User',
        timestamp: messageData.timestamp || new Date().toISOString()
      };
      
      try {
        const chat = await Chat.findById(messageData.chatID).populate('participants');
        console.log(`📋 Chat participants found: ${chat?.participants?.length || 0}`);
        
        if (chat && chat.participants) {
          console.log(`📋 Processing chat-list-update for ${chat.participants.length} participants`);
          const allOnlineUsers = onlineUsersManager.getAll();
          console.log(`📋 Online users currently: ${JSON.stringify(Object.fromEntries(allOnlineUsers))}`);
          
          chat.participants.forEach(participant => {
            const participantId = participant._id.toString();
            console.log(`🔍 Checking participant: ${participantId}`);
            
            const participantSocketId = onlineUsersManager.getSocketId(participantId);
            if (participantSocketId) {
              console.log(`✅ Found participant ${participantId} with socket ${participantSocketId}`);
              
              // Verify the socket still exists
              const participantSocket = io.sockets.sockets.get(participantSocketId);
              if (participantSocket) {
                io.to(participantSocketId).emit('chat-list-update', chatListUpdate);
                console.log(`📊 Chat list update sent to user ${participantId} via socket ${participantSocketId}`);
              } else {
                console.log(`⚠️ Socket ${participantSocketId} for participant ${participantId} no longer exists, removing from online users`);
                onlineUsersManager.remove(participantId);
              }
            } else {
              console.log(`⚠️ No socket found for participant ${participantId}`);
              
              // Check if user has a socket but wasn't properly registered
              let foundSocket = null;
              io.sockets.sockets.forEach((sock, sockId) => {
                if (sock.userId === participantId) {
                  foundSocket = sockId;
                  console.log(`🔧 Found unregistered socket ${sockId} for user ${participantId}, re-registering...`);
                  onlineUsersManager.add(participantId, sockId);
                  io.to(sockId).emit('chat-list-update', chatListUpdate);
                  console.log(`📊 Chat list update sent to re-registered user ${participantId}`);
                }
              });
              
              if (!foundSocket) {
                console.log(`🔍 Available online users: ${Array.from(allOnlineUsers.keys()).join(', ')}`);
              }
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
        console.log(`📧 Checking receiver ${receiverId}: isOnline = ${isOnline}`);

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
              console.log(`📱 FCM notification sent to offline user ${receiverId}`);
            }
          } catch (fcmError) {
            console.error(`❌ Error sending FCM to ${receiverId}:`, fcmError);
          }
        } else {
          console.log(`✅ Receiver ${receiverId} is online, message should be delivered via socket`);
        }
      }
    } catch (err) {
      console.error('❌ Error handling send-message:', err);
    }
  });


socket.on('reaction-added', async (data) => {
  try {
    console.log(`😊 Reaction added event - User: ${data.userName} (${data.userId}), Message: ${data.messageId}, Emoji: ${data.emoji}, Chat: ${data.chatId}`);
    
    // Emit to the chat room first
    socket.to(data.chatId).emit('reaction-added', {
      messageId: data.messageId,
      userId: data.userId,
      userName: data.userName,
      emoji: data.emoji,
      timestamp: data.timestamp
    });
    
    // Also emit directly to each participant to ensure delivery
    try {
      const chat = await Chat.findById(data.chatId).populate('participants');
      if (chat && chat.participants) {
        console.log(`😊 Sending reaction to ${chat.participants.length} participants`);
        const allOnlineUsers = onlineUsersManager.getAll();
        
        chat.participants.forEach(participant => {
          const participantId = participant._id.toString();
          
          // Skip the sender
          if (participantId === data.userId) return;
          
          console.log(`😊 Checking participant: ${participantId} for reaction delivery`);
          
          const participantSocketId = onlineUsersManager.getSocketId(participantId);
          if (participantSocketId) {
            console.log(`✅ Sending reaction to participant ${participantId} via socket ${participantSocketId}`);
            
            // Verify the socket still exists
            const participantSocket = io.sockets.sockets.get(participantSocketId);
            if (participantSocket) {
              io.to(participantSocketId).emit('reaction-added', {
                messageId: data.messageId,
                userId: data.userId,
                userName: data.userName,
                emoji: data.emoji,
                timestamp: data.timestamp
              });
              console.log(`😊 Reaction delivered to user ${participantId}`);
            } else {
              console.log(`⚠️ Socket ${participantSocketId} for participant ${participantId} no longer exists, removing from online users`);
              onlineUsersManager.remove(participantId);
            }
          } else {
            console.log(`⚠️ No socket found for participant ${participantId} for reaction delivery`);
            
            // Check if user has a socket but wasn't properly registered
            let foundSocket = null;
            io.sockets.sockets.forEach((sock, sockId) => {
              if (sock.userId === participantId) {
                foundSocket = sockId;
                console.log(`🔧 Found unregistered socket ${sockId} for user ${participantId}, re-registering and sending reaction...`);
                onlineUsersManager.add(participantId, sockId);
                io.to(sockId).emit('reaction-added', {
                  messageId: data.messageId,
                  userId: data.userId,
                  userName: data.userName,
                  emoji: data.emoji,
                  timestamp: data.timestamp
                });
                console.log(`😊 Reaction sent to re-registered user ${participantId}`);
              }
            });
            
            if (!foundSocket) {
              console.log(`🔍 User ${participantId} completely offline for reaction`);
            }
          }
        });
      }
    } catch (chatError) {
      console.error('❌ Error fetching chat for reaction delivery:', chatError);
    }
    
    // Send FCM notifications to offline participants
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
            console.log(`📱 Reaction FCM sent to offline user ${participant._id}`);
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
    console.log(`😔 Reaction removed event - User: ${data.userName} (${data.userId}), Message: ${data.messageId}, Emoji: ${data.emoji}, Chat: ${data.chatId}`);
    
    // Emit to the chat room first
    socket.to(data.chatId).emit('reaction-removed', {
      messageId: data.messageId,
      userId: data.userId,
      userName: data.userName,
      emoji: data.emoji,
      timestamp: data.timestamp
    });
    
    // Also emit directly to each participant to ensure delivery
    try {
      const chat = await Chat.findById(data.chatId).populate('participants');
      if (chat && chat.participants) {
        console.log(`😔 Sending reaction removal to ${chat.participants.length} participants`);
        
        chat.participants.forEach(participant => {
          const participantId = participant._id.toString();
          
          // Skip the sender
          if (participantId === data.userId) return;
          
          console.log(`😔 Checking participant: ${participantId} for reaction removal delivery`);
          
          const participantSocketId = onlineUsersManager.getSocketId(participantId);
          if (participantSocketId) {
            console.log(`✅ Sending reaction removal to participant ${participantId} via socket ${participantSocketId}`);
            
            // Verify the socket still exists
            const participantSocket = io.sockets.sockets.get(participantSocketId);
            if (participantSocket) {
              io.to(participantSocketId).emit('reaction-removed', {
                messageId: data.messageId,
                userId: data.userId,
                userName: data.userName,
                emoji: data.emoji,
                timestamp: data.timestamp
              });
              console.log(`😔 Reaction removal delivered to user ${participantId}`);
            } else {
              console.log(`⚠️ Socket ${participantSocketId} for participant ${participantId} no longer exists, removing from online users`);
              onlineUsersManager.remove(participantId);
            }
          } else {
            console.log(`⚠️ No socket found for participant ${participantId} for reaction removal delivery`);
            
            // Check if user has a socket but wasn't properly registered
            let foundSocket = null;
            io.sockets.sockets.forEach((sock, sockId) => {
              if (sock.userId === participantId) {
                foundSocket = sockId;
                console.log(`🔧 Found unregistered socket ${sockId} for user ${participantId}, re-registering and sending reaction removal...`);
                onlineUsersManager.add(participantId, sockId);
                io.to(sockId).emit('reaction-removed', {
                  messageId: data.messageId,
                  userId: data.userId,
                  userName: data.userName,
                  emoji: data.emoji,
                  timestamp: data.timestamp
                });
                console.log(`😔 Reaction removal sent to re-registered user ${participantId}`);
              }
            });
            
            if (!foundSocket) {
              console.log(`🔍 User ${participantId} completely offline for reaction removal`);
            }
          }
        });
      }
    } catch (chatError) {
      console.error('❌ Error fetching chat for reaction removal delivery:', chatError);
    }
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
    console.log(`🔄 Message status sync requested by user ${data.userId} for chat ${data.chatId || 'all chats'}`);
    
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
      
      console.log(`📋 Found ${messages.length} messages to sync status for user ${data.userId}`);
      
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
      
      console.log(`✅ Status sync completed - Sent ${syncCount} status updates to user ${data.userId}`);
      
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
        const { audioData, chatId, userId, timestamp, priority } = data;
        
        // Immediate forwarding for low latency - no extensive logging
        socket.to(chatId).emit('voice-data', {
            audioData: audioData,
            userId: userId,
            timestamp: timestamp
        });
        
        // Only log errors or high-priority issues
        if (!audioData || !userId) {
            console.error('❌ Invalid voice data received');
        }
    } catch (error) {
        console.error('❌ Error handling voice data:', error);
    }
});

  socket.on('message-delivered', async (data) => {
    console.log(`📬 Message delivered event - MessageId: ${data.messageId}, UserId: ${data.userId}, ChatId: ${data.chatId}`);
    
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
        console.log(`✅ Message ${data.messageId} marked as delivered for user ${data.userId}`);
        io.to(data.chatId).emit('message-status-update', {
          messageId: data.messageId,
          status: 'delivered',
          userId: data.userId,
          timestamp: new Date()
        });
      } else {
        console.log(`⚠️ Message ${data.messageId} not found for delivery update`);
      }
    } catch (error) {
      console.error('❌ Error updating delivered status:', error);
    }
  });

  socket.on('message-read', async (data) => {
    console.log(`👁️ Message read event - MessageId: ${data.messageId}, UserId: ${data.userId}, ChatId: ${data.chatId}`);
    
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
        console.log(`✅ Message ${data.messageId} marked as read by user ${data.userId}`);
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
          } else {
            console.log(`⚠️ Sender ${message.senderID._id.toString()} socket not found for read notification`);
          }
        }
      } else {
        console.log(`⚠️ Message ${data.messageId} not found for read update`);
      }
    } catch (error) {
      console.error('❌ Error updating read status:', error);
    }
  });

  socket.on('typing-start', (data) => {
    console.log(`⌨️ Typing start - User ${data.userId} (${data.userName}) in chat ${data.chatId}`);
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
    console.log(`⌨️ Typing stop - User ${data.userId} in chat ${data.chatId}`);
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
    console.log(`📞 Call initiate event - CallId: ${data.callId}, Caller: ${data.callerId}, Receiver: ${data.receiverId}`);
    
    const receiverSocketId = onlineUsersManager.getSocketId(data.receiverId);
    if (receiverSocketId) {
      console.log(`📡 Receiver ${data.receiverId} found online with socket ${receiverSocketId}`);
      io.to(receiverSocketId).emit('incoming-call', {
        callId: data.callId,
        chatId: data.chatId,
        callerId: data.callerId,
        callerName: data.callerName || 'Unknown Caller',
        isVideoCall: data.isVideoCall,
        timestamp: data.timestamp
      });
      console.log(`✅ Incoming call event sent to receiver ${data.receiverId}`);
    } else {
      console.log(`⚠️ Receiver ${data.receiverId} not found in online users manager, checking all sockets...`);
      let callAttempted = false;
      
      io.sockets.sockets.forEach((clientSocket) => {
        if (clientSocket.userId === data.receiverId) {
          console.log(`📡 Found receiver ${data.receiverId} in socket collection with socket ${clientSocket.id}`);
          clientSocket.emit('incoming-call', {
            callId: data.callId,
            chatId: data.chatId,
            callerId: data.callerId,
            callerName: data.callerName || 'Unknown Caller',
            isVideoCall: data.isVideoCall,
            timestamp: data.timestamp
          });
          callAttempted = true;
          console.log(`✅ Incoming call event sent to receiver ${data.receiverId} via fallback method`);
        }
      });
      
      if (!callAttempted) {
        console.log(`❌ Receiver ${data.receiverId} is completely offline, sending call-failed event`);
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

  // Handle force call termination
  socket.on('call-force-end', (data) => {
    console.log(`🚫 Force call termination - Call ID: ${data.callId}, Reason: ${data.reason}`);
    
    const callerSocketId = onlineUsersManager.getSocketId(data.callerId);
    const receiverSocketId = onlineUsersManager.getSocketId(data.receiverId);
    
    const forceEndData = {
      callId: data.callId,
      reason: data.reason,
      forceStop: true,
      timestamp: data.timestamp
    };
    
    // Send force termination to both participants
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-force-end', forceEndData);
      console.log(`🚫 Force termination sent to caller ${data.callerId}`);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call-force-end', forceEndData);
      console.log(`🚫 Force termination sent to receiver ${data.receiverId}`);
    }
    
    // Also send regular call-ended as fallback
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-ended', { callId: data.callId, timestamp: data.timestamp });
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call-ended', { callId: data.callId, timestamp: data.timestamp });
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

  socket.on('video-data', (data) => {
    try {
        const { videoData, chatId, userId, timestamp, priority } = data;
        
        // Immediate forwarding for low latency
        socket.to(chatId).emit('video-data', {
            videoData: videoData,
            userId: userId,
            timestamp: timestamp
        });
        
        // Minimal logging for performance
        if (!videoData || !userId) {
            console.error('❌ Invalid video data received');
        }
    } catch (error) {
        console.error('❌ Error handling video data:', error);
    }
});

  socket.on('disconnect', async (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id}, Reason: ${reason}`);
    
    // Log additional disconnect details
    const disconnectTime = new Date().toISOString();
    console.log(`🔌 Disconnect details - Time: ${disconnectTime}, Reason: ${reason}`);
    
    if (reason === 'transport close') {
      console.log(`🔌 Client closed connection or navigated away`);
    } else if (reason === 'ping timeout') {
      console.log(`🔌 Connection lost due to ping timeout (poor network or client unresponsive)`);
    } else if (reason === 'transport error') {
      console.log(`🔌 Network transport error occurred`);
    } else if (reason === 'server shutdown') {
      console.log(`🔌 Server is shutting down`);
    } else if (reason === 'client namespace disconnect') {
      console.log(`🔌 Client explicitly disconnected from namespace`);
    } else {
      console.log(`🔌 Unknown disconnect reason: ${reason}`);
    }
    
    // Try to find user by socket ID first
    let userId = onlineUsersManager.removeBySocketId(socket.id);
    
    // If not found by socket ID, try to find by stored userId on socket
    if (!userId && socket.userId) {
      userId = socket.userId;
      onlineUsersManager.remove(userId);
      console.log(`🔧 Removed user ${userId} by stored socket.userId`);
    }
    
    if (userId) {
      console.log(`�👤 User ${userId} disconnected and removed from online users`);
      
      // Log updated online users
      const allOnlineUsers = onlineUsersManager.getAll();
      console.log(`📊 Online users after disconnect: ${JSON.stringify(Object.fromEntries(allOnlineUsers))}`);
      
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
        console.log(`📡 User offline status emitted for ${userId}`);
      } catch (err) {
        console.error(`❌ Error updating lastOnline for user ${userId}:`, err);
      }
    } else {
      console.log(`⚠️ No user found for disconnected socket ${socket.id}`);
      
      // Additional debugging - check if any orphaned entries exist
      const allOnlineUsers = onlineUsersManager.getAll();
      const orphanedEntries = [];
      allOnlineUsers.forEach((socketId, userId) => {
        if (!io.sockets.sockets.has(socketId)) {
          orphanedEntries.push({ userId, socketId });
        }
      });
      
      if (orphanedEntries.length > 0) {
        console.log(`🧹 Found ${orphanedEntries.length} orphaned entries, cleaning up:`, orphanedEntries);
        orphanedEntries.forEach(({ userId }) => {
          onlineUsersManager.remove(userId);
        });
      }
    }
  });

  socket.on('user-logout', async (userId) => {
    console.log(`👋 User logout event - UserId: ${userId}`);
    onlineUsersManager.remove(userId);
    console.log(`✅ User ${userId} removed from online users on logout`);

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
      console.log(`📡 User logout status emitted for ${userId}`);
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