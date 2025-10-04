import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
    },
  });

  // Socket.io game room logic
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-game', (gameId: string) => {
      socket.join(`game-${gameId}`);
      console.log(`Socket ${socket.id} joined game ${gameId}`);
    });

    socket.on('leave-game', (gameId: string) => {
      socket.leave(`game-${gameId}`);
      console.log(`Socket ${socket.id} left game ${gameId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Make io accessible globally
  (global as any).io = io;

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
