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
        turnNumber: game.currentTurn,
        turnStartedAt: new Date(turnStartedAt),
        turnEndedAt: now,
        turnDurationMs: actualDurationMs,
        action,
      },
    });

    // Update player's total time
    await db.player.update({
      where: { id: playerId },
      data: {
        totalTimeMs: player.totalTimeMs + actualDurationMs,
      },
    });

    // Calculate next turn
    let nextTurnOrder = player.turnOrder + 1;
    if (nextTurnOrder >= game.players.length) {
      nextTurnOrder = 0;
    }

    // Update game to next turn
    const updatedGame = await db.game.update({
      where: { id: gameId },
      data: {
        currentTurn: game.currentTurn + 1,
      },
      include: {
        players: {
          orderBy: { turnOrder: 'asc' },
        },
      },
    });

    // Emit real-time update
    emitToGame(gameId, 'turn-ended', {
      turnHistory,
      game: updatedGame,
      nextPlayerId: game.players[nextTurnOrder].id,
    });

    return NextResponse.json({ turnHistory, game: updatedGame });
  } catch (error) {
    console.error('Error ending turn:', error);
    return NextResponse.json({ error: 'Failed to end turn' }, { status: 500 });
  }
}
