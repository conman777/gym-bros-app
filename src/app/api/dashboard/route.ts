import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId.value },
      include: {
        stats: true,
        workouts: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          include: {
            exercises: {
              include: {
                sets: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      // User cookie exists but user not found in DB - clear the invalid cookie
      const response = NextResponse.json({ error: 'User not found' }, { status: 404 });
      response.cookies.delete('userId');
      return response;
    }

    const todayWorkout = user.workouts[0] || null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        rehabEnabled: user.rehabEnabled,
        stats: user.stats,
      },
      todayWorkout,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
