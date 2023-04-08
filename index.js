const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const {
  saveUser,
  messageFormat,
  getUser,
  removeUser,
  getUserInRoom,
  getRooms,
} = require('./users');

const PORT = 5000;
app.use(cors({ origin: '*' }));
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const admin = 'Admin';
io.on('connection', (socket) => {
  console.log(` ${socket.id} user just connected!`);

  socket.on('joined', ({ userName, room }) => {
    saveUser(userName, room, socket.id);
    socket.join(room);

    socket.emit('info', messageFormat(admin, `${userName} welcome`));

    socket.broadcast.to(room).emit('info', messageFormat(admin, `${userName} joined the chat`));

    io.to(room).emit('users', { users: getUserInRoom(room), rooms: getRooms() });
  });

  socket.on('send', (data) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('info', messageFormat(user.userName, data));
  });

  socket.on('leave', () => {
    const user = getUser(socket.id);

    if (user) {
      removeUser(user.id);
      socket.leave(user.room);

      io.to(user.room).emit('info', messageFormat(admin, `${user.userName} has left the chat`));
      io.to(user.room).emit('users', { users: getUserInRoom(user.room), rooms: getRooms() });
    }
  });

  socket.on('disconnect', () => {
    const user = getUser(socket.id);

    if (user) {
      removeUser(user.id);
      io.to(user.room).emit('info', messageFormat(admin, `${user.userName} has left the chat`));

      io.to(user.room).emit('users', { users: getUserInRoom(user.room), rooms: getRooms() });
    }
    console.log(' A user disconnected');
  });
});

app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.send('Chat App');
});
app.get('/api/users', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  const users = getUserInRoom();
  const rooms = getRooms();
  res.json({ users, rooms });
});
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
