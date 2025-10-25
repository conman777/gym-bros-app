import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { wallpaper: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ wallpaper: user.wallpaper });
  } catch (error) {
    console.error('Error fetching wallpaper:', error);
    return NextResponse.json({ error: 'Failed to fetch wallpaper' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wallpaper } = body;

    if (!wallpaper) {
      return NextResponse.json({ error: 'Wallpaper data required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { wallpaper },
      select: { wallpaper: true },
    });

    return NextResponse.json({ wallpaper: updatedUser.wallpaper });
  } catch (error) {
    console.error('Error saving wallpaper:', error);
    return NextResponse.json({ error: 'Failed to save wallpaper' }, { status: 500 });
  }
}
