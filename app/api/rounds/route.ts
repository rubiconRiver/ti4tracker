import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitToGame } from '@/lib/socket';

// Start a new round with strategy card assignments
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, strategyAssignments } = body;
    // strategyAssignments: [{ playerId: string, cardNumber: number }]

    const game = await db.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Create new round
    const round = await db.round.create({
      data: {
        gameId,
        roundNumber: game.currentRound,
      },
    });

    // Create strategy card picks and update player turn order
    for (let i = 0; i < strategyAssignments.length; i++) {
      const assignment = strategyAssignments[i];

      await db.strategyCardPick.create({
        data: {
          roundId: round.id,
          playerId: assignment.playerId,
          cardNumber: assignment.cardNumber,
          pickOrder: i,
        },
      });

      // Update player's current strategy card, turn order, and clear pass status
      await db.player.update({
        where: { id: assignment.playerId },
        data: {
          strategyCard: assignment.cardNumber,
          turnOrder: assignment.cardNumber, // Card 1 = turnOrder 1, Card 2 = turnOrder 2, etc.
          hasPassed: false, // Reset pass status for new round
        },
      });
    }

    // Reset currentTurn to 0, set first player, and unpause game when starting a new round with new turn order
    await db.game.update({
      where: { id: gameId },
      data: {
        currentTurn: 0,
        currentPlayerTurnOrder: 1, // Start with turn order 1 (strategy card 1)
        turnStartedAt: new Date(),
        status: 'active', // Unpause game when round starts
      },
    });

    // Fetch updated game state
    const updatedGame = await db.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          orderBy: { turnOrder: 'asc' },
        },
      },
    });

    emitToGame(gameId, 'round-started', { game: updatedGame, round });

    return NextResponse.json({ game: updatedGame, round });
  } catch (error) {
    console.error('Error starting round:', error);
    return NextResponse.json({ error: 'Failed to start round' }, { status: 500 });
  }
}
