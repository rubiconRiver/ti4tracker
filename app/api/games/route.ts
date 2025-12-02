import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST() {
  try {
    const adminPin = generatePin();

    const game = await db.game.create({
      data: {
        status: 'setup',
        adminPin,
      },
    });

    // Return the PIN only on creation - it won't be included in regular fetches
    return NextResponse.json({ ...game, adminPin });
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
