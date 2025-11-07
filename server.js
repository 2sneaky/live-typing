const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const OWNER_PASSWORD = 'tuffyisnotwuffy67little67massiveignorancehumansarenotkillingalienasquannguyenvan9157&&&$!@####)))()|||}{""":>...........';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.owner = false;
  socket.room = null;

  socket.on('join_room', (room) => {
    if (!room || typeof room !== 'string') return;
    socket.room = room;
    socket.join(room);
    socket.emit('room_joined', { id: socket.id, room });
    socket.to(room).emit('user_joined', socket.id);
  });

  socket.on('typing', (text) => {
    if (!socket.room) return;
    const safe = String(text || '');
    io.to(socket.room).emit('update', { id: socket.id, content: safe });
  });

  socket.on('clear', () => {
    if (!socket.room) return;
    io.to(socket.room).emit('clear', { id: socket.id });
  });

  socket.on('owner_auth', (pw) => {
    if (pw === OWNER_PASSWORD) {
      socket.owner = true;
      socket.emit('owner_ok');
    } else {
      socket.emit('owner_fail');
    }
  });

  socket.on('owner_clear_all', () => {
    if (socket.owner && socket.room) {
      io.to(socket.room).emit('clear_all');
    }
  });

  socket.on('disconnect', () => {
    if (socket.room) io.to(socket.room).emit('user_left', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`listening on port ${PORT}`));
