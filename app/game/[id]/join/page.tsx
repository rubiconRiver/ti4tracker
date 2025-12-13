'use client';

import { useEffect, useState, use } from 'react';
import { useGamePolling } from '@/components/game/use-game-polling';
import { getPlayerColor, type PlayerColorId } from '@/lib/design-system/tokens/colors';
import { Check, Pause } from 'lucide-react';
import type { Player, Game } from '@/lib/types';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Find the next player who hasn't passed
function getNextPlayerTurnOrder(game: Game, currentPlayerId: string): number | null {
  const activePlayers = game.players.filter(p => !p.hasPassed);
  if (activePlayers.length === 0) return null;

  // Sort by strategy card (turn order within round)
  const sortedPlayers = [...activePlayers].sort((a, b) =>
    (a.strategyCard || 99) - (b.strategyCard || 99)
  );

  const currentIdx = sortedPlayers.findIndex(p => p.id === currentPlayerId);
  const nextIdx = (currentIdx + 1) % sortedPlayers.length;
  return sortedPlayers[nextIdx].turnOrder;
}

export default function JoinGame({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: game, mutate, isPending } = useGamePolling(id, { interval: 2000 });
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [actionPending, setActionPending] = useState(false);

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

    // Find player with current turn order
    const currentPlayer = game.players.find((p: Player) => p.turnOrder === game.currentPlayerTurnOrder);
    const playerIndex = currentPlayer ? game.players.indexOf(currentPlayer) : 0;
    setCurrentPlayerIndex(playerIndex);
  }, [game]);

  const handleEndTurn = async () => {
    if (!selectedPlayerId || !game || actionPending) return;

    const turnStartTime = new Date(game.turnStartedAt).getTime();
    const turnDurationMs = Date.now() - turnStartTime;

    // Apply optimistic update immediately
    setActionPending(true);
    const nextTurnOrder = getNextPlayerTurnOrder(game, selectedPlayerId);
    if (nextTurnOrder !== null) {
      mutate((current) => {
        if (!current) return current;
        return {
          ...current,
          currentPlayerTurnOrder: nextTurnOrder,
          turnStartedAt: new Date().toISOString(),
        };
      });
    }

    try {
      const res = await fetch('/api/turns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: id,
          playerId: selectedPlayerId,
          action: 'end_turn',
          turnDurationMs,
        }),
      });
      if (!res.ok) throw new Error('Failed to end turn');
    } catch (error) {
      console.error('Error ending turn:', error);
      // Error will be corrected by next poll
    } finally {
      setActionPending(false);
    }
  };

  const handlePass = async () => {
    if (!selectedPlayerId || !game || actionPending) return;

    if (!confirm('Are you sure you want to pass your turn?')) return;

    const turnStartTime = new Date(game.turnStartedAt).getTime();
    const turnDurationMs = Date.now() - turnStartTime;

    // Apply optimistic update immediately
    setActionPending(true);
    const nextTurnOrder = getNextPlayerTurnOrder(game, selectedPlayerId);
    mutate((current) => {
      if (!current) return current;
      return {
        ...current,
        currentPlayerTurnOrder: nextTurnOrder ?? current.currentPlayerTurnOrder,
        turnStartedAt: new Date().toISOString(),
        players: current.players.map(p =>
          p.id === selectedPlayerId ? { ...p, hasPassed: true } : p
        ),
      };
    });

    try {
      const res = await fetch('/api/turns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: id,
          playerId: selectedPlayerId,
          action: 'pass',
          turnDurationMs,
        }),
      });
      if (!res.ok) throw new Error('Failed to pass');
    } catch (error) {
      console.error('Error passing:', error);
      // Error will be corrected by next poll
    } finally {
      setActionPending(false);
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
  const isMyTurn = selectedPlayer?.id === currentPlayer?.id && game.status !== 'paused' && !selectedPlayer?.hasPassed;

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
              const colors = getPlayerColor(player.color as PlayerColorId);
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
              selectedPlayer?.hasPassed
                ? 'bg-orange-500 text-white'
                : game.status === 'paused'
                ? 'bg-orange-500 text-white'
                : isMyTurn
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            <div className="text-2xl font-bold flex items-center justify-center gap-2">
              {selectedPlayer?.hasPassed
                ? <><Check className="w-6 h-6" /> You Have Passed</>
                : game.status === 'paused'
                ? <><Pause className="w-6 h-6" /> Game Paused</>
                : isMyTurn
                ? "It's Your Turn!"
                : 'Waiting for your turn...'}
            </div>
            {selectedPlayer?.hasPassed && (
              <div className="mt-2 text-sm">
                Waiting for next round...
              </div>
            )}
            {!isMyTurn && game.status !== 'paused' && !selectedPlayer?.hasPassed && (
              <div className="mt-2">
                Current: {currentPlayer?.name}
              </div>
            )}
            {game.status === 'paused' && !selectedPlayer?.hasPassed && (
              <div className="mt-2 text-sm">
                Admin is setting up the round
              </div>
            )}
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 space-y-3 z-50">
            <button
              onClick={handleEndTurn}
              disabled={!isMyTurn || actionPending}
              className={`w-full px-6 py-4 rounded-lg font-bold text-xl transition-all transform shadow-lg ${
                actionPending
                  ? 'bg-blue-500 text-white scale-95'
                  : 'bg-green-600 text-white hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              style={{ minHeight: '60px' }}
            >
              {actionPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ending Turn...
                </span>
              ) : (
                'End Turn'
              )}
            </button>

            <button
              onClick={handlePass}
              disabled={!isMyTurn || actionPending}
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
