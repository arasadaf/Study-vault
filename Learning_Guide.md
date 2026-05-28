# 🎓 Study Vault - Comprehensive Learning & Viva Guide

This file contains everything you need to know about how this project was implemented, the technologies used, and how to answer technical questions during your project review.

---

## 🏗️ 1. Architecture and Tech Stack

**Study Vault is built using the MERN stack (MongoDB, Express, React, Node.js) with real-time capabilities powered by Socket.io.**

If the examiner asks "Why did you choose these technologies?", here is your answer:

1. **React (Frontend)**: 
   - *Why:* React builds a **Single Page Application (SPA)**. Instead of reloading the entire webpage every time you click a link, React updates the UI components instantly. This makes the application fast and responsive like a native app.
   - *Tools:* We used **Vite** as our build tool. Vite is incredibly fast during development because it serves modules directly to the browser without bundling them first, unlike Webpack (Create React App).

2. **Node.js & Express (Backend)**:
   - *Why:* Node.js uses JavaScript, allowing us to write both frontend and backend in a unified language. **Express** is a lightweight framework that handles HTTP REST routing (like `/api/auth`) and middleware easily.

3. **MongoDB & Mongoose (Database)**:
   - *Why:* MongoDB is a **NoSQL database**. Because our data (like whiteboard strokes or chat arrays) is dynamic, NoSQL's flexible JSON-like documents are much better than rigid SQL tables. **Mongoose** is an Object Data Modeling (ODM) library that helps us enforce schemas (e.g., ensuring emails are unique) before saving to MongoDB.

4. **Socket.io (Real-Time Communication)**:
   - *Why:* HTTP is unidirectional (client asks, server answers). For a collaborative study room, if someone draws on a board, the server needs to instantly push that data to others without them asking. Socket.io uses **WebSockets** for a bi-directional, persistent connection.

5. **Tailwind CSS (Styling)**:
   - *Why:* Instead of writing custom CSS, Tailwind provides utility classes (like `flex`, `bg-beige-500`). This ensures our styling is consistent and scales perfectly on all devices.

---

## 🗄️ 2. Database Design & Logic

Our database runs on **MongoDB Atlas** (cloud-hosted). We designed several specific schemas:

1. **User Schema**: 
   - Stores authentication details. 
   - **Mongoose Hooks**: We used a `pre('save')` hook. This hook automatically calculates a user's `level` based on their `xp` (Experience Points) right before saving.
   - **Virtuals**: We used a "Virtual Field" for `tier` (Bronze, Silver, Gold). Virtuals are calculated on-the-fly and aren't permanently stored in the DB, saving storage space.
2. **RoomState Schema**: 
   - Stores real-time collaboration data. Instead of saving every single whiteboard stroke in a massive SQL table, we push it to an array inside a MongoDB document.
3. **Doubt Schema**: 
   - Uses the NoSQL concept of **embedding**. Answers are stored as an array directly inside the question document, rather than "referencing" them with foreign keys like in SQL.

---

## 🔒 3. Authentication Flow (JWT & Google OAuth)

### Standard Email/Password
1. The user registers. The backend hashes the password using **Bcrypt** (`bcryptjs`) before saving it to the database for security.
2. Upon login, the backend compares passwords. If valid, it generates a **JSON Web Token (JWT)**.
3. The JWT acts as a digital passport. The frontend stores it and attaches it to the HTTP headers of future requests. The backend verifies this token to ensure the user is logged in.

### Google OAuth 2.0
1. We integrated `@react-oauth/google` on the frontend.
2. When the user clicks the Google button, a Google-hosted popup appears.
3. Upon success, Google returns a credential token. The frontend sends this to our backend (`/api/auth/google`).
4. Our backend verifies this token securely using the `google-auth-library`. If valid, we create a user in our database (if they don't exist) and issue our own JWT.

---

## ⚡ 4. Real-Time Collaboration (Socket.io)

In `Backend/index.js`, we wrapped our Express server with Socket.io.
- When a user draws on the whiteboard, the React frontend emits a `draw` event.
- The backend listens for this via `socket.on('draw', ...)`.
- The backend immediately broadcasts this to everyone else in the room using `socket.to(roomId).emit('draw', data)`.
- We periodically save this whiteboard array to MongoDB so if someone joins late, they receive the full board history.

---

## 🚀 5. Deployment Strategy

Our architecture is split into two distinct cloud platforms for maximum efficiency:

1. **Backend deployed on Render**:
   - Render is a Platform-as-a-Service (PaaS). We deployed our backend here using a **Blueprint (`render.yaml`)** file.
   - *Why Render?* Express with Socket.io requires a persistent, long-running server instance to keep WebSockets alive. Serverless platforms (like Vercel) terminate connections after a few seconds, which breaks Socket.io.
   - The Render backend connects directly to our MongoDB Atlas cloud cluster.

2. **Frontend deployed on Vercel**:
   - *Why Vercel?* Vercel is highly optimized for Vite and React apps. It builds our frontend into a static bundle and serves it on an extremely fast, global Edge CDN.
   - We connected the frontend to the backend by setting the `VITE_BACKEND_URL` environment variable in the Vercel dashboard to point to our live Render link.

---

## 💡 6. Top Viva/Review Questions to Prepare For

**Q: What happens if two people draw on the whiteboard at the exact same time?**
> A: Because we use Socket.io, WebSockets process incoming events asynchronously and sequentially on the Node.js event loop. Both strokes will be broadcasted to all clients almost instantly, and React will render both paths.

**Q: Why didn't you use SQL/MySQL?**
> A: Our application relies heavily on arrays of unstructured data (like chat histories, drawing strokes, and arrays of answers inside doubts). NoSQL databases like MongoDB handle nested arrays seamlessly without requiring complex table joins.

**Q: How is the application secured?**
> A: We use Bcrypt to hash user passwords so they are never stored as plain text. We use stateless JWTs for session management, and we enforce CORS (Cross-Origin Resource Sharing) on the backend to only accept requests from our specific Vercel frontend domain.

**Q: Why did you use Vite instead of Create React App?**
> A: Create React App uses Webpack, which bundles the entire application before the dev server starts, making it slow as the app grows. Vite uses native ES Modules, meaning it starts the server instantly and only compiles the files being edited.
