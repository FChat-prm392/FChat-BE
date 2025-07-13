const onlineUsers = new Map();

module.exports = {
  add: (userId, socketId) => {
    onlineUsers.set(userId, socketId);
    console.log(` User ${userId} is now online`);
  },
  
  remove: (userId) => {
    const removed = onlineUsers.delete(userId);
    if (removed) {
      console.log(` User ${userId} is now offline`);
    }
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
        console.log(` User ${userId} disconnected via socket ${socketId}`);
        return userId;
      }
    }
    return null;
  },
  
  getAll: () => {
    return new Map(onlineUsers);
  },
  
  getOnlineCount: () => {
    return onlineUsers.size;
  }
};