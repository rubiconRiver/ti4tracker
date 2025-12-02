import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Fields that can be updated via PATCH (whitelist approach)
const ALLOWED_UPDATE_FIELDS = [
  'status',
  'currentTurn',
  'currentRound',
  'currentPlayerTurnOrder',
  'turnStartedAt',
  'speakerPlayerId',
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const game = await db.game.findUnique({
      where: { id },
      include: {
        players: {
          orderBy: {
            turnOrder: 'asc',
          },
        },
        history: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Never expose adminPin in regular GET requests
    const { adminPin: _, ...safeGame } = game;
    return NextResponse.json(safeGame);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminPin, ...updateData } = body;

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

    // Only allow specific fields to be updated (whitelist)
    const sanitizedData: Record<string, unknown> = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (field in updateData) {
        sanitizedData[field] = updateData[field];
      }
    }

    const game = await db.game.update({
      where: { id },
      data: sanitizedData,
      include: {
        players: {
          orderBy: {
            turnOrder: 'asc',
          },
        },
      },
    });

    // Don't expose adminPin in response
    const { adminPin: __, ...safeGame } = game;
    return NextResponse.json(safeGame);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}
