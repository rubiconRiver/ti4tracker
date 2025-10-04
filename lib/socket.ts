import { Server as SocketIOServer } from 'socket.io';

export function getIO(): SocketIOServer | null {
  return (global as any).io || null;
}

export function emitToGame(gameId: string, event: string, data: any) {
  const io = getIO();
  if (io) {
    io.to(`game-${gameId}`).emit(event, data);
  }
}
