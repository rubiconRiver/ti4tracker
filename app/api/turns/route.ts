import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitToGame } from '@/lib/socket';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, playerId, action, turnDurationMs } = body;

    // Get the current game state
    const game = await db.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          orderBy: { turnOrder: 'asc' },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const player = game.players.find((p) => p.id === playerId);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const now = new Date();
    const lastTurn = game.history[0];
    const turnStartedAt = lastTurn?.turnEndedAt || game.createdAt;
    const actualDurationMs = turnDurationMs || (now.getTime() - new Date(turnStartedAt).getTime());

    // Create turn history entry
    const turnHistory = await db.turnHistory.create({
      data: {
        gameId,
        playerId,
        playerName: player.name,
        playerColor: player.color,
        roundNumber: game.currentRound,
        turnNumber: game.currentTurn,
        turnStartedAt: new Date(turnStartedAt),
        turnEndedAt: now,
        turnDurationMs: actualDurationMs,
        action,
      },
    });

    // Update player's total time and pass status
    await db.player.update({
      where: { id: playerId },
      data: {
        totalTimeMs: player.totalTimeMs + actualDurationMs,
        hasPassed: action === 'pass',
      },
    });

    // Get fresh player data after updating hasPassed
    const updatedPlayers = await db.player.findMany({
      where: { gameId },
      orderBy: { turnOrder: 'asc' },
    });
    const allPassed = updatedPlayers.every((p) => p.hasPassed);

    // If everyone passed, pause the game
    if (allPassed) {
      const updatedGame = await db.game.update({
        where: { id: gameId },
        data: { status: 'paused' },
        include: {
          players: {
            orderBy: { turnOrder: 'asc' },
          },
        },
      });

      emitToGame(gameId, 'all-passed', { game: updatedGame });
      return NextResponse.json({ turnHistory, game: updatedGame });
    }

    // Find next player who hasn't passed (using fresh data)
    let nextTurnOrder = player.turnOrder + 1;
    let attempts = 0;
    while (attempts < updatedPlayers.length) {
      // Wrap around: turn order is 1-8, so after 8 comes 1
      if (nextTurnOrder > 8) {
        nextTurnOrder = 1;
      }

      const nextPlayer = updatedPlayers.find(p => p.turnOrder === nextTurnOrder);
      if (nextPlayer && !nextPlayer.hasPassed) {
        break;
      }

      nextTurnOrder++;
      attempts++;
    }

    // Update game to next turn and record when it started
    const updatedGame = await db.game.update({
      where: { id: gameId },
      data: {
        currentTurn: game.currentTurn + 1,
        currentPlayerTurnOrder: nextTurnOrder,
        turnStartedAt: now,
      },
      include: {
        players: {
          orderBy: { turnOrder: 'asc' },
        },
      },
    });

    // Emit real-time update
    const nextPlayer = updatedPlayers.find(p => p.turnOrder === nextTurnOrder);
    emitToGame(gameId, 'turn-ended', {
      turnHistory,
      game: updatedGame,
      nextPlayerId: nextPlayer?.id,
    });

    return NextResponse.json({ turnHistory, game: updatedGame });
  } catch (error) {
    console.error('Error ending turn:', error);
    return NextResponse.json({ error: 'Failed to end turn' }, { status: 500 });
  }
}
