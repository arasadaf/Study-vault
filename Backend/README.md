<div align="center">

# 🖥️ Vault Backend

A scalable and secure backend server powering the **Vault Collaborative Study Platform**.
Built using **Express.js**, **MongoDB**, **Socket.io**, and **JWT Authentication**, this backend provides APIs and real-time sockets for study rooms, resources, doubts, and user management.

</div>

---

# 📌 Features

## 🔐 Authentication & Security

* JWT-based authentication
* Secure session handling
* Email OTP verification via Nodemailer
* Forgot Password flow
* Password hashing using bcryptjs

---

## 🤝 Real-Time Collaboration

* Socket.io integration for instant synchronization
* Real-time shared Whiteboard drawing events
* Real-time Chat messaging within rooms
* Live collaborative Notes synchronization

---

## 📚 Resource & Room Management

* Create custom rooms with IDs and passwords
* Topic-wise study material uploads via Multer
* Upvote/downvote system for community validation of resources
* Doubt Forum with question-answer system and bounty points

---

## 🎮 Gamification Engine

* Automated level-up logic based on XP
* Tier-based ranking system (Bronze to Diamond)
* Global Leaderboard generation

---

# 🛠️ Tech Stack

## Backend Framework

| Technology | Purpose |
| --- | --- |
| Node.js | JavaScript Runtime |
| Express.js | REST API Framework |
| MongoDB | NoSQL Database |
| Mongoose | ODM for MongoDB |
| Socket.io | WebSocket communication |

---

## Security & Utilities

| Package | Purpose |
| --- | --- |
| jsonwebtoken | JWT token generation |
| bcryptjs | Password hashing |
| nodemailer | Email sending (OTPs) |
| multer | File uploads |
| dotenv | Environment variables |

---

# 📂 Project Structure

```bash
Backend/
│
├── models/
│   ├── User.js
│   ├── Room.js
│   ├── Resource.js
│   └── Doubt.js
│
├── routes/
│   ├── auth.js
│   ├── rooms.js
│   ├── resources.js
│   └── doubts.js
│
├── utils/
│   └── emailService.js
│
├── uploads/       # Stored files
├── package.json
└── server.js      # Main Express & Socket.io server
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
```

---

# 🧠 Database Design

## 👤 User Schema

| Field | Type | Description |
| --- | --- | --- |
| name | String | User's full name |
| email | String | Unique email address |
| password | String | Hashed password |
| isVerified | Boolean | Email verification status |
| xp | Number | Gamification experience points |
| level | Number | Current user level |
| tier | String | Bronze / Silver / Gold / Platinum / Diamond |

---

## 🚪 Room Schema

| Field | Type | Description |
| --- | --- | --- |
| roomId | String | Custom unique room ID |
| name | String | Display name of the room |
| password | String | Room access password (hashed) |
| creator | ObjectId | Reference to User who created it |
| participants| Array | Active users in the room |

---

## 📚 Resource & Doubt Schemas

* **Resource**: Tracks `title`, `topic`, `fileUrl`, `uploader`, `upvotes`, and `downvotes`.
* **Doubt**: Tracks `question`, `description`, `bounty`, `author`, `answers` (nested array), and `isResolved`.

---

# 🔒 Authentication Flow

```text
User Login
   ↓
Password Verified & JWT Token Generated
   ↓
Token Sent to Client
   ↓
Auth Middleware validates token on protected routes
```

---

# 🌐 API Routes

## Auth Routes (`/api/auth`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/register` | Register new user & send OTP |
| POST | `/verify-otp` | Verify email OTP |
| POST | `/login` | Authenticate user & issue JWT |
| POST | `/forgot-password` | Initiate password reset |
| POST | `/reset-password` | Set new password |

## Room Routes (`/api/rooms`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/create` | Create a new study room |
| POST | `/join` | Join an existing room |
| GET | `/my-rooms` | Fetch user's room history |

## Resource Routes (`/api/resources`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/upload` | Upload a new topic-wise file |
| GET | `/:roomId` | Get resources for a specific room |
| POST | `/:id/vote` | Upvote or Downvote a resource |

## Doubt Routes (`/api/doubts`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/ask` | Post a new doubt |
| POST | `/:id/answer` | Answer a doubt |
| POST | `/:id/resolve`| Mark a doubt as resolved |

---

# 🚀 Running Locally

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
# or
npm start
```

---

# 👨‍💻 Author

Developed by Ara Sadaf 🚀
