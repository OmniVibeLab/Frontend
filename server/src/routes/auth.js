import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  console.log("📝 Registration attempt:", { ...req.body, password: "[HIDDEN]" });
  
  const { username, email, password, fullName, avatar } = req.body;
  
  // Validation
  if (!username || !email || !password) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ 
      message: "Username, email, and password are required",
      missing: {
        username: !username,
        email: !email,
        password: !password
      }
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("❌ Invalid email format:", email);
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Password validation
  if (password.length < 6) {
    console.log("❌ Password too short");
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  // Username validation
  if (username.length < 3) {
    console.log("❌ Username too short");
    return res.status(400).json({ message: "Username must be at least 3 characters long" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] 
    });
    
    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "email" : "username";
      console.log(`❌ User already exists with ${field}:`, field === "email" ? email : username);
      return res.status(400).json({ 
        message: `User with this ${field} already exists`,
        field 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      fullName: fullName?.trim() || "",
      avatar: avatar || null,
      joinedDate: new Date()
    });

    console.log("✅ User created successfully:", newUser.username);

    // Return user data (without password)
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      avatar: newUser.avatar,
      joinedDate: newUser.joinedDate
    };

    res.status(201).json({ 
      message: "User created successfully", 
      user: userResponse 
    });

  } catch (err) {
    console.error("❌ Registration error:", err);
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        message: `User with this ${field} already exists`,
        field 
      });
    }
    
    res.status(500).json({ 
      message: "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  console.log("🔐 Login attempt for:", req.body.email);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log("❌ Missing login credentials");
    return res.status(400).json({ 
      message: "Email and password are required",
      missing: {
        email: !email,
        password: !password
      }
    });
  }

  try {
    // Find user by email (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("❌ Invalid password for user:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("✅ Login successful for:", user.username);

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      bio: user.bio,
      joinedDate: user.joinedDate || user.createdAt
    };

    res.json({ 
      message: "Login successful", 
      user: userResponse 
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ 
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;