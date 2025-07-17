const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ['http://localhost:5173', 'https://r-ss.vercel.app'], 
   credentials: true }
});

// Stockage des sockets par userId
const userSockets = {};

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    userSockets[userId] = socket.id;
  });
  socket.on('disconnect', () => {
    for (const [userId, sockId] of Object.entries(userSockets)) {
      if (sockId === socket.id) delete userSockets[userId];
    }
  });
});

// Rendre io et userSockets accessibles dans les contrôleurs
app.set('io', io);
app.set('userSockets', userSockets);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
}); 