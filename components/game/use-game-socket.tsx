'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useGameSocket(gameId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io({
      path: '/socket.io',
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      socketInstance.emit('join-game', gameId);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit('leave-game', gameId);
      socketInstance.disconnect();
    };
  }, [gameId]);

  return { socket, connected };
}
