'use client';

import { useEffect, useState, use } from 'react';
import { useGamePolling } from '@/components/game/use-game-polling';
import StrategyCardAssignment from '@/components/game/strategy-card-assignment';
import { Button, Card, Badge, Input } from '@/components/ui';
import { getPlayerColor, type PlayerColorId } from '@/lib/design-system/tokens/colors';
import Link from 'next/link';
import QRCode from 'qrcode';

interface Player {
  id: string;
  name: string;
  color: string;
  faction: string | null;
  turnOrder: number;
  score: number;
  totalTimeMs: number;
  strategyCard: number | null;
  hasSpeaker: boolean;
  hasPassed: boolean;
}

interface TurnHistory {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  turnNumber: number;
  action: string;
  createdAt: string;
}

interface Game {
  id: string;
  status: string;
  currentTurn: number;
  currentRound: number;
  currentPlayerTurnOrder: number;
  turnStartedAt: string;
  players: Player[];
  history: TurnHistory[];
}

export default function AdminPanel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: game } = useGamePolling(id, { interval: 2000 });
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const joinUrl = `${window.location.origin}/game/${id}/join`;
    QRCode.toDataURL(joinUrl, { width: 300, margin: 2 }).then((url) => setQrCodeUrl(url));
  }, [id]);

  const updateScore = async (playerId: string, newScore: number) => {
    try {
      await fetch('/api/players', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playerId, score: newScore }),
      });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const rewindTurn = async () => {
    if (!game || game.currentTurn === 0) return;
    if (!confirm('Rewind to the previous turn?')) return;

    try {
      const lastTurn = game.history[0];
      if (!lastTurn) return;

      const previousPlayer = game.players.find((p: Player) => p.id === lastTurn.playerId);
      if (!previousPlayer) return;

      await fetch(`/api/games/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTurn: game.currentTurn - 1,
          currentPlayerTurnOrder: previousPlayer.turnOrder,
        }),
      });
    } catch (error) {
      console.error('Error rewinding:', error);
    }
  };

  const nextRound = async () => {
    if (!confirm(`Start round ${game!.currentRound + 1}?`)) return;

    try {
      await fetch('/api/rounds/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: id }),
      });
    } catch (error) {
      console.error('Error advancing round:', error);
    }
  };

  const resetTurnToStart = async () => {
    if (!confirm('Reset turn counter to 0?')) return;

    try {
      await fetch(`/api/games/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTurn: 0,
          currentPlayerTurnOrder: 1,
        }),
      });
    } catch (error) {
      console.error('Error resetting turn:', error);
    }
  };

  const togglePause = async () => {
    if (!game) return;

    const newStatus = game.status === 'paused' ? 'active' : 'paused';

    try {
      await fetch(`/api/games/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'active' ? { turnStartedAt: new Date() } : {})
        }),
      });
    } catch (error) {
      console.error('Error toggling pause:', error);
    }
  };

  const passTurn = async () => {
    if (!game || game.status === 'paused') return;

    const currentPlayer = game.players.find((p: Player) => p.turnOrder === game.currentPlayerTurnOrder);
    if (!currentPlayer) return;

    const turnStartTime = new Date(game.turnStartedAt).getTime();
    const turnDurationMs = Date.now() - turnStartTime;

    try {
      await fetch('/api/turns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: id,
          playerId: currentPlayer.id,
          action: 'pass',
          turnDurationMs,
        }),
      });
    } catch (error) {
      console.error('Error passing turn:', error);
    }
  };

  const resetGame = async () => {
    const confirmation = prompt('Type "RESET" to confirm resetting the entire game:');
    if (confirmation !== 'RESET') return;

    try {
      await fetch(`/api/games/${id}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-gray-400">Manage your TI4 game</p>
          </div>
          <Link href={`/game/${id}`}>
            <Button variant="secondary" size="md">
              View TV Display
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* QR Code Card */}
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📱</span> Join Game
            </h2>
            {qrCodeUrl && (
              <div className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-xl">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="mt-4 text-sm text-gray-400 text-center break-all">
                  {typeof window !== 'undefined' && window.location.origin}/game/{id}/join
                </p>
              </div>
            )}
          </Card>

          {/* Game Controls Card */}
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🎮</span> Game Controls
            </h2>

            {/* Status Display */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <Badge
                  variant={game.status === 'paused' ? 'warning' : 'success'}
                  size="lg"
                >
                  {game.status === 'paused' ? '⏸ PAUSED' : '▶ ACTIVE'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Round</span>
                <span className="text-2xl font-bold">{game.currentRound}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Turn</span>
                <span className="text-2xl font-bold">{game.currentTurn}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              <Button
                variant={game.status === 'paused' ? 'primary' : 'ghost'}
                fullWidth
                onClick={togglePause}
                className={game.status !== 'paused' ? 'text-orange-400 border-orange-500/50 hover:bg-orange-500/10' : ''}
              >
                {game.status === 'paused' ? '▶ Resume Game' : '⏸ Pause Game'}
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={passTurn}
                disabled={game.status === 'paused'}
              >
                Pass Current Turn
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  onClick={rewindTurn}
                  disabled={game.currentTurn === 0}
                >
                  ⏪ Rewind
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetTurnToStart}
                >
                  🔄 Reset Turn
                </Button>
              </div>

              <Button
                variant="ghost"
                fullWidth
                onClick={nextRound}
                className="text-purple-400 border-purple-500/50 hover:bg-purple-500/10"
              >
                Next Round →
              </Button>

              <div className="pt-3 mt-3 border-t border-gray-700">
                <Button
                  variant="danger"
                  fullWidth
                  onClick={resetGame}
                >
                  Reset Entire Game
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent History Card */}
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📜</span> Recent Actions
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {game.history.length === 0 ? (
                <p className="text-gray-500 text-sm">No actions yet</p>
              ) : (
                game.history.slice(0, 10).map((turn: TurnHistory) => {
                  const playerColor = getPlayerColor(turn.playerColor as PlayerColorId);
                  return (
                    <div
                      key={turn.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50"
                    >
                      <div className={`w-3 h-3 rounded-full ${playerColor.bg}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{turn.playerName}</div>
                        <div className="text-xs text-gray-500">
                          {turn.action} · Turn {turn.turnNumber}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Strategy Card Assignment */}
        <div className="mt-8">
          <StrategyCardAssignment
            gameId={id}
            players={game.players}
            currentRound={game.currentRound}
            onAssigned={() => {}}
          />
        </div>

        {/* Player Scores */}
        <Card variant="elevated" padding="lg" className="mt-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>🏆</span> Player Scores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {game.players.map((player: Player) => {
              const playerColor = getPlayerColor(player.color as PlayerColorId);
              return (
                <Card
                  key={player.id}
                  variant="player"
                  playerColor={player.color as PlayerColorId}
                  padding="md"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${playerColor.bg} flex items-center justify-center ${playerColor.text} font-bold`}>
                      {player.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{player.name}</div>
                      {player.faction && (
                        <div className="text-xs text-gray-400 truncate">{player.faction}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateScore(player.id, Math.max(0, player.score - 1))}
                      className="w-10 h-10 p-0"
                    >
                      −
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="text-3xl font-bold">{player.score}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateScore(player.id, player.score + 1)}
                      className="w-10 h-10 p-0"
                    >
                      +
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
