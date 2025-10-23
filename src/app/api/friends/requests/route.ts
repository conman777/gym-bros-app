import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { FriendshipStatus } from '@prisma/client';

// GET pending friend requests (both sent and received)
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sent requests (pending)
    const sentRequests = await prisma.friendship.findMany({
      where: {
        requesterId: auth.userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        addressee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get received requests (pending)
    const receivedRequests = await prisma.friendship.findMany({
      where: {
        addresseeId: auth.userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      sent: sentRequests.map((r) => ({
        id: r.id,
        friend: r.addressee,
        createdAt: r.createdAt,
      })),
      received: receivedRequests.map((r) => ({
        id: r.id,
        friend: r.requester,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Friend requests GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch friend requests' }, { status: 500 });
  }
}
