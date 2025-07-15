const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const users = new Map();
const userSockets = new Map();
const roomMessages = {}; // { roomName: [msg1, msg2, ...] }

io.on('connection', (socket) => {
  socket.on('join', ({ username }) => {
    users.set(socket.id, username);
    userSockets.set(username, socket.id);
    io.emit('user-list', Array.from(userSockets.keys()));
  });

  socket.on('join-room', ({ room }) => {
    socket.join(room);
    socket.currentRoom = room;
    io.to(room).emit('room-notification', {
      message: `${users.get(socket.id)} joined the room.`,
    });
  });

  socket.on('send-room-message', (data, callback) => {
    const { room } = data;
    const msgWithID = {
      ...data,
      id: Date.now(),
      reactions: {},
      readBy: [],
      timestamp: new Date().toISOString(),
    };

    if (!roomMessages[room]) roomMessages[room] = [];
    roomMessages[room].push(msgWithID);
    io.to(room).emit('receive-room-message', msgWithID);
    if (callback) callback({ status: 'delivered' });
  });

  socket.on('react-to-message', ({ room, messageId, reaction, username }) => {
    io.to(room).emit('message-reaction', {
      messageId,
      reaction,
      username,
    });
  });

  socket.on('message-read', ({ room, messageId, username }) => {
    io.to(room).emit('message-read-update', { messageId, username });
  });

  socket.on('send-private-message', ({ from, to, message }) => {
    const targetSocketId = userSockets.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('private-message', {
        from,
        to,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  socket.on('load-messages', ({ room, offset = 0, limit = 20 }) => {
    const msgs = roomMessages[room] || [];
    const paginated = msgs.slice(-offset - limit, msgs.length - offset);
    socket.emit('room-message-history', paginated);
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    const userRoom = socket.currentRoom;

    if (userRoom) {
      io.to(userRoom).emit('room-notification', {
        message: `${username} left the room.`,
      });
    }

    users.delete(socket.id);
    userSockets.delete(username);
    io.emit('user-list', Array.from(userSockets.keys()));
  });
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
