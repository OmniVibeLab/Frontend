// server/src/models/User.js
import mongoose from "mongoose";
import User from '../models/User.js';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  fullName: { 
    type: String, 
    trim: true 
  },
  avatar: { 
    type: String,
    default: null 
  },
  bio: { 
    type: String, 
    maxlength: 160 
  },
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const router = express.Router();

router.get("/", async(req, res) => {}

export default mongoose.model("User", userSchema);

