'use client';

import { useEffect, useState, use } from 'react';
import { useGamePolling } from '@/components/game/use-game-polling';
import StrategyCardAssignment from '@/components/game/strategy-card-assignment';
import { Button, Card, Input } from '@/components/ui';
import QRCode from 'qrcode';
import type { Player, TurnHistory, Game } from '@/lib/types';

export default function AdminPanel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: game } = useGamePolling(id, { interval: 2000 });
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // PIN authentication state
  const [adminPin, setAdminPin] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Check localStorage for saved PIN on mount
  useEffect(() => {
    const savedPin = localStorage.getItem(`ti4-admin-${id}`);
    if (savedPin) {
      // Verify the saved PIN is still valid
      verifyPin(savedPin, true);
    }
  }, [id]);

  const verifyPin = async (pin: string, silent = false) => {
    setIsVerifying(true);
    setPinError('');

    try {
      const res = await fetch(`/api/games/${id}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        setAdminPin(pin);
        localStorage.setItem(`ti4-admin-${id}`, pin);
      } else {
        if (!silent) {
          setPinError('Invalid PIN');
        }
        localStorage.removeItem(`ti4-admin-${id}`);
      }
    } catch (error) {
      if (!silent) {
        setPinError('Failed to verify PIN');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length === 4) {
      verifyPin(pinInput);
    }
  };

  useEffect(() => {
    // Generate QR code
    const joinUrl = `${window.location.origin}/game/${id}/join`;
    QRCode.toDataURL(joinUrl, { width: 300 }).then((url) => setQrCodeUrl(url));
  }, [id]);

  // Helper to make authenticated API calls
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const body = options.body ? JSON.parse(options.body as string) : {};
    return fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify({ ...body, adminPin }),
    });
  };

  const updateScore = async (playerId: string, newScore: number) => {
    try {
      await fetch('/api/players', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playerId, score: newScore, adminPin }),
      });
    } catch (error) {
      console.error('Error updating score:', error);
      alert('Failed to update score');
    }
  };

  const rewindTurn = async () => {
    if (!game || game.currentTurn === 0) return;

    if (!confirm('Rewind to the previous turn?')) return;

    try {
      const lastTurn = game.history?.[0];
      if (!lastTurn) return;

      const previousPlayer = game.players.find((p: Player) => p.id === lastTurn.playerId);
      if (!previousPlayer) return;

      await authFetch(`/api/games/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          currentTurn: game.currentTurn - 1,
          currentPlayerTurnOrder: previousPlayer.turnOrder,
        }),
      });
    } catch (error) {
      console.error('Error rewinding:', error);
      alert('Failed to rewind');
    }
  };

  const nextRound = async () => {
    if (!confirm(`Start round ${game!.currentRound + 1}?`)) return;

    try {
      await fetch('/api/rounds/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: id, adminPin }),
      });
    } catch (error) {
      console.error('Error advancing round:', error);
      alert('Failed to advance round');
    }
  };

  const resetTurnToStart = async () => {
    if (!confirm('Reset turn counter to 0? This will make the first player in turn order active.')) return;

    try {
      await authFetch(`/api/games/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          currentTurn: 0,
          currentPlayerTurnOrder: 1,
        }),
      });
    } catch (error) {
      console.error('Error resetting turn:', error);
      alert('Failed to reset turn');
    }
  };

  const togglePause = async () => {
    if (!game) return;

    const newStatus = game.status === 'paused' ? 'active' : 'paused';

    try {
      await authFetch(`/api/games/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'active' ? { turnStartedAt: new Date() } : {})
        }),
      });
    } catch (error) {
      console.error('Error toggling pause:', error);
      alert('Failed to toggle pause');
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
          adminPin,
        }),
      });
    } catch (error) {
      console.error('Error passing turn:', error);
      alert('Failed to pass turn');
    }
  };

  const resetGame = async () => {
    const confirmation = prompt('⚠️ WARNING: This will reset ALL scores, times, history, and strategy cards!\n\nPlayers will be kept but everything else will be deleted.\n\nType "RESET" to confirm:');

    if (confirmation !== 'RESET') {
      if (confirmation !== null) {
        alert('Reset cancelled. You must type "RESET" exactly to confirm.');
      }
      return;
    }

    try {
      await fetch(`/api/games/${id}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPin }),
      });
    } catch (error) {
      console.error('Error resetting game:', error);
      alert('Failed to reset game');
    }
  };

  // Show PIN entry if not authenticated
  if (!adminPin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-gray-400">Enter the 4-digit PIN to access admin controls</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <Input
              label="Admin PIN"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="0000"
              className="text-center text-2xl tracking-widest"
              autoFocus
            />

            {pinError && (
              <p className="text-red-400 text-sm text-center">{pinError}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isVerifying}
              disabled={pinInput.length !== 4 || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Enter'}
            </Button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            The PIN was shown when the game was created.
          </p>
        </Card>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-2xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <button
              onClick={() => setShowPin(!showPin)}
              className="text-sm text-gray-400 hover:text-white mt-1"
            >
              {showPin ? `PIN: ${adminPin}` : 'Show PIN'}
            </button>
          </div>
          <a
            href={`/game/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View TV Display
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Code */}
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold mb-4">Join Game</h2>
            {qrCodeUrl && (
              <div>
                <img src={qrCodeUrl} alt="QR Code" className="w-full rounded-lg" />
                <div className="mt-4 text-sm text-gray-400 break-all">
                  {typeof window !== 'undefined' && window.location.origin}/game/{id}/join
                </div>
              </div>
            )}
          </Card>

          {/* Game Controls */}
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold mb-4">Game Controls</h2>
            <div className="space-y-3">
              <div className="text-lg text-gray-300">
                Status: <span className={`font-bold ${game.status === 'paused' ? 'text-orange-400' : 'text-green-400'}`}>
                  {game.status === 'paused' ? '⏸ PAUSED' : '▶ ACTIVE'}
                </span>
              </div>
              <div className="text-lg text-gray-300">
                Round: <span className="font-bold text-white">{game.currentRound}</span>
              </div>
              <div className="text-lg text-gray-300">
                Current Turn: <span className="font-bold text-white">{game.currentTurn}</span>
              </div>
              <Button
                onClick={togglePause}
                variant={game.status === 'paused' ? 'primary' : 'secondary'}
                size="lg"
                fullWidth
              >
                {game.status === 'paused' ? '▶ Resume Game' : '⏸ Pause Game'}
              </Button>
              <Button
                onClick={passTurn}
                disabled={game.status === 'paused'}
                variant="secondary"
                size="md"
                fullWidth
              >
                Pass Current Turn
              </Button>
              <Button
                onClick={rewindTurn}
                disabled={game.currentTurn === 0}
                variant="ghost"
                size="md"
                fullWidth
              >
                ⏪ Rewind Turn
              </Button>
              <Button
                onClick={resetTurnToStart}
                variant="ghost"
                size="md"
                fullWidth
              >
                🔄 Reset to Turn 0
              </Button>
              <Button
                onClick={nextRound}
                variant="ghost"
                size="md"
                fullWidth
                className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
              >
                Next Round →
              </Button>
              <div className="pt-3 mt-3 border-t border-gray-700">
                <Button
                  onClick={resetGame}
                  variant="danger"
                  size="md"
                  fullWidth
                >
                  🔄 Reset Entire Game
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent History */}
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold mb-4">Recent Actions</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {!game.history?.length ? (
                <p className="text-gray-500 text-sm">No actions yet</p>
              ) : (
                game.history.slice(0, 10).map((turn: TurnHistory) => (
                  <div key={turn.id} className="text-sm text-gray-300 border-b border-gray-700 pb-2">
                    <span className="font-medium">{turn.playerName}</span> - {turn.action}
                    <div className="text-xs text-gray-500">
                      Turn {turn.turnNumber}
                    </div>
                  </div>
                ))
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
            adminPin={adminPin || undefined}
          />
        </div>

        {/* Player Scores */}
        <Card variant="elevated" padding="lg" className="mt-8">
          <h2 className="text-xl font-bold mb-4">Player Scores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {game.players.map((player: Player) => (
              <div key={player.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                <div className="font-bold text-lg mb-2">{player.name}</div>
                {player.faction && (
                  <div className="text-sm text-gray-400 mb-3">{player.faction}</div>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-400">Score:</label>
                  <input
                    type="number"
                    value={player.score}
                    onBlur={(e) => updateScore(player.id, parseInt(e.target.value) || 0)}
                    onChange={(e) => {
                      // Update local display immediately
                      const newScore = parseInt(e.target.value) || 0;
                      e.target.value = newScore.toString();
                    }}
                    className="w-20 px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
