import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Direct local MongoDB connection (no .env needed)
    await mongoose.connect("mongodb://127.0.0.1:27017/omnivibe", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected: localhost:27017/omnivibe");
  } catch (error) {
    console.error("❌ DB Connection Failed", error);
    process.exit(1);
  }
};
