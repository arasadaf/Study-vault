<div align="center">

# 🎨 Vault Frontend

The frontend application for **Vault**, built with **React (Vite)** and **Tailwind CSS**. Designed for high-performance, real-time collaboration with a modern, responsive, and premium aesthetic.

</div>

---

# 📌 Design & Aesthetics

Vault features a **Premium Dark Aesthetic** to ensure an immersive study environment:

* **Glassmorphism**: Subtle translucent panels with backdrop blurs.
* **Vibrant Gradients**: Custom Indigo-to-Purple gradients for a tech-focused feel.
* **Modern Typography**: Clean, crisp font choices for maximum readability.
* **Micro-animations**: Smooth transitions, scale effects on hover, and dynamic loading states.

---

# 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| **React (Vite)** | Lightning-fast build tool and frontend framework |
| **Tailwind CSS** | Utility-first styling for responsive layouts |
| **Socket.io-client** | Real-time bi-directional event handling |
| **React Router Dom** | Client-side routing and navigation |
| **Lucide React** | Premium vector iconography |
| **Axios** | HTTP client for API requests |

---

# 🚀 Key Features & Pages

## 🏠 Home & Dashboard

* **Hero Section**: Engaging introduction with quick access to join or create rooms.
* **My Rooms**: A dedicated dashboard tracking your recent study sessions and history.
* **Gamification Hub**: Visual tracking of XP, Levels, and Tier ranks (Bronze → Diamond), alongside the Global Leaderboard.

---

## 🏫 Study Room Workspace

The core collaborative space featuring 4 main integrated modules:

1. **Shared Whiteboard**: Real-time collaborative drawing, brainstorming, and diagramming.
2. **Shared Notes**: Collaborative, synchronized markdown-style note-taking.
3. **Resource Vault**: Topic-wise material storage with a community upvote/downvote system.
4. **Doubt Forum**: Interactive Q&A section where users can post questions, provide answers, and earn bounty rewards.

---

## 📱 Mobile Optimization

Vault is **fully mobile-responsive**:

* **Off-canvas Navigation**: Clean hamburger menu for mobile screens.
* **Adaptive Layouts**: Study room tools and sidebars collapse intelligently to maximize the workspace on smaller devices.
* **Touch-friendly Interactions**: Optimized buttons, inputs, and touch-drawing support for the Whiteboard.

---

# 📂 Project Structure

```bash
Frontend/
│
├── public/            # Static assets
├── src/
│   ├── assets/        # Images, Icons
│   ├── components/    # Reusable UI (AuthModal, Whiteboard, Chat)
│   ├── context/       # Global State (AuthContext, SocketContext)
│   ├── pages/         # Route views (Home, StudyRoom, MyRooms)
│   ├── App.jsx        # Root component
│   └── main.jsx       # Entry point
│
├── index.html
├── tailwind.config.js # Tailwind theme & plugins
└── vite.config.js     # Vite configuration
```

---

# 🔗 WebSocket Events

The frontend seamlessly handles these key Socket.io events:

* `join-room` / `leave-room`
* `draw-data`: Syncs whiteboard strokes
* `clear-whiteboard`: Syncs canvas clearing
* `receive-message`: Real-time chat updates
* `note-update`: Real-time text area synchronization

---

# 🚀 Running Locally

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

# 👨‍💻 Author

Developed by Ara Sadaf 🚀
