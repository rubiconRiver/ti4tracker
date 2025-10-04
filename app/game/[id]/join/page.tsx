'use client';

import { useEffect, useState, use } from 'react';
import { useGamePolling } from '@/components/game/use-game-polling';

interface Player {
  id: string;
  name: string;
  color: string;
  faction: string | null;
  turnOrder: number;
  score: number;
  totalTimeMs: number;
}

interface Game {
  id: string;
  status: string;
  currentTurn: number;
  players: Player[];
}

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  red: { bg: 'bg-red-600', text: 'text-white' },
  blue: { bg: 'bg-blue-600', text: 'text-white' },
  green: { bg: 'bg-green-600', text: 'text-white' },
  yellow: { bg: 'bg-yellow-500', text: 'text-black' },
  purple: { bg: 'bg-purple-600', text: 'text-white' },
  black: { bg: 'bg-gray-900', text: 'text-white' },
  orange: { bg: 'bg-orange-600', text: 'text-white' },
  pink: { bg: 'bg-pink-600', text: 'text-white' },
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function JoinGame({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: game } = useGamePolling(id, { interval: 2000 });
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Load saved player selection from localStorage on mount
  useEffect(() => {
    const savedPlayerId = localStorage.getItem(`ti4-player-${id}`);
    if (savedPlayerId) {
      setSelectedPlayerId(savedPlayerId);
    }
  }, [id]);

  // Save player selection to localStorage whenever it changes
  const selectPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId);
    localStorage.setItem(`ti4-player-${id}`, playerId);
  };

  const clearPlayerSelection = () => {
    setSelectedPlayerId(null);
    localStorage.removeItem(`ti4-player-${id}`);
  };

  // Keep screen awake using Wake Lock API
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Wake Lock activated');
        }
      } catch (err) {
        console.log('Wake Lock error:', err);
      }
    };

    requestWakeLock();

    // Re-acquire wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock !== null) {
        wakeLock.release().then(() => {
          console.log('Wake Lock released');
        });
      }
    };
  }, []);

  useEffect(() => {
    if (!game) return;

    const playerIndex = game.currentTurn % game.players.length;
    setCurrentPlayerIndex(playerIndex);
  }, [game]);

  const handleEndTurn = async () => {
    if (!selectedPlayerId || !game) return;

    const turnStartTime = new Date(game.turnStartedAt).getTime();
    const turnDurationMs = Date.now() - turnStartTime;

    try {
      await fetch('/api/turns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: id,
          playerId: selectedPlayerId,
          action: 'end_turn',
          turnDurationMs,
        }),
      });
    } catch (error) {
      console.error('Error ending turn:', error);
      alert('Failed to end turn');
    }
  };

  const handlePass = async () => {
    if (!selectedPlayerId || !game) return;

    if (!confirm('Are you sure you want to pass your turn?')) return;

    const turnStartTime = new Date(game.turnStartedAt).getTime();
    const turnDurationMs = Date.now() - turnStartTime;

    try {
      await fetch('/api/turns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: id,
          playerId: selectedPlayerId,
          action: 'pass',
          turnDurationMs,
        }),
      });
    } catch (error) {
      console.error('Error passing:', error);
      alert('Failed to pass');
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const selectedPlayer = game.players.find((p: Player) => p.id === selectedPlayerId);
  const currentPlayer = game.players[currentPlayerIndex];
  const isMyTurn = selectedPlayer?.id === currentPlayer?.id;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-black">TI4 Tracker - Player View</h1>
      </div>

      {/* Player Selection */}
      {!selectedPlayerId ? (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-black">Select Your Player</h2>
          <div className="space-y-3">
            {game.players.map((player: Player) => {
              const colors = COLOR_MAP[player.color] || COLOR_MAP.red;
              return (
                <button
                  key={player.id}
                  onClick={() => selectPlayer(player.id)}
                  className={`w-full ${colors.bg} ${colors.text} p-6 rounded-lg font-medium text-left flex items-center gap-4 shadow-md active:scale-95 transition-transform`}
                >
                  <div className={`w-12 h-12 rounded-full ${colors.bg} border-4 border-white`}></div>
                  <div>
                    <div className="text-2xl font-bold">{player.name}</div>
                    {player.faction && <div className="opacity-90">{player.faction}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Selected Player Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-black">{selectedPlayer?.name}</div>
                {selectedPlayer?.faction && (
                  <div className="text-gray-600">{selectedPlayer.faction}</div>
                )}
              </div>
              <button
                onClick={clearPlayerSelection}
                className="text-blue-600 font-medium"
              >
                Switch Player
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Score</div>
                <div className="text-3xl font-bold text-black">{selectedPlayer?.score}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Time</div>
                <div className="text-xl font-mono text-black">
                  {formatTime(selectedPlayer?.totalTimeMs || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Turn Indicator */}
          <div
            className={`rounded-lg p-6 text-center ${
              isMyTurn ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            <div className="text-2xl font-bold">
              {isMyTurn ? "It's Your Turn!" : 'Waiting for your turn...'}
            </div>
            {!isMyTurn && (
              <div className="mt-2">
                Current: {currentPlayer?.name}
              </div>
            )}
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 space-y-3">
            <button
              onClick={handleEndTurn}
              disabled={!isMyTurn}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-bold text-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform shadow-lg"
              style={{ minHeight: '60px' }}
            >
              End Turn
            </button>

            <button
              onClick={handlePass}
              disabled={!isMyTurn}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pass Turn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
