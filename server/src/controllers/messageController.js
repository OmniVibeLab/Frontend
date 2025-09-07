import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// Get conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "username fullName avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender receiver", select: "username fullName avatar" }
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, receiverId, content } = req.body;

    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      content
    });

    await message.save();

    // Update lastMessage in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      $inc: { unreadCount: 1 }
    });

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
