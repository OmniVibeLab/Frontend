# OmniVibe Backend Server

A modern Node.js/Express backend server for the OmniVibe social media application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation & Setup

#### Method 1: Automated Setup
```bash
cd "d:\web apps\omnivibe\server"
npm run setup
npm run dev
```

#### Method 2: Manual Setup
```bash
cd "d:\web apps\omnivibe\server"
npm install
npm run dev
```

#### Method 3: Windows Batch File
- Double-click `start-server.bat` in this folder

#### Method 4: PowerShell
```powershell
.\start-server.ps1
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |
| `npm run setup` | Install dependencies and setup |
| `npm test` | Run server tests |

## 🌐 API Endpoints

### Authentication
- `POST /api/register` - Create new user account
- `POST /api/login` - User login

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:id` - Delete post by ID
- `PATCH /api/posts/:id` - Update post (like/unlike)

### Utility
- `GET /api/test` - Server health check
- `GET /` - API documentation

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/omnivibe
FRONTEND_URL=http://localhost:3000
```

### Database Setup
1. **Local MongoDB**: Install MongoDB locally
2. **MongoDB Atlas**: Use cloud database (update MONGO_URI)

## 📊 Server Status

When the server starts successfully, you'll see:
```