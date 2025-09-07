import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Register API
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists (by email or username)
    const existing = await User.findOne({
      $or: [{ email }, { username }]
    });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully", user: { id: user._id, username, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login API (email OR username)
export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({ message: "Please provide email/username and password" });
    }

    // Find user by email OR username
    const user = await User.findOne({
      $or: [{ email: email || "" }, { username: username || "" }]
    });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Return user info
    res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Profile (no token required)
export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
