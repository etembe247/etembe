import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Track online users
  const onlineUsers = new Map(); // socketId -> { userId, userName }

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // ─── User Online/Offline ───
    socket.on('user:online', (data) => {
      onlineUsers.set(socket.id, { userId: data.userId, userName: data.userName });
      const allOnline = [...new Set([...onlineUsers.values()].map((u) => u.userId))];
      io.emit('users:online', allOnline);
      console.log(`[Socket.IO] User online: ${data.userName} (${allOnline.length} total)`);
    });

    socket.on('disconnect', () => {
      const userData = onlineUsers.get(socket.id);
      onlineUsers.delete(socket.id);
      const allOnline = [...new Set([...onlineUsers.values()].map((u) => u.userId))];
      io.emit('users:online', allOnline);
      if (userData) {
        console.log(`[Socket.IO] User offline: ${userData.userName}`);
      }
    });

    // ─── Chat System ───
    socket.on('chat:join', (chatId) => {
      socket.join(`chat:${chatId}`);
      console.log(`[Socket.IO] ${socket.id} joined chat:${chatId}`);
    });

    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('chat:message', (data) => {
      // Broadcast to everyone in the chat room (including sender for consistency)
      io.to(`chat:${data.chatId}`).emit('chat:message', data);
      // Also emit notification to specific users who aren't in the room
      socket.broadcast.emit('chat:notification', {
        chatId: data.chatId,
        senderId: data.senderId,
        senderName: data.senderName,
        preview: data.text.substring(0, 50),
        timestamp: data.timestamp,
      });
    });

    socket.on('chat:typing', (data) => {
      socket.to(`chat:${data.chatId}`).emit('chat:typing', {
        chatId: data.chatId,
        userId: data.userId,
        userName: data.userName,
        isTyping: data.isTyping,
      });
    });

    socket.on('chat:read', (data) => {
      socket.to(`chat:${data.chatId}`).emit('chat:read', {
        chatId: data.chatId,
        userId: data.userId,
      });
    });

    socket.on('chat:reaction', (data) => {
      io.to(`chat:${data.chatId}`).emit('chat:reaction', data);
    });

    // ─── Notifications ───
    socket.on('notification:send', (data) => {
      // Broadcast notification to target user
      io.emit('notification:receive', data);
    });

    // ─── Shorts Engagement ───
    socket.on('short:like', (data) => {
      socket.broadcast.emit('short:like', data);
    });

    socket.on('short:comment', (data) => {
      socket.broadcast.emit('short:comment', data);
    });

    // ─── Blog Engagement ───
    socket.on('blog:like', (data) => {
      socket.broadcast.emit('blog:like', data);
    });

    socket.on('blog:comment', (data) => {
      socket.broadcast.emit('blog:comment', data);
    });

    // ─── Follow System ───
    socket.on('user:follow', (data) => {
      io.emit('user:follow', data);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`\n  ✦ ETEMBE Server ready on http://${hostname}:${port}\n`);
    });
});
