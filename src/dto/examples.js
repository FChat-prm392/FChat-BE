// Example usage of DTOs - for testing and demonstration

const { 
  CreateAccountDto, 
  CreateChatDto, 
  CreateMessageDto, 
  validateDto 
} = require('./index');

// Example 1: Valid account creation
try {
  const validAccountData = {
    fullname: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "password123",
    fcmToken: "sample-fcm-token"
  };
  
  const accountDto = new CreateAccountDto(validAccountData);
  validateDto(accountDto);
  console.log(" Valid account DTO created successfully");
} catch (error) {
  console.log("❌ Account validation failed:", error.errors);
}

// Example 2: Invalid account creation (missing required fields)
try {
  const invalidAccountData = {
    fullname: "",
    email: "invalid-email",
    password: "123" // too short
  };
  
  const accountDto = new CreateAccountDto(invalidAccountData);
  validateDto(accountDto);
  console.log(" This shouldn't print");
} catch (error) {
  console.log("❌ Expected validation errors:", error.errors);
}

// Example 3: Valid chat creation
try {
  const validChatData = {
    isGroup: true,
    participants: ["user1", "user2", "user3"],
    groupName: "My Chat Group",
    createBy: "user1"
  };
  
  const chatDto = new CreateChatDto(validChatData);
  validateDto(chatDto);
  console.log(" Valid chat DTO created successfully");
} catch (error) {
  console.log("❌ Chat validation failed:", error.errors);
}

// Example 4: Valid message creation
try {
  const validMessageData = {
    senderID: "user1",
    chatID: "chat123",
    text: "Hello world!",
    media: [
      {
        type: "image",
        url: "https://example.com/image.jpg",
        fileName: "image.jpg"
      }
    ]
  };
  
  const messageDto = new CreateMessageDto(validMessageData);
  validateDto(messageDto);
  console.log(" Valid message DTO created successfully");
} catch (error) {
  console.log("❌ Message validation failed:", error.errors);
}

// Example 5: Response DTO usage
const { AccountResponseDto } = require('./index');

const mockAccount = {
  _id: "123",
  fullname: "John Doe",
  username: "johndoe",
  email: "john@example.com",
  password: "hashed-password", // This will be excluded in response
  fcmToken: "fcm-token", // This will be excluded in response
  gender: "male",
  status: true,
  createdAt: new Date()
};

const responseDto = new AccountResponseDto(mockAccount);
console.log("📤 Account response DTO:", JSON.stringify(responseDto, null, 2));

module.exports = {
  // Export examples for testing
  validAccountData: {
    fullname: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "password123"
  },
  validChatData: {
    isGroup: false,
    participants: ["user1", "user2"],
    createBy: "user1"
  },
  validMessageData: {
    senderID: "user1",
    chatID: "chat123",
    text: "Hello!"
  }
};
