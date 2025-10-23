import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { FriendshipStatus } from '@prisma/client';

// Helper function to filter stats based on privacy settings
function filterStatsByPrivacy(stats: any, privacySettings: any) {
  if (!privacySettings) {
    return stats; // Return all stats if no privacy settings
  }

  // Baseline stats are always visible
  const filteredStats = {
    totalSetsCompleted: stats.totalSetsCompleted,
    totalExercises: stats.totalExercises,
    lastWorkoutDate: stats.lastWorkoutDate,
  };

  return filteredStats;
}

// GET all accepted friends with their stats
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all accepted friendships
    const sentFriendships = await prisma.friendship.findMany({
      where: {
        requesterId: auth.userId,
        status: FriendshipStatus.ACCEPTED,
      },
      include: {
        addressee: {
          select: {
            id: true,
            name: true,
            stats: true,
            privacySettings: true,
          },
        },
      },
    });

    const receivedFriendships = await prisma.friendship.findMany({
      where: {
        addresseeId: auth.userId,
        status: FriendshipStatus.ACCEPTED,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            stats: true,
            privacySettings: true,
          },
        },
      },
    });

    // Combine and format friends list
    const friends = [
      ...sentFriendships.map((f) => ({
        id: f.addressee.id,
        name: f.addressee.name,
        stats: filterStatsByPrivacy(f.addressee.stats, f.addressee.privacySettings),
        privacySettings: f.addressee.privacySettings,
        friendshipId: f.id,
        since: f.createdAt,
      })),
      ...receivedFriendships.map((f) => ({
        id: f.requester.id,
        name: f.requester.name,
        stats: filterStatsByPrivacy(f.requester.stats, f.requester.privacySettings),
        privacySettings: f.requester.privacySettings,
        friendshipId: f.id,
        since: f.createdAt,
      })),
    ];

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Friends GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}

// POST send friend request
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { friendIdentifier } = body; // Can be username or email

    if (!friendIdentifier || typeof friendIdentifier !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: friendIdentifier required' },
        { status: 400 }
      );
    }

    // Find friend by username or email
    const friend = await prisma.user.findFirst({
      where: {
        OR: [{ name: friendIdentifier }, { email: friendIdentifier }],
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!friend) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Can't send friend request to yourself
    if (friend.id === auth.userId) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check if friendship already exists (in either direction)
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: auth.userId, addresseeId: friend.id },
          { requesterId: friend.id, addresseeId: auth.userId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        return NextResponse.json({ error: 'Already friends with this user' }, { status: 400 });
      } else if (existingFriendship.status === FriendshipStatus.PENDING) {
        return NextResponse.json({ error: 'Friend request already pending' }, { status: 400 });
      } else if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        return NextResponse.json(
          { error: 'Cannot send friend request to this user' },
          { status: 403 }
        );
      }
    }

    // Create new friendship request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: auth.userId,
        addresseeId: friend.id,
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
    });

    return NextResponse.json({
      success: true,
      friendship: {
        id: friendship.id,
        status: friendship.status,
        friend: friendship.addressee,
        createdAt: friendship.createdAt,
      },
    });
  } catch (error) {
    console.error('Friends POST error:', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}
