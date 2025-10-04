'use client';

import { useEffect, useState, use } from 'react';
import { useGamePolling } from '@/components/game/use-game-polling';
import StrategyCardAssignment from '@/components/game/strategy-card-assignment';
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
  players: Player[];
  history: TurnHistory[];
}

export default function AdminPanel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: game } = useGamePolling(id, { interval: 2000 });
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    // Generate QR code
    const joinUrl = `${window.location.origin}/game/${id}/join`;
    QRCode.toDataURL(joinUrl, { width: 300 }).then((url) => setQrCodeUrl(url));
  }, [id]);

  const updateScore = async (playerId: string, newScore: number) => {
    try {
      await fetch('/api/players', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playerId, score: newScore }),
      });
      // Polling will update automatically
    } catch (error) {
      console.error('Error updating score:', error);
      alert('Failed to update score');
    }
  };

  const rewindTurn = async () => {
    if (!game || game.currentTurn === 0) return;

    if (!confirm('Rewind to the previous turn?')) return;

    try {
      await fetch(`/api/games/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTurn: game.currentTurn - 1 }),
      });
      // Polling will update automatically
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
        body: JSON.stringify({ gameId: id }),
      });
      // Polling will update automatically
    } catch (error) {
      console.error('Error advancing round:', error);
      alert('Failed to advance round');
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Admin Panel</h1>
          <a
            href={`/game/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
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
                  {window.location.origin}/game/{id}/join
                </div>
              </div>
            )}
          </div>

          {/* Game Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-black">Game Controls</h2>
            <div className="space-y-3">
              <div className="text-lg text-gray-700">
                Round: <span className="font-bold text-black">{game.currentRound}</span>
              </div>
              <div className="text-lg text-gray-700">
                Current Turn: <span className="font-bold text-black">{game.currentTurn}</span>
              </div>
              <button
                onClick={rewindTurn}
                disabled={game.currentTurn === 0}
                className="w-full px-4 py-3 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⏪ Rewind Turn
              </button>
              <button
                onClick={nextRound}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Next Round →
              </button>
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-black">Recent Actions</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {game.history.slice(0, 10).map((turn: TurnHistory) => (
                <div key={turn.id} className="text-sm text-gray-700 border-b pb-2">
                  <span className="font-medium">{turn.playerName}</span> - {turn.action}
                  <div className="text-xs text-gray-500">
                    Turn {turn.turnNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Player Scores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {game.players.map((player) => (
              <div key={player.id} className="border rounded-lg p-4">
                <div className="font-bold text-lg text-black mb-2">{player.name}</div>
                {player.faction && (
                  <div className="text-sm text-gray-600 mb-3">{player.faction}</div>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Score:</label>
                  <input
                    type="number"
                    value={player.score}
                    onChange={(e) => updateScore(player.id, parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-black"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
