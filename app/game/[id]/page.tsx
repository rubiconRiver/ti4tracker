'use client';

import { useEffect, useState, useCallback, useRef, use } from 'react';
import { useGamePolling } from '@/components/game/use-game-polling';
import { getStrategyCardName, getStrategyCardColor } from '@/lib/strategy-cards';
import { getFactionIcon } from '@/lib/factions';
import Link from 'next/link';
import StrategyCardAssignment from '@/components/game/strategy-card-assignment';

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
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  red: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-600', ring: 'ring-red-500' },
  blue: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-600', ring: 'ring-blue-500' },
  green: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-600', ring: 'ring-green-500' },
  yellow: { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-500', ring: 'ring-yellow-400' },
  purple: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-600', ring: 'ring-purple-500' },
  black: { bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-900', ring: 'ring-gray-700' },
  orange: { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-600', ring: 'ring-orange-500' },
  pink: { bg: 'bg-pink-600', text: 'text-white', border: 'border-pink-600', ring: 'ring-pink-500' },
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

function getFactionInitials(faction: string | null): string {
  if (!faction) return '';
  const words = faction.split(' ').filter(w => w.length > 0);
  return words.slice(0, 3).map(w => w[0].toUpperCase()).join('');
}

// --- Input state machine types ---
type InputMode =
  | { type: 'normal' }
  | { type: 'confirm_end_turn' }
  | { type: 'submenu'; selectedIndex: number }
  | { type: 'confirm_secondary' }; // after using strategy card, ask to start secondary

const SUBMENU_OPTIONS = [
  { label: 'Gain Point', icon: '+1' },
  { label: 'Lose Point', icon: '-1' },
  { label: 'Pass for Round', icon: '⏭' },
  { label: 'Use Strategy Card', icon: '🔄' },
] as const;

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: game } = useGamePolling(id, { interval: 2000 });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [frozenTime, setFrozenTime] = useState<number | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>({ type: 'normal' });
  const [recentlyFlippedPlayerId, setRecentlyFlippedPlayerId] = useState<string | null>(null);
  const [screenFlash, setScreenFlash] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const confirmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Find current player
  const currentPlayer = game?.players.find((p: Player) => p.turnOrder === game.currentPlayerTurnOrder) ?? null;
  const colorScheme = COLOR_MAP[currentPlayer?.color ?? 'red'] ?? COLOR_MAP.red;

  // --- API helpers ---
  const callAction = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    if (!game || actionInProgress) return;
    setActionInProgress(true);
    try {
      const playerId = currentPlayer?.id;
      const turnStartTime = new Date(game.turnStartedAt).getTime();
      const turnDurationMs = Date.now() - turnStartTime;
      await fetch('/api/turns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: id, playerId, action, turnDurationMs, ...extra }),
      });
    } catch (error) {
      console.error(`Error calling ${action}:`, error);
    } finally {
      setActionInProgress(false);
    }
  }, [game, id, currentPlayer, actionInProgress]);

  const callUndo = useCallback(async () => {
    if (!game || actionInProgress) return;
    setActionInProgress(true);
    try {
      await fetch('/api/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: id }),
      });
    } catch (error) {
      console.error('Error undoing:', error);
    } finally {
      setActionInProgress(false);
    }
  }, [game, id, actionInProgress]);

  // --- Submenu action handler ---
  const handleSubmenuSelect = useCallback(async (label: string) => {
    switch (label) {
      case 'Gain Point':
        await callAction('score_change', { scoreChange: 1 });
        break;
      case 'Lose Point':
        await callAction('score_change', { scoreChange: -1 });
        break;
      case 'Pass for Round':
        await callAction('pass');
        break;
      case 'Use Strategy Card':
        await callAction('use_strategy_card');
        // Trigger animation
        if (currentPlayer) {
          setRecentlyFlippedPlayerId(currentPlayer.id);
          setScreenFlash(true);
          setTimeout(() => setScreenFlash(false), 1000);
          setTimeout(() => setRecentlyFlippedPlayerId(null), 4000);
        }
        // Ask about secondary
        setInputMode({ type: 'confirm_secondary' });
        break;
    }
  }, [callAction, currentPlayer]);

  // --- R400 Keyboard handler ---
  useEffect(() => {
    if (!game) return;

    const isActionPhase = game.status === 'active' || game.status === 'secondary_resolution';
    if (!isActionPhase) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key;

      // Block F5 browser refresh
      if (key === 'F5') {
        e.preventDefault();
      }

      // During secondary resolution, Forward = end secondary
      if (game.status === 'secondary_resolution') {
        if (key === 'PageDown') {
          e.preventDefault();
          callAction('end_secondary');
          return;
        }
        if (key === 'PageUp') {
          e.preventDefault();
          callUndo();
          return;
        }
        if (key === '.') {
          e.preventDefault();
          // Open submenu even during secondary (for score changes)
          setInputMode({ type: 'submenu', selectedIndex: 0 });
          return;
        }
        return;
      }

      // Handle based on input mode
      switch (inputMode.type) {
        case 'normal':
          if (key === 'PageDown') {
            e.preventDefault();
            setInputMode({ type: 'confirm_end_turn' });
            // Auto-dismiss after 1.5s
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            confirmTimeoutRef.current = setTimeout(() => {
              setInputMode({ type: 'normal' });
            }, 1500);
          } else if (key === 'PageUp') {
            e.preventDefault();
            callUndo();
          } else if (key === '.') {
            e.preventDefault();
            setInputMode({ type: 'submenu', selectedIndex: 0 });
          }
          break;

        case 'confirm_end_turn':
          if (key === 'PageDown') {
            e.preventDefault();
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            setInputMode({ type: 'normal' });
            callAction('end_turn');
          } else {
            // Any other key cancels
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            setInputMode({ type: 'normal' });
          }
          break;

        case 'submenu':
          if (key === 'PageDown') {
            e.preventDefault();
            setInputMode({
              type: 'submenu',
              selectedIndex: (inputMode.selectedIndex + 1) % SUBMENU_OPTIONS.length,
            });
          } else if (key === 'PageUp') {
            e.preventDefault();
            setInputMode({
              type: 'submenu',
              selectedIndex: (inputMode.selectedIndex - 1 + SUBMENU_OPTIONS.length) % SUBMENU_OPTIONS.length,
            });
          } else if (key === 'F5') {
            e.preventDefault();
            const selected = SUBMENU_OPTIONS[inputMode.selectedIndex];
            setInputMode({ type: 'normal' });
            handleSubmenuSelect(selected.label);
          } else if (key === '.') {
            e.preventDefault();
            setInputMode({ type: 'normal' });
          }
          break;

        case 'confirm_secondary':
          if (key === 'PageDown' || key === 'F5') {
            e.preventDefault();
            setInputMode({ type: 'normal' });
            callAction('start_secondary');
          } else if (key === 'PageUp' || key === '.') {
            e.preventDefault();
            setInputMode({ type: 'normal' });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, inputMode, callAction, callUndo, handleSubmenuSelect]);

  // Timer effect
  useEffect(() => {
    if (!game) return;

    if (game.status === 'secondary_resolution') {
      // Freeze timer at current value
      if (frozenTime === null) {
        const turnStartTime = new Date(game.turnStartedAt).getTime();
        setFrozenTime(Date.now() - turnStartTime);
      }
      return;
    }

    // Clear frozen time when leaving secondary
    if (frozenTime !== null) setFrozenTime(null);

    if (game.status !== 'active') {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      const turnStartTime = new Date(game.turnStartedAt).getTime();
      setElapsedTime(Date.now() - turnStartTime);
    }, 100);

    return () => clearInterval(interval);
  }, [game, game?.status, frozenTime]);

  // Cleanup confirm timeout
  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    };
  }, []);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-2xl text-gray-400">Loading...</div>
      </div>
    );
  }

  const displayTime = frozenTime !== null ? frozenTime : elapsedTime;

  return (
    <div className={`min-h-screen bg-gray-900 text-white relative ${screenFlash ? 'animate-screen-flash' : ''}`}>
      {/* Secondary Resolution Banner */}
      {game.status === 'secondary_resolution' && game.secondaryCardNumber && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-900 via-red-700 to-red-900 py-6 text-center shadow-2xl">
          <div className="text-5xl font-bold tracking-wider animate-pulse">
            {getStrategyCardName(game.secondaryCardNumber).toUpperCase()} SECONDARY IN PROGRESS
          </div>
          <div className="text-2xl mt-2 text-red-200">
            Initiated by {game.players.find((p: Player) => p.id === game.secondaryPlayerId)?.name}
          </div>
          <div className="text-lg mt-1 text-red-300 opacity-75">
            Press Forward to end secondary
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-gray-800 px-8 py-3 flex justify-between items-center ${game.status === 'secondary_resolution' ? 'mt-32' : ''}`}>
        <div>
          <h1 className="text-xl font-bold text-gray-300">TI4 Tracker</h1>
          <div className="text-sm text-gray-500">Round {game.currentRound}</div>
        </div>
        <div className="flex gap-3">
          <Link href={`/game/${id}/admin`} className="px-3 py-1.5 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600 transition-colors">
            Admin
          </Link>
          <Link href={`/game/${id}/join`} className="px-3 py-1.5 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600 transition-colors">
            Join
          </Link>
        </div>
      </div>

      {/* Main Content */}
      {game.status === 'paused' ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-full max-w-4xl px-8">
            <div className="text-6xl font-bold text-orange-500 mb-8 text-center">STRATEGY SELECTION</div>
            <StrategyCardAssignment
              gameId={id}
              players={game.players}
              currentRound={game.currentRound}
              onAssigned={() => {}}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Current Player Display */}
          <div className="flex flex-col items-center pt-8 pb-4">
            <div className="text-2xl font-medium text-gray-500 mb-3">Current Turn</div>
            <div className={`${colorScheme.bg} ${colorScheme.text} px-16 py-8 rounded-2xl shadow-2xl border-4 ${colorScheme.border} relative`}>
              {currentPlayer?.faction && getFactionIcon(currentPlayer.faction) && (
                <div className="absolute top-4 left-4 w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center p-1.5 overflow-hidden">
                  <img src={getFactionIcon(currentPlayer.faction)!} alt={currentPlayer.faction} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="text-7xl font-bold text-center">{currentPlayer?.name}</div>
              {currentPlayer?.faction && (
                <div className="text-3xl text-center opacity-90 mt-1">{currentPlayer.faction}</div>
              )}
              {/* Current player's strategy card */}
              {currentPlayer?.strategyCard && (
                <div className={`mt-3 mx-auto px-4 py-1.5 rounded-lg text-center text-lg font-bold ${
                  currentPlayer.hasUsedStrategyCard
                    ? 'bg-black bg-opacity-40 line-through opacity-60'
                    : 'bg-white bg-opacity-20'
                }`}>
                  {currentPlayer.strategyCard}. {getStrategyCardName(currentPlayer.strategyCard)}
                  {currentPlayer.hasUsedStrategyCard && ' (USED)'}
                </div>
              )}
            </div>

            {/* Turn Timer */}
            <div className="mt-6 text-6xl font-mono font-bold tabular-nums">
              {formatTime(displayTime)}
            </div>
            <div className="text-xl text-gray-500 mt-1">
              {game.status === 'secondary_resolution' ? 'Timer Paused' : 'Turn Time'}
            </div>
          </div>

          {/* Player Cards Grid */}
          <div className="px-6 pb-6">
            <div className={`grid gap-4 ${
              game.players.length <= 4 ? 'grid-cols-2 lg:grid-cols-4' :
              game.players.length <= 6 ? 'grid-cols-3 lg:grid-cols-6' :
              'grid-cols-4 lg:grid-cols-8'
            }`}>
              {game.players
                .slice()
                .sort((a: Player, b: Player) => a.turnOrder - b.turnOrder)
                .map((player: Player) => {
                  const colors = COLOR_MAP[player.color] || COLOR_MAP.red;
                  const isActive = player.turnOrder === game.currentPlayerTurnOrder;
                  const isFlipping = player.id === recentlyFlippedPlayerId;

                  return (
                    <div
                      key={player.id}
                      className={`bg-gray-800 rounded-xl p-4 transition-all relative ${
                        isActive ? `ring-3 ${colors.ring} shadow-lg` : ''
                      } ${player.hasPassed ? 'opacity-40' : ''}`}
                    >
                      {/* Passed badge */}
                      {player.hasPassed && (
                        <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          PASSED
                        </div>
                      )}

                      {/* Player header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center font-bold relative overflow-hidden flex-shrink-0`}>
                          {player.hasSpeaker && (
                            <div className="absolute -top-0.5 -right-0.5 text-sm z-10">🔊</div>
                          )}
                          {getFactionIcon(player.faction) ? (
                            <img src={getFactionIcon(player.faction)!} alt={player.faction || ''} className="w-9 h-9 object-contain" />
                          ) : (
                            <div className="text-white text-sm">
                              {getFactionInitials(player.faction) || player.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-lg font-bold truncate">{player.name}</div>
                          {player.faction && (
                            <div className="text-xs text-gray-400 truncate">{player.faction}</div>
                          )}
                        </div>
                      </div>

                      {/* Score - prominent */}
                      <div className="text-center mb-3">
                        <div className="text-4xl font-bold">{player.score}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">VP</div>
                      </div>

                      {/* Strategy Card */}
                      {player.strategyCard && (
                        <div className={`mb-2 px-2 py-1.5 rounded-lg text-white text-center text-sm font-bold transition-all ${
                          isFlipping ? 'animate-card-flip animate-card-glow' : ''
                        } ${
                          player.hasUsedStrategyCard
                            ? 'bg-gray-700 opacity-50'
                            : getStrategyCardColor(player.strategyCard)
                        }`}>
                          <div className={player.hasUsedStrategyCard ? 'line-through' : ''}>
                            {player.strategyCard}. {getStrategyCardName(player.strategyCard)}
                          </div>
                          {player.hasUsedStrategyCard && (
                            <div className="text-xs text-gray-300 no-underline mt-0.5">USED</div>
                          )}
                        </div>
                      )}

                      {/* Time */}
                      <div className="text-center text-sm text-gray-400 font-mono">
                        {formatTime(player.totalTimeMs)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}

      {/* === Overlays === */}

      {/* Double-press confirmation toast */}
      {inputMode.type === 'confirm_end_turn' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-8 py-4 rounded-xl text-2xl font-bold animate-pulse shadow-2xl z-50">
          Press Forward again to End Turn
        </div>
      )}

      {/* Submenu overlay */}
      {inputMode.type === 'submenu' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-slide-in-up">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
            <div className="text-2xl font-bold text-center mb-6 text-gray-300">Actions</div>
            <div className="space-y-3">
              {SUBMENU_OPTIONS.map((option, idx) => (
                <div
                  key={option.label}
                  className={`px-6 py-4 rounded-xl text-2xl font-medium flex items-center gap-4 transition-all ${
                    idx === (inputMode as { type: 'submenu'; selectedIndex: number }).selectedIndex
                      ? 'bg-blue-600 text-white scale-105 shadow-lg animate-pulse-border border-2 border-yellow-400'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  <span className="text-3xl w-12 text-center">{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center text-sm text-gray-500">
              FWD / BACK: Navigate &bull; PLAY: Select &bull; BLANK: Close
            </div>
          </div>
        </div>
      )}

      {/* Confirm secondary prompt */}
      {inputMode.type === 'confirm_secondary' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl text-center">
            <div className="text-3xl font-bold mb-4">Start Secondary Resolution?</div>
            <div className="text-xl text-gray-400 mb-6">
              Other players will need to resolve the secondary ability
            </div>
            <div className="flex justify-center gap-8">
              <div className="text-xl">
                <span className="text-green-400 font-bold">FWD</span> = Yes
              </div>
              <div className="text-xl">
                <span className="text-red-400 font-bold">BACK</span> = No
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
