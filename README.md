# 💬 Real-Time Chat App

A full-stack real-time chat application built with **React**, **Node.js**, **Express**, and **Socket.io**.

## 🚀 Features

- 🔗 Real-time messaging (global, private, and room-based)
- 🧑‍🤝‍🧑 Typing indicators
- 📷 File/Image sharing
- 😍 Message reactions
- ✅ Read receipts
- 🔔 Notifications (browser + sound)
- 📦 Pagination & search
- 📱 Mobile-friendly responsive UI

---

## 🧰 Tech Stack

- Frontend: React + Tailwind CSS
- Backend: Node.js, Express, Socket.io
- Deployment: Vercel (frontend), Render (backend)

---

## 📁 Project Structure

root/
├── client/ # React frontend
└── server/ # Express + Socket.io backend

---

## 🧪 Local Development

### 1️⃣ Clone the repo

```bash
git clone https://github.com/yourusername/realtime-chat-app.git
cd realtime-chat-app

2️⃣ Install dependencies
# In root/client
cd client
npm install

# In root/server
cd ../server
npm install
3️⃣ Run servers
# Start backend
cd server
npm run dev

# Start frontend (Vite)
cd ../client
npm run dev
App runs at:
Frontend: http://localhost:5173

Backend: http://localhost:5000

🌐 Deployment
🚀 Frontend (Vercel)
Go to https://vercel.com

Import GitHub repo

Set build command: npm run build

Set output directory: dist

Deploy!

🖥️ Backend (Render)
Go to https://render.com

Create new Web Service

Connect GitHub repo

Set start command: node server.js

Add environment variables if needed

Enable CORS for frontend URL

✅ TODO / Improvements
 Use MongoDB for persistent message storage

 Improve message read tracking with IntersectionObserver

 Add user avatars

 Add authentication (JWT)

🤝 Contributing
PRs are welcome! Please fork this repo and open a pull request.
License
MIT License

---

## ☁️ 2. Deployment Steps

### 🔼 A. Push Your Code to GitHub

In your project root:

```bash
git init
git remote add origin https://github.com/yourusername/realtime-chat-app.git
git add .
git commit -m "Initial commit"
git push -u origin main

🖥️ C. Deploy Backend to Render
Go to render.com

Create New → Web Service

Choose your GitHub repo

Set root directory to server/

Set:

Start command: node server.js

Environment: Node

Port: 5000 (Render auto-detects)

Enable free tier if available

✅ Your backend will get a public URL (e.g., https://chat-backend.onrender.com)

Update your frontend socket.io client to connect to this URL:
const socket = io("https://chat-backend.onrender.com");
💡 Future Improvements
Drag and drop reordering of tasks

User authentication

Saving tasks to a backend (Firebase or Express API)

Unit and integration testing with Vitest

🙋‍♀️ Author
Built by Stephen Okoth
For educational and project demonstration purposes.




