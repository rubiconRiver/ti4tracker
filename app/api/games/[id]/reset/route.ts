import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Reset all players to initial state
    await db.player.updateMany({
      where: { gameId: id },
      data: {
        score: 0,
        totalTimeMs: 0,
        strategyCard: null,
        hasSpeaker: false,
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

    // Reset game state
    const game = await db.game.update({
      where: { id },
      data: {
        currentTurn: 0,
        currentRound: 1,
        turnStartedAt: new Date(),
        speakerPlayerId: null,
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
