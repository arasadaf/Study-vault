<div align="center">

# 🎓 Vault - Collaborative Study Platform

A production-level full-stack application designed for students to collaborate, share resources, and solve doubts in real-time. Built using the **MERN Stack** and **Socket.io**.

</div>

---

# 📌 Project Overview

Vault is more than just a chat app. It's a structured academic platform that combines real-time collaboration with resource management and gamification to encourage active participation and learning.

## ✨ Core Features

* **Real-time Collaboration**: Shared whiteboards, notes, and chat powered by Socket.io.
* **Resource Management**: Structured, community-validated academic storage with upvote/downvote capabilities.
* **Doubt Forum**: Community-driven Q&A with bounty rewards.
* **Gamification**: XP, Levels, and Tiers to reward community contribution.
* **Responsive Design**: Fully optimized for Desktop and Mobile devices.

---

# 🛠️ Tech Stack

## Full Stack Technologies

| Layer | Technologies | Purpose |
| --- | --- | --- |
| **Frontend** | React, Vite | Lightning-fast UI framework |
| **Styling** | Tailwind CSS | Utility-first CSS for responsive design |
| **Backend** | Node.js, Express.js | REST API and Server logic |
| **Database** | MongoDB, Mongoose | NoSQL database |
| **Real-time** | Socket.io | Bi-directional communication for collaboration |

---

# 📂 Repository Structure

```bash
Vault/
│
├── Backend/      # Node.js/Express server
│   ├── models/   # Mongoose schemas
│   ├── routes/   # API endpoints
│   ├── utils/    # Helper functions (Email, etc.)
│   └── server.js # Entry point
│
└── Frontend/     # React application
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Route pages
    │   └── context/    # React Context (Auth, etc.)
    └── vite.config.js
```

---

# 🚀 Getting Started

## 1. Backend Setup

```bash
cd Backend
npm install
# Set up .env with MONGO_URI, JWT_SECRET, etc.
npm start
```

## 2. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

# 🛤️ Evolution of the Project

1. **Phase 1: Core Foundation**: Set up basic authentication and room management.
2. **Phase 2: Collaboration**: Implemented the real-time whiteboard and chat.
3. **Phase 3: Community Features**: Added topic-wise file uploads and the Doubt Forum.
4. **Phase 4: Gamification**: Integrated XP, Levels, and the Global Leaderboard.
5. **Phase 5: Refinement**: Mobile optimization and dedicated user dashboards.

---

# 👨‍💻 Author

Developed by Ara Sadaf 🚀
