import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth-helpers';
import type { HabitType, HabitStats } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body as { type: HabitType };

    if (!type || (type !== 'SMOKING' && type !== 'NICOTINE_POUCH')) {
      return NextResponse.json(
        { error: 'Invalid habit type. Must be SMOKING or NICOTINE_POUCH' },
        { status: 400 }
      );
    }

    const habitLog = await prisma.habitLog.create({
      data: {
        userId: auth.userId,
        type,
      },
    });

    return NextResponse.json(habitLog, { status: 201 });
  } catch (error) {
    console.error('Error creating habit log:', error);
    return NextResponse.json({ error: 'Failed to log habit' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const [todayLogs, weekLogs] = await Promise.all([
      prisma.habitLog.findMany({
        where: {
          userId: auth.userId,
          timestamp: {
            gte: startOfToday,
          },
        },
      }),
      prisma.habitLog.findMany({
        where: {
          userId: auth.userId,
          timestamp: {
            gte: startOfWeek,
          },
        },
      }),
    ]);

    const stats: HabitStats = {
      today: {
        smoking: todayLogs.filter((log) => log.type === 'SMOKING').length,
        nicotinePouches: todayLogs.filter((log) => log.type === 'NICOTINE_POUCH').length,
      },
      thisWeek: {
        smoking: weekLogs.filter((log) => log.type === 'SMOKING').length,
        nicotinePouches: weekLogs.filter((log) => log.type === 'NICOTINE_POUCH').length,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching habit stats:', error);
    return NextResponse.json({ error: 'Failed to fetch habit stats' }, { status: 500 });
  }
}
