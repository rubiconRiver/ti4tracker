'use client';

import { useEffect, useState, use } from 'react';
import { useGamePolling } from '@/components/game/use-game-polling';
import StrategyCardAssignment from '@/components/game/strategy-card-assignment';
import { getStrategyCardName } from '@/lib/strategy-cards';
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
  hasUsedStrategyCard: boolean;
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
  secondaryCardNumber: number | null;
  secondaryPlayerId: string | null;
  players: Player[];
  history: TurnHistory[];
}

export default function AdminPanel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: game } = useGamePolling(id, { interval: 2000 });
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const joinUrl = `${window.location.origin}/game/${id}/join`;
    QRCode.toDataURL(joinUrl, { width: 300 }).then((url) => setQrCodeUrl(url));
  }, [id]);

  // --- Action helpers ---
  const callAction = async (action: string, playerId?: string, extra: Record<string, unknown> = {}) => {
    if (!game) return;
    const currentPlayer = game.players.find((p: Player) => p.turnOrder === game.currentPlayerTurnOrder);
    const pid = playerId || currentPlayer?.id;
    const turnStartTime = new Date(game.turnStartedAt).getTime();
    const turnDurationMs = Date.now() - turnStartTime;

    try {
      await fetch('/api/turns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: id, playerId: pid, action, turnDurationMs, ...extra }),
      });
    } catch (error) {
      console.error(`Error calling ${action}:`, error);
      alert(`Failed: ${action}`);
    }
  };

  const undoAction = async () => {
    try {
      const res = await fetch('/api/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: id }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || 'Undo failed');
    } catch (error) {
      console.error('Error undoing:', error);
      alert('Failed to undo');
    }
  };

  const changeScore = async (playerId: string, delta: number) => {
    await callAction('score_change', playerId, { scoreChange: delta });
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

  const resetGame = async () => {
    const confirmation = prompt('Type "RESET" to confirm. This will reset ALL scores, times, history, and strategy cards.');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const currentPlayer = game.players.find((p: Player) => p.turnOrder === game.currentPlayerTurnOrder);
  const isSecondary = game.status === 'secondary_resolution';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Admin Panel</h1>
          <a href={`/game/${id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View TV Display
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Code */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-black">Join Game</h2>
            {qrCodeUrl && (
              <div>
                <img src={qrCodeUrl} alt="QR Code" className="w-full" />
                <div className="mt-4 text-sm text-gray-600 break-all">
                  {typeof window !== 'undefined' && window.location.origin}/game/{id}/join
                </div>
              </div>
            )}
          </div>

          {/* Game Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-black">Game Controls</h2>
            <div className="space-y-3">
              <div className="text-lg text-gray-700">
                Status: <span className={`font-bold ${
                  isSecondary ? 'text-red-600' :
                  game.status === 'paused' ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {isSecondary ? `🔄 SECONDARY (${getStrategyCardName(game.secondaryCardNumber!)})` :
                   game.status === 'paused' ? '⏸ PAUSED' : '▶ ACTIVE'}
                </span>
              </div>
              <div className="text-lg text-gray-700">
                Round: <span className="font-bold text-black">{game.currentRound}</span> | Turn: <span className="font-bold text-black">{game.currentTurn}</span>
              </div>
              {currentPlayer && (
                <div className="text-lg text-gray-700">
                  Current: <span className="font-bold text-black">{currentPlayer.name}</span>
                </div>
              )}

              {/* Secondary resolution controls */}
              {isSecondary && (
                <button
                  onClick={() => callAction('end_secondary')}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                  End Secondary Resolution
                </button>
              )}

              <button onClick={togglePause} className={`w-full px-4 py-3 rounded-lg font-bold text-white transition-colors ${
                game.status === 'paused' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'
              }`}>
                {game.status === 'paused' ? '▶ Resume Game' : '⏸ Pause Game'}
              </button>

              <button
                onClick={() => callAction('pass')}
                disabled={game.status === 'paused'}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pass Current Turn
              </button>

              <button
                onClick={undoAction}
                className="w-full px-4 py-3 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-600 transition-colors"
              >
                ⏪ Undo Last Action
              </button>

              <button onClick={nextRound} className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                Next Round →
              </button>

              <div className="pt-3 mt-3 border-t">
                <button onClick={resetGame} className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                  Reset Entire Game
                </button>
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-black">Recent Actions</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {game.history.slice(0, 15).map((turn: TurnHistory) => (
                <div key={turn.id} className="text-sm text-gray-700 border-b pb-2">
                  <span className="font-medium">{turn.playerName}</span>{' '}
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    turn.action === 'undo' ? 'bg-yellow-100 text-yellow-800' :
                    turn.action === 'pass' ? 'bg-orange-100 text-orange-800' :
                    turn.action === 'score_change' ? 'bg-green-100 text-green-800' :
                    turn.action === 'use_strategy_card' ? 'bg-purple-100 text-purple-800' :
                    turn.action === 'start_secondary' ? 'bg-red-100 text-red-800' :
                    turn.action === 'end_secondary' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {turn.action.replace(/_/g, ' ')}
                  </span>
                  <div className="text-xs text-gray-500">Turn {turn.turnNumber}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy Card Assignment */}
        <div className="mt-8">
          <StrategyCardAssignment gameId={id} players={game.players} currentRound={game.currentRound} onAssigned={() => {}} />
        </div>

        {/* Player Scores & Strategy Cards */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {game.players.map((player: Player) => (
              <div key={player.id} className="border rounded-lg p-4">
                <div className="font-bold text-lg text-black">{player.name}</div>
                {player.faction && <div className="text-sm text-gray-600 mb-2">{player.faction}</div>}

                {/* Score with +/- buttons */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => changeScore(player.id, -1)}
                    className="w-8 h-8 bg-red-100 text-red-700 rounded font-bold hover:bg-red-200"
                  >-</button>
                  <span className="text-2xl font-bold text-black w-12 text-center">{player.score}</span>
                  <button
                    onClick={() => changeScore(player.id, 1)}
                    className="w-8 h-8 bg-green-100 text-green-700 rounded font-bold hover:bg-green-200"
                  >+</button>
                </div>

                {/* Strategy card status */}
                {player.strategyCard && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm ${player.hasUsedStrategyCard ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {player.strategyCard}. {getStrategyCardName(player.strategyCard)}
                    </span>
                    {!player.hasUsedStrategyCard && (
                      <button
                        onClick={() => callAction('use_strategy_card', player.id)}
                        className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Flip
                      </button>
                    )}
                  </div>
                )}

                {player.hasPassed && <span className="text-xs text-orange-600 font-bold">PASSED</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
