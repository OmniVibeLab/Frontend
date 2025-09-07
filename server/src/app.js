import express from "express";
import cors from "cors";
import { connectDB } from "./config/database.js";
import { requestLogger, errorLogger } from "./middleware/logging.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import newPostRoutes from "./routes/postRoutes.js";
import followRoutes from "./routes/followRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "OmniVibe API Server",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: [
        "POST /api/register",
        "POST /api/login"
      ],
      posts: [
        "GET /api/posts",
        "POST /api/posts", 
        "DELETE /api/posts/:id",
        "PATCH /api/posts/:id"
      ],
      test: [
        "GET /api/test"
      ]
    }
  });
});

// Routes
app.use("/api", authRoutes);
app.use("/api/posts", newPostRoutes); // Use the new comprehensive post routes
app.use("/api/follow", followRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Test endpoint (for backward compatibility)
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Server is working!", 
    timestamp: new Date().toISOString(),
    database: "connected",
    version: "1.0.0"
  });
});

// Error handling middleware
app.use(errorLogger);

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404 - Endpoint not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      "GET /",
      "GET /api/test",
      "POST /api/register",
      "POST /api/login", 
      "GET /api/posts",
      "POST /api/posts",
      "DELETE /api/posts/:id",
      "PATCH /api/posts/:id"
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🚨 Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;