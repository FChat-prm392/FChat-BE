const onlineUsers = new Map();

module.exports = {
  add: (userId, socketId) => {
    onlineUsers.set(userId, socketId);
  },
  
  remove: (userId) => {
    const removed = onlineUsers.delete(userId);
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