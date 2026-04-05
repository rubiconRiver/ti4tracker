import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitToGame } from '@/lib/socket';

interface PreviousState {
  // end_turn / pass fields
  gameCurrentTurn?: number;
  gameCurrentPlayerTurnOrder?: number;
  gameTurnStartedAt?: string;
  gameStatus?: string;
  playerTotalTimeMs?: number;
  playerHasPassed?: boolean;
  // score_change
  playerScore?: number;
  // use_strategy_card
  playerHasUsedStrategyCard?: boolean;
  // start_secondary / end_secondary
  gameSecondaryCardNumber?: number | null;
  gameSecondaryPlayerId?: string | null;
}

export async function POST(request: Request) {
  try {
    const { gameId } = await request.json();

    // Find the most recent non-undo action
    const lastAction = await db.turnHistory.findFirst({
      where: {
        gameId,
        action: { not: 'undo' },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastAction) {
      return NextResponse.json({ error: 'Nothing to undo' }, { status: 400 });
    }

    if (!lastAction.previousState) {
      return NextResponse.json({ error: 'Cannot undo: no snapshot available (legacy record)' }, { status: 400 });
    }

    const prev = lastAction.previousState as PreviousState;

    // Build update payloads from the snapshot
    const gameUpdate: Record<string, unknown> = {};
    const playerUpdate: Record<string, unknown> = {};

    // Restore game fields
    if (prev.gameCurrentTurn !== undefined) gameUpdate.currentTurn = prev.gameCurrentTurn;
    if (prev.gameCurrentPlayerTurnOrder !== undefined) gameUpdate.currentPlayerTurnOrder = prev.gameCurrentPlayerTurnOrder;
    if (prev.gameTurnStartedAt !== undefined) gameUpdate.turnStartedAt = new Date(prev.gameTurnStartedAt);
    if (prev.gameStatus !== undefined) gameUpdate.status = prev.gameStatus;
    if (prev.gameSecondaryCardNumber !== undefined) gameUpdate.secondaryCardNumber = prev.gameSecondaryCardNumber;
    if (prev.gameSecondaryPlayerId !== undefined) gameUpdate.secondaryPlayerId = prev.gameSecondaryPlayerId;

    // Restore player fields
    if (prev.playerTotalTimeMs !== undefined) playerUpdate.totalTimeMs = prev.playerTotalTimeMs;
    if (prev.playerHasPassed !== undefined) playerUpdate.hasPassed = prev.playerHasPassed;
    if (prev.playerScore !== undefined) playerUpdate.score = prev.playerScore;
    if (prev.playerHasUsedStrategyCard !== undefined) playerUpdate.hasUsedStrategyCard = prev.playerHasUsedStrategyCard;

    // Apply game update
    if (Object.keys(gameUpdate).length > 0) {
      await db.game.update({
        where: { id: gameId },
        data: gameUpdate,
      });
    }

    // Apply player update
    if (Object.keys(playerUpdate).length > 0 && lastAction.playerId) {
      await db.player.update({
        where: { id: lastAction.playerId },
        data: playerUpdate,
      });
    }

    // Delete the reversed action
    await db.turnHistory.delete({
      where: { id: lastAction.id },
    });

    // Log the undo
    await db.turnHistory.create({
      data: {
        gameId,
        playerId: lastAction.playerId,
        playerName: lastAction.playerName,
        playerColor: lastAction.playerColor,
        roundNumber: lastAction.roundNumber,
        turnNumber: lastAction.turnNumber,
        turnStartedAt: lastAction.turnStartedAt,
        action: 'undo',
        previousState: { undoneAction: lastAction.action, undoneId: lastAction.id },
      },
    });

    const updatedGame = await db.game.findUnique({
      where: { id: gameId },
      include: { players: { orderBy: { turnOrder: 'asc' } } },
    });

    emitToGame(gameId, 'undo-performed', { game: updatedGame, undoneAction: lastAction.action });
    return NextResponse.json({ game: updatedGame, undoneAction: lastAction.action });
  } catch (error) {
    console.error('Error undoing action:', error);
    return NextResponse.json({ error: 'Failed to undo' }, { status: 500 });
  }
}
