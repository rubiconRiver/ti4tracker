'use client';

import { useEffect, useState, use } from 'react';
import { useGamePolling } from '@/components/game/use-game-polling';
import { getStrategyCardName, getStrategyCardColor } from '@/lib/strategy-cards';
import { getFactionIcon } from '@/lib/factions';
import Link from 'next/link';
import StrategyCardAssignment from '@/components/game/strategy-card-assignment';
import { Button, Card, Badge } from '@/components/ui';
import { getPlayerColor, type PlayerColorId } from '@/lib/design-system/tokens/colors';

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

function getFactionInitials(faction: string | null): string {
  if (!faction) return '';
  const words = faction.split(' ').filter(w => w.length > 0);
  return words.slice(0, 3).map(w => w[0].toUpperCase()).join('');
}

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: game } = useGamePolling(id, { interval: 2000 });
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  useEffect(() => {
    if (!game) return;
    const currentPlayer = game.players.find((p: Player) => p.turnOrder === game.currentPlayerTurnOrder);
    const playerIndex = currentPlayer ? game.players.indexOf(currentPlayer) : 0;
    setCurrentPlayerIndex(playerIndex);
  }, [game]);

  const endTurn = async () => {
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
          action: 'end_turn',
          turnDurationMs,
        }),
      });
    } catch (error) {
      console.error('Error ending turn:', error);
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
      setShowPassConfirm(false);
    } catch (error) {
      console.error('Error passing turn:', error);
    }
  };

  // Timer for current turn
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl text-gray-400">Loading...</div>
      </div>
    );
  }

  const currentPlayer = game.players[currentPlayerIndex];
  const playerColor = getPlayerColor(currentPlayer?.color as PlayerColorId);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">TI4 Tracker</h1>
          <div className="text-sm text-gray-400">Round {game.currentRound}</div>
        </div>
        <div className="flex gap-3">
          <Link href={`/game/${id}/admin`}>
            <Button variant="secondary" size="md">
              Admin Panel
            </Button>
          </Link>
          <Link href={`/game/${id}/join`}>
            <Button variant="primary" size="md">
              Join Game
            </Button>
          </Link>
        </div>
      </div>

      {/* Current Player - Large Display OR Strategy Card Assignment */}
      <div className="flex flex-col items-center justify-center py-16">
        {game.status === 'paused' ? (
          <div className="w-full max-w-5xl px-8">
            <StrategyCardAssignment
              gameId={id}
              players={game.players}
              currentRound={game.currentRound}
              onAssigned={() => {}}
            />
          </div>
        ) : (
          <>
            <div className="text-4xl font-semibold mb-4 text-gray-400">Current Turn</div>

            {/* Current Player Card */}
            <div
              className={`${playerColor.bg} px-24 py-16 rounded-3xl shadow-2xl border-8 ${playerColor.border} relative`}
            >
              {/* Faction Icon */}
              {currentPlayer?.faction && getFactionIcon(currentPlayer.faction) && (
                <div className="absolute top-8 left-8 w-24 h-24 bg-white/20 rounded-full flex items-center justify-center p-2 overflow-hidden backdrop-blur-sm">
                  <img
                    src={getFactionIcon(currentPlayer.faction)!}
                    alt={currentPlayer.faction}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Speaker Badge */}
              {currentPlayer?.hasSpeaker && (
                <div className="absolute top-6 right-6">
                  <Badge variant="warning" size="lg" icon={<span>👑</span>}>
                    Speaker
                  </Badge>
                </div>
              )}

              <div className={`text-8xl font-bold text-center mb-4 ${playerColor.text}`}>
                {currentPlayer?.name}
              </div>
              {currentPlayer?.faction && (
                <div className={`text-4xl text-center ${playerColor.text} opacity-90`}>
                  {currentPlayer.faction}
                </div>
              )}
            </div>

            {/* Turn Timer */}
            <div className="mt-12 text-7xl font-mono font-bold tabular-nums">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-2xl text-gray-400 mt-2">Turn Time</div>

            {/* Turn Action Buttons */}
            <div className="mt-8 flex gap-4 items-center">
              <Button variant="secondary" size="xl" onClick={endTurn}>
                End Turn
              </Button>

              {/* Pass Button with Confirmation */}
              {!showPassConfirm ? (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setShowPassConfirm(true)}
                  className="text-orange-400 border-orange-500/50 hover:bg-orange-500/10"
                >
                  Pass
                </Button>
              ) : (
                <Card variant="glass" padding="sm" className="flex gap-3 items-center">
                  <span className="text-sm text-gray-300 px-2">Pass turn?</span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={passTurn}
                    className="bg-orange-600 hover:bg-orange-500"
                  >
                    Yes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassConfirm(false)}
                  >
                    No
                  </Button>
                </Card>
              )}
            </div>
          </>
        )}
      </div>

      {/* All Players Overview */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {game.players.map((player: Player, index: number) => {
            const colors = getPlayerColor(player.color as PlayerColorId);
            const isActive = index === currentPlayerIndex && game.status !== 'paused';

            return (
              <Card
                key={player.id}
                variant="player"
                playerColor={player.color as PlayerColorId}
                className={`
                  ${isActive ? `ring-4 ${colors.border} shadow-lg` : ''}
                  ${player.hasPassed ? 'opacity-50' : ''}
                  transition-all duration-300
                `}
                padding="lg"
              >
                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {player.hasPassed && (
                    <Badge variant="warning" size="sm">
                      PASSED
                    </Badge>
                  )}
                  {player.hasSpeaker && (
                    <Badge variant="warning" size="sm" icon={<span>👑</span>}>
                      Speaker
                    </Badge>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center font-bold relative overflow-hidden shadow-lg`}>
                    {getFactionIcon(player.faction) ? (
                      <img
                        src={getFactionIcon(player.faction)!}
                        alt={player.faction || ''}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <div className={`${colors.text} text-lg`}>
                        {getFactionInitials(player.faction) || player.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{player.name}</div>
                    {player.faction && (
                      <div className="text-sm text-gray-400">{player.faction}</div>
                    )}
                  </div>
                </div>

                {/* Strategy Card */}
                {player.strategyCard && (
                  <div className={`mb-4 px-4 py-2.5 rounded-xl ${getStrategyCardColor(player.strategyCard)} text-white text-center font-bold shadow-md`}>
                    {player.strategyCard}. {getStrategyCardName(player.strategyCard)}
                  </div>
                )}

                {/* Stats */}
                <div className="space-y-2 pt-2 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Score</span>
                    <span className="text-3xl font-bold">{player.score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Time</span>
                    <span className="font-mono text-lg">{formatTime(player.totalTimeMs)}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
