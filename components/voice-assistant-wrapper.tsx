'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import VoiceAssistant from './voice-assistant';
import { parseVoiceCommand } from '@/lib/voice-commands';

interface Player {
  id: string;
  name: string;
  color: string;
  turnOrder: number;
  score: number;
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

export default function VoiceAssistantWrapper() {
  const pathname = usePathname();
  const [game, setGame] = useState<Game | null>(null);

  // Extract game ID from pathname if we're in a game
  const gameIdMatch = pathname?.match(/\/game\/([^/]+)/);
  const gameId = gameIdMatch?.[1];

  // Fetch game data when in a game context
  useEffect(() => {
    if (!gameId) {
      setGame(null);
      return;
    }

    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/games/${gameId}`);
        if (res.ok) {
          const data = await res.json();
          setGame(data);
        }
      } catch (error) {
        console.error('Failed to fetch game for voice commands:', error);
      }
    };

    fetchGame();

    // Refresh game data periodically
    const interval = setInterval(fetchGame, 5000);
    return () => clearInterval(interval);
  }, [gameId]);

  const handleCommand = async (command: string) => {
    console.log('Voice command received:', command);

    const parsed = parseVoiceCommand(command);
    console.log('Parsed command:', parsed);

    // If we're in a game context, execute game commands
    if (gameId && game) {
      await executeGameCommand(gameId, game, parsed);
    } else {
      console.log('No game context - command ignored:', command);
    }
  };

  return <VoiceAssistant onCommand={handleCommand} />;
}

async function executeGameCommand(gameId: string, game: Game, parsed: ReturnType<typeof parseVoiceCommand>) {
  try {
    switch (parsed.type) {
      case 'next_turn':
      case 'pass_turn': {
        // Find current player
        const currentPlayer = game.players.find(p => p.turnOrder === game.currentPlayerTurnOrder);
        if (!currentPlayer || game.status === 'paused') {
          console.log('Cannot pass turn - no current player or game is paused');
          return;
        }

        const turnStartTime = new Date(game.turnStartedAt).getTime();
        const turnDurationMs = Date.now() - turnStartTime;

        await fetch('/api/turns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            playerId: currentPlayer.id,
            action: 'pass',
            turnDurationMs,
          }),
        });
        console.log('Turn passed');
        break;
      }

      case 'pause': {
        if (game.status === 'paused') {
          console.log('Game already paused');
          return;
        }

        await fetch(`/api/games/${gameId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paused' }),
        });
        console.log('Game paused');
        break;
      }

      case 'resume': {
        if (game.status !== 'paused') {
          console.log('Game is not paused');
          return;
        }

        await fetch(`/api/games/${gameId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'active',
            turnStartedAt: new Date(),
          }),
        });
        console.log('Game resumed');
        break;
      }

      case 'rewind': {
        if (game.currentTurn === 0) {
          console.log('Cannot rewind - already at turn 0');
          return;
        }

        // Find previous player (simple implementation - just go back one turn order)
        const previousTurnOrder = game.currentPlayerTurnOrder === 1
          ? game.players.length
          : game.currentPlayerTurnOrder - 1;

        await fetch(`/api/games/${gameId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentTurn: game.currentTurn - 1,
            currentPlayerTurnOrder: previousTurnOrder,
          }),
        });
        console.log('Turn rewound');
        break;
      }

      case 'next_round': {
        await fetch('/api/rounds/next', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId }),
        });
        console.log('Advanced to next round');
        break;
      }

      case 'reset_turn': {
        await fetch(`/api/games/${gameId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentTurn: 0,
            currentPlayerTurnOrder: 1,
          }),
        });
        console.log('Turn reset to 0');
        break;
      }

      case 'set_score': {
        if (!parsed.params?.playerName || parsed.params.score === undefined) {
          console.log('Missing player name or score');
          return;
        }

        // Find player by name or color
        const player = game.players.find(p =>
          p.name.toLowerCase().includes(parsed.params!.playerName!.toLowerCase()) ||
          p.color.toLowerCase().includes(parsed.params!.playerName!.toLowerCase())
        );

        if (!player) {
          console.log(`Player not found: ${parsed.params.playerName}`);
          return;
        }

        await fetch('/api/players', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: player.id,
            score: parsed.params.score,
          }),
        });
        console.log(`Set ${player.name}'s score to ${parsed.params.score}`);
        break;
      }

      case 'unknown': {
        console.log('Unknown command:', parsed.originalText);
        break;
      }
    }
  } catch (error) {
    console.error('Failed to execute command:', error);
  }
}
