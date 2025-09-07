import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/omnivibe";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ MongoDB connected successfully");
    console.log(`📍 Database: ${conn.connection.name}`);
    console.log(`🔗 Host: ${conn.connection.host}:${conn.connection.port}`);
    
    return conn;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Connection event listeners
mongoose.connection.on("connected", () => {
  console.log("🔗 MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("🔒 MongoDB connection closed due to app termination");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error closing MongoDB connection:", err);
    process.exit(1);
  }
});