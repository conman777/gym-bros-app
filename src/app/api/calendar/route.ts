import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get('month') || new Date().getMonth().toString());
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

  const cookieStore = await cookies();
  const userId = cookieStore.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const workouts = await prisma.workout.findMany({
    where: {
      userId: userId.value,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      exercises: {
        include: {
          sets: true,
        },
      },
    },
  });

  return NextResponse.json({ workouts });
}
