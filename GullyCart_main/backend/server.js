require('dotenv').config({path: '../.env'});

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDatabase } = require('./config/database');
const { registerTrackingSockets } = require('./sockets/tracking');

const port = Number(process.env.PORT || 5000);
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
});

registerTrackingSockets(io);

async function startServer() {
  await connectDatabase();
  httpServer.listen(port, () => console.log(`GullyCart API listening on port ${port}`));
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start server:', error);
    process.exitCode = 1;
  });
}

module.exports = { app, io, httpServer, startServer };