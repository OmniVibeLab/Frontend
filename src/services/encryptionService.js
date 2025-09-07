import CryptoJS from 'crypto-js';

class EncryptionService {
  constructor() {
    this.secretKey = process.env.REACT_APP_ENCRYPTION_KEY || 'omnivibe-secret-key-2024';
  }

  // Generate a unique key for each conversation
  generateConversationKey(userId1, userId2) {
    const sortedIds = [userId1, userId2].sort();
    const combined = sortedIds.join('_');
    return CryptoJS.SHA256(combined + this.secretKey).toString();
  }

  // Encrypt message content
  encryptMessage(content, conversationKey) {
    try {
      const encrypted = CryptoJS.AES.encrypt(content, conversationKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return content; // Return original content if encryption fails
    }
  }

  // Decrypt message content
  decryptMessage(encryptedContent, conversationKey) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedContent, conversationKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedContent; // Return encrypted content if decryption fails
    }
  }

  // Encrypt message for sending
  encryptMessageForSending(content, senderId, receiverId) {
    const conversationKey = this.generateConversationKey(senderId, receiverId);
    return this.encryptMessage(content, conversationKey);
  }

  // Decrypt received message
  decryptReceivedMessage(encryptedContent, senderId, receiverId) {
    const conversationKey = this.generateConversationKey(senderId, receiverId);
    return this.decryptMessage(encryptedContent, conversationKey);
  }

  // Hash sensitive data
  hashData(data) {
    return CryptoJS.SHA256(data + this.secretKey).toString();
  }

  // Generate secure random string
  generateSecureRandom(length = 32) {
    return CryptoJS.lib.WordArray.random(length).toString();
  }
}

// Create singleton instance
const encryptionService = new EncryptionService();
export default encryptionService;
