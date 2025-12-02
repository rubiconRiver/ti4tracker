import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST() {
  try {
    const adminPin = generatePin();
    console.log('Generated PIN:', adminPin);

    const game = await db.game.create({
      data: {
        status: 'setup',
        adminPin,
      },
    });

    console.log('Created game:', game);
    console.log('Game adminPin:', game.adminPin);

    // Return the game with adminPin explicitly included
    const response = {
      id: game.id,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
      status: game.status,
      currentTurn: game.currentTurn,
      currentRound: game.currentRound,
      currentPlayerTurnOrder: game.currentPlayerTurnOrder,
      speakerPlayerId: game.speakerPlayerId,
      turnStartedAt: game.turnStartedAt,
      adminPin: adminPin, // Use the generated PIN directly
    };
    console.log('Response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const games = await db.game.findMany({
      include: {
        players: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
