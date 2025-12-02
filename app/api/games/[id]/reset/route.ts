import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminPin } = body;

    // Verify admin PIN
    const existingGame = await db.game.findUnique({
      where: { id },
      select: { adminPin: true },
    });

    if (!existingGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (existingGame.adminPin && existingGame.adminPin !== adminPin) {
      return NextResponse.json({ error: 'Invalid admin PIN' }, { status: 403 });
    }

    // Reset all players to initial state
    await db.player.updateMany({
      where: { gameId: id },
      data: {
        score: 0,
        totalTimeMs: 0,
        strategyCard: null,
        hasSpeaker: false,
        hasPassed: false,
      },
    });

    // Delete all turn history
    await db.turnHistory.deleteMany({
      where: { gameId: id },
    });

    // Delete all rounds
    await db.round.deleteMany({
      where: { gameId: id },
    });

    // Reset game state to paused (waiting for strategy cards)
    const game = await db.game.update({
      where: { id },
      data: {
        currentTurn: 0,
        currentRound: 1,
        currentPlayerTurnOrder: 1,
        turnStartedAt: new Date(),
        speakerPlayerId: null,
        status: 'paused',
      },
      include: {
        players: {
          orderBy: { turnOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ game });
  } catch (error) {
    console.error('Error resetting game:', error);
    return NextResponse.json({ error: 'Failed to reset game' }, { status: 500 });
  }
}
