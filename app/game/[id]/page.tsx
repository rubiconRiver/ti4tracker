'use client';

import { useEffect, useState, use } from 'react';
import { useGamePolling } from '@/components/game/use-game-polling';
import { getStrategyCardName, getStrategyCardColor } from '@/lib/strategy-cards';
import Link from 'next/link';

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

interface Game {
  id: string;
  status: string;
  currentTurn: number;
  currentRound: number;
  players: Player[];
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  red: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-600' },
  blue: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-600' },
  green: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-600' },
  yellow: { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-500' },
  purple: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-600' },
  black: { bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-900' },
  orange: { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-600' },
  pink: { bg: 'bg-pink-600', text: 'text-white', border: 'border-pink-600' },
};

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

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: game } = useGamePolling(id, { interval: 2000 });
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!game) return;

    const playerIndex = game.currentTurn % game.players.length;
    setCurrentPlayerIndex(playerIndex);
  }, [game]);

  // Timer for current turn - uses turnStartedAt from database
  useEffect(() => {
    if (!game || game.status === 'paused') {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      const turnStartTime = new Date(game.turnStartedAt).getTime();
      setElapsedTime(Date.now() - turnStartTime);
    }, 100);

    return () => clearInterval(interval);
  }, [game]);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const currentPlayer = game.players[currentPlayerIndex];
  const colorScheme = COLOR_MAP[currentPlayer?.color] || COLOR_MAP.red;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with admin link */}
      <div className="bg-gray-800 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">TI4 Tracker</h1>
          <div className="text-sm text-gray-400">Round {game.currentRound}</div>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/game/${id}/admin`}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Admin Panel
          </Link>
          <Link
            href={`/game/${id}/join`}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Join Game
          </Link>
        </div>
      </div>

      {/* Current Player - Large Display */}
      <div className="flex flex-col items-center justify-center py-16">
        {game.status === 'paused' ? (
          <div className="text-center">
            <div className="text-6xl font-bold text-orange-500 mb-4">⏸ GAME PAUSED</div>
            <div className="text-2xl text-gray-400">Waiting for admin to resume...</div>
          </div>
        ) : (
          <>
            <div className="text-4xl font-semibold mb-4 text-gray-400">Current Turn</div>
            <div
              className={`${colorScheme.bg} ${colorScheme.text} px-24 py-16 rounded-3xl shadow-2xl border-8 ${colorScheme.border}`}
            >
              <div className="text-8xl font-bold text-center mb-4">{currentPlayer?.name}</div>
              {currentPlayer?.faction && (
                <div className="text-4xl text-center opacity-90">{currentPlayer.faction}</div>
              )}
            </div>

            {/* Turn Timer */}
            <div className="mt-12 text-6xl font-mono font-bold">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-2xl text-gray-400 mt-2">Turn Time</div>
          </>
        )}
      </div>

      {/* All Players Overview */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {game.players.map((player: Player, index: number) => {
            const colors = COLOR_MAP[player.color] || COLOR_MAP.red;
            const isActive = index === currentPlayerIndex;

            return (
              <div
                key={player.id}
                className={`bg-gray-800 rounded-lg p-6 ${
                  isActive ? `ring-4 ${colors.border}` : ''
                } transition-all`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center text-2xl font-bold`}>
                    {player.hasSpeaker && '🔊'}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{player.name}</div>
                    {player.faction && (
                      <div className="text-sm text-gray-400">{player.faction}</div>
                    )}
                  </div>
                </div>

                {player.strategyCard && (
                  <div className={`mb-3 px-3 py-2 rounded-lg ${getStrategyCardColor(player.strategyCard)} text-white text-center font-bold`}>
                    {player.strategyCard}. {getStrategyCardName(player.strategyCard)}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Score</span>
                    <span className="text-2xl font-bold">{player.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Time</span>
                    <span className="font-mono">{formatTime(player.totalTimeMs)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
