import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// Send a message
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: "Sender, receiver, and content are required" });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });

    await message.save();
    await message.populate('sender', 'username fullName avatar');
    await message.populate('receiver', 'username fullName avatar');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get conversation between two users
router.get("/conversation/:userId1/:userId2", async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    })
    .populate('sender', 'username fullName avatar')
    .populate('receiver', 'username fullName avatar')
    .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all conversations for a user
router.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all unique conversation IDs for this user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(userId) },
            { receiver: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $last: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiver", mongoose.Types.ObjectId(userId)] },
                  { $eq: ["$isRead", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "senderInfo"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.receiver",
          foreignField: "_id",
          as: "receiverInfo"
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.put("/read/:conversationId/:userId", async (req, res) => {
  try {
    const { conversationId, userId } = req.params;
    
    await Message.updateMany(
      { 
        conversationId,
        receiver: userId,
        isRead: false
      },
      { isRead: true }
    );
    
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
