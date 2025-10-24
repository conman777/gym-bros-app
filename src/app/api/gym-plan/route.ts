import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const gymPlans = await prisma.gymPlan.findMany({
      where: {
        userId: auth.userId,
        status,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(gymPlans);
  } catch (error) {
    console.error('Error fetching gym plans:', error);
    return NextResponse.json({ error: 'Failed to fetch gym plans' }, { status: 500 });
  }
}
