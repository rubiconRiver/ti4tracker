import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, name, color, faction, turnOrder } = body;

    const player = await db.player.create({
      data: {
        gameId,
        name,
        color,
        faction,
        turnOrder,
      },
    });

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}

// Fields that can be updated via PATCH (whitelist)
const ALLOWED_PLAYER_UPDATE_FIELDS = ['score', 'hasSpeaker', 'faction'];

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, adminPin, ...updateData } = body;

    // Get the player to find the game
    const existingPlayer = await db.player.findUnique({
      where: { id },
      include: { game: { select: { adminPin: true } } },
    });

    if (!existingPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Verify admin PIN
    if (existingPlayer.game.adminPin && existingPlayer.game.adminPin !== adminPin) {
      return NextResponse.json({ error: 'Invalid admin PIN' }, { status: 403 });
    }

    // Only allow specific fields to be updated (whitelist)
    const sanitizedData: Record<string, unknown> = {};
    for (const field of ALLOWED_PLAYER_UPDATE_FIELDS) {
      if (field in updateData) {
        sanitizedData[field] = updateData[field];
      }
    }

    const player = await db.player.update({
      where: { id },
      data: sanitizedData,
    });

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}
