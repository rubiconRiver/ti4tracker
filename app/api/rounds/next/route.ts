import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitToGame } from '@/lib/socket';

// Advance to the next round
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId } = body;

    const game = await db.game.findUnique({
      where: { id: gameId },
      include: {
        players: true,
        rounds: {
          where: { roundNumber: { equals: await db.game.findUnique({ where: { id: gameId } }).then(g => g?.currentRound || 1) } },
          include: { strategyPicks: true },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // End current round
    const currentRound = game.rounds[0];
    if (currentRound) {
      await db.round.update({
        where: { id: currentRound.id },
        data: { endedAt: new Date() },
      });
    }

    // Increment round number and pause for strategy card assignment
    const updatedGame = await db.game.update({
      where: { id: gameId },
      data: {
        currentRound: game.currentRound + 1,
        status: 'paused',
      },
      include: {
        players: {
          orderBy: { turnOrder: 'asc' },
        },
      },
    });

    // Clear strategy cards and pass status for next round
    await db.player.updateMany({
      where: { gameId },
      data: {
        strategyCard: null,
        hasPassed: false,
      },
    });

    emitToGame(gameId, 'round-ended', { game: updatedGame });

    return NextResponse.json({ game: updatedGame });
  } catch (error) {
    console.error('Error advancing round:', error);
    return NextResponse.json({ error: 'Failed to advance round' }, { status: 500 });
  }
}
