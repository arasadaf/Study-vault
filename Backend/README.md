# Vault - Collaborative Study Backend

This is the backend service for **Vault**, a production-level collaborative study platform. It handles authentication, real-time synchronization, resource management, and gamification logic.

## 🛠 Tools & Technologies

- **Node.js & Express**: The core engine for handling RESTful APIs and server logic.
- **MongoDB & Mongoose**: NoSQL database used for storing user profiles, study room metadata, resources, and doubts.
- **Socket.io**: Powers the real-time collaboration features, enabling instant synchronization across whiteboards, chats, and shared notes.
- **JWT (JSON Web Tokens)**: Secure user authentication and session management.
- **Bcrypt.js**: Industry-standard password hashing for user security.
- **Nodemailer**: Integrated email service for sending OTPs (Verification & Password Reset).
- **Multer**: Middleware for handling multi-part/form-data, used for topic-wise study material uploads.
- **Dotenv**: Management of sensitive environment variables (API keys, DB URIs).

## 🚀 Key Features

- **Secure Auth Flow**: Registration with email OTP verification and "Forgot Password" recovery.
- **Real-time Engine**: Centralized Socket.io logic for managing shared state in study rooms.
- **Resource Management**: Topic-wise file storage with an integrated upvote/downvote system.
- **Doubt Forum API**: Question-answer system with bounty points and XP rewards.
- **Gamification Engine**: Automated level-up logic and Tier-based ranking (Bronze to Diamond).

## 📂 Project Structure

- `/models`: Database schemas (User, Room, Resource, Doubt, etc.)
- `/routes`: API endpoints grouped by feature area.
- `/utils`: Helper services like the Email Service.
- `/uploads`: Storage directory for shared study materials.

## 🛠 Setup & Run

1. Install dependencies: `npm install`
2. Configure `.env` file with `MONGO_URI`, `JWT_SECRET`, and email credentials.
3. Start server: `npm start` or `nodemon server.js`
