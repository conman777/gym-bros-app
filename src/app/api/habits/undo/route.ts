import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth-helpers';

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const mostRecentLog = await prisma.habitLog.findFirst({
      where: {
        userId: auth.userId,
        timestamp: {
          gte: startOfToday,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (!mostRecentLog) {
      return NextResponse.json({ error: 'No habit logs found for today' }, { status: 404 });
    }

    await prisma.habitLog.delete({
      where: {
        id: mostRecentLog.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit log:', error);
    return NextResponse.json({ error: 'Failed to undo habit log' }, { status: 500 });
  }
}
