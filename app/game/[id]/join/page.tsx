'use client';

import { useEffect, useState, use } from 'react';
import { useGamePolling } from '@/components/game/use-game-polling';
import { Button, Card, Badge } from '@/components/ui';
import { TurnStatusCard, type TurnStatus } from '@/components/game/turn-status-card';
import { getPlayerColor, type PlayerColorId } from '@/lib/design-system/tokens/colors';

interface Player {
  id: string;
  name: string;
  color: string;
  faction: string | null;
  turnOrder: number;
  score: number;
  totalTimeMs: number;
  hasPassed: boolean;
  hasSpeaker: boolean;
}

interface Game {
  id: string;
  status: string;
  currentTurn: number;
  currentRound: number;
  currentPlayerTurnOrder: number;
  turnStartedAt: string;
  players: Player[];
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function JoinGame({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: game } = useGamePolling(id, { interval: 2000 });
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Load saved player selection from localStorage
  useEffect(() => {
    const savedPlayerId = localStorage.getItem(`ti4-player-${id}`);
    if (savedPlayerId) {
      setSelectedPlayerId(savedPlayerId);
    }
  }, [id]);

  const selectPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId);
    localStorage.setItem(`ti4-player-${id}`, playerId);
  };

  const clearPlayerSelection = () => {
    setSelectedPlayerId(null);
    localStorage.removeItem(`ti4-player-${id}`);
  };

  // Keep screen awake
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock error:', err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLock?.release();
    };
  }, []);

  useEffect(() => {
    if (!game) return;
    const currentPlayer = game.players.find((p: Player) => p.turnOrder === game.currentPlayerTurnOrder);
    const playerIndex = currentPlayer ? game.players.indexOf(currentPlayer) : 0;
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
    }
  };

  const handlePass = async () => {
    if (!selectedPlayerId || !game) return;
    if (!confirm('Are you sure you want to pass?')) return;

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
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl text-gray-400">Loading...</div>
      </div>
    );
  }

  const selectedPlayer = game.players.find((p: Player) => p.id === selectedPlayerId);
  const currentPlayer = game.players[currentPlayerIndex];
  const isMyTurn = selectedPlayer?.id === currentPlayer?.id && game.status !== 'paused' && !selectedPlayer?.hasPassed;

  // Determine turn status
  const getTurnStatus = (): TurnStatus => {
    if (selectedPlayer?.hasPassed) return 'passed';
    if (game.status === 'paused') return 'paused';
    if (isMyTurn) return 'your-turn';
    return 'waiting';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-40">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">TI4 Tracker</h1>
            <p className="text-xs text-gray-400">Round {game.currentRound}</p>
          </div>
          {selectedPlayerId && (
            <Button variant="ghost" size="sm" onClick={clearPlayerSelection}>
              Switch
            </Button>
          )}
        </div>
      </div>

      {/* Player Selection */}
      {!selectedPlayerId ? (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Select Your Player</h2>
          <p className="text-gray-400 mb-6">Tap your name to join the game</p>

          <div className="space-y-3">
            {game.players.map((player: Player) => {
              const colors = getPlayerColor(player.color as PlayerColorId);
              return (
                <button
                  key={player.id}
                  onClick={() => selectPlayer(player.id)}
                  className={`w-full ${colors.bg} p-5 rounded-xl font-medium text-left flex items-center gap-4 shadow-lg active:scale-[0.98] transition-transform`}
                >
                  <div className={`w-14 h-14 rounded-full bg-white/20 flex items-center justify-center ${colors.text} font-bold text-xl`}>
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className={`text-xl font-bold ${colors.text} flex items-center gap-2`}>
                      {player.name}
                      {player.hasSpeaker && <span className="text-sm">👑</span>}
                    </div>
                    {player.faction && (
                      <div className={`${colors.text} opacity-80 text-sm`}>{player.faction}</div>
                    )}
                  </div>
                  {player.hasPassed && (
                    <Badge variant="warning" size="sm">PASSED</Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Selected Player Info */}
          <Card
            variant="player"
            playerColor={selectedPlayer?.color as PlayerColorId}
            padding="lg"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-full ${getPlayerColor(selectedPlayer?.color as PlayerColorId).bg} flex items-center justify-center font-bold text-2xl ${getPlayerColor(selectedPlayer?.color as PlayerColorId).text}`}>
                {selectedPlayer?.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {selectedPlayer?.name}
                  {selectedPlayer?.hasSpeaker && (
                    <Badge variant="warning" size="sm" icon={<span>👑</span>}>Speaker</Badge>
                  )}
                </div>
                {selectedPlayer?.faction && (
                  <div className="text-gray-400">{selectedPlayer.faction}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div>
                <div className="text-sm text-gray-400">Score</div>
                <div className="text-4xl font-bold">{selectedPlayer?.score}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Time</div>
                <div className="text-2xl font-mono">{formatTime(selectedPlayer?.totalTimeMs || 0)}</div>
              </div>
            </div>
          </Card>

          {/* Turn Status */}
          <TurnStatusCard
            status={getTurnStatus()}
            playerName={currentPlayer?.name}
            message={
              getTurnStatus() === 'paused'
                ? 'Waiting for strategy card selection'
                : getTurnStatus() === 'passed'
                ? 'Waiting for next round'
                : undefined
            }
          />

          {/* Current Turn Info (when waiting) */}
          {getTurnStatus() === 'waiting' && currentPlayer && (
            <Card variant="glass" padding="md" className="text-center">
              <p className="text-sm text-gray-400 mb-1">Current turn</p>
              <div className="flex items-center justify-center gap-3">
                <div className={`w-8 h-8 rounded-full ${getPlayerColor(currentPlayer.color as PlayerColorId).bg}`} />
                <span className="text-lg font-semibold">{currentPlayer.name}</span>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Fixed Bottom Action Bar */}
      {selectedPlayerId && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 space-y-3">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={handleEndTurn}
            disabled={!isMyTurn}
            className={isMyTurn ? 'animate-pulse-ready' : ''}
          >
            End Turn
          </Button>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={handlePass}
            disabled={!isMyTurn}
            className="text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
          >
            Pass Turn
          </Button>
        </div>
      )}
    </div>
  );
}
