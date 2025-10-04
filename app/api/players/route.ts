import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitToGame } from '@/lib/socket';

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

    // Notify all clients in the game
    emitToGame(gameId, 'player-joined', player);

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const player = await db.player.update({
      where: { id },
      data,
    });

    const gameId = player.gameId;
    emitToGame(gameId, 'player-updated', player);

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}
