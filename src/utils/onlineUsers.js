const onlineUsers = new Map();

module.exports = {
  add: (userId, socketId) => {
    onlineUsers.set(userId, socketId);
    console.log(`Added user ${userId} with socket ${socketId}. Total online: ${onlineUsers.size}`);
  },
  
  remove: (userId) => {
    const removed = onlineUsers.delete(userId);
    console.log(`Removed user ${userId}. Success: ${removed}. Total online: ${onlineUsers.size}`);
    return removed;
  },
  
  has: (userId) => {
    return onlineUsers.has(userId);
  },
  
  getSocketId: (userId) => {
    return onlineUsers.get(userId);
  },
  
  removeBySocketId: (socketId) => {
    for (const [userId, id] of onlineUsers.entries()) {
      if (id === socketId) {
        onlineUsers.delete(userId);
        console.log(`Removed user ${userId} by socket ${socketId}. Total online: ${onlineUsers.size}`);
        return userId;
      }
    }
    return null;
  },
  
  getAll: () => {
    return new Map(onlineUsers);
  },
  
  clear: () => {
    onlineUsers.clear();
    console.log('Cleared all online users');
  },
  
  size: () => {
    return onlineUsers.size;
  }
};