import express from "express";
import { getConversations, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

// GET all conversations of a user
router.get("/conversations/:userId", getConversations);

// POST send message
router.post("/send", sendMessage);

export default router;
