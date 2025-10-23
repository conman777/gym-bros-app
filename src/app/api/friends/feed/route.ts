import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { FriendshipStatus } from '@prisma/client';

// GET activity feed for accepted friends
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get all accepted friends (both directions)
    const sentFriendships = await prisma.friendship.findMany({
      where: {
        requesterId: auth.userId,
        status: FriendshipStatus.ACCEPTED,
      },
      select: {
        addresseeId: true,
      },
    });

    const receivedFriendships = await prisma.friendship.findMany({
      where: {
        addresseeId: auth.userId,
        status: FriendshipStatus.ACCEPTED,
      },
      select: {
        requesterId: true,
      },
    });

    // Get friend IDs
    const friendIds = [
      ...sentFriendships.map((f) => f.addresseeId),
      ...receivedFriendships.map((f) => f.requesterId),
    ];

    if (friendIds.length === 0) {
      return NextResponse.json({ activities: [], hasMore: false });
    }

    // Get activities from friends
    const activities = await prisma.friendActivity.findMany({
      where: {
        userId: {
          in: friendIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            privacySettings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1, // Take one extra to check if there are more
      skip: offset,
    });

    // Check if there are more activities
    const hasMore = activities.length > limit;
    const returnActivities = activities.slice(0, limit);

    // Filter activities based on privacy settings
    const filteredActivities = returnActivities.map((activity) => {
      const { user, ...activityData } = activity;
      const privacySettings = user.privacySettings;

      // Filter activity data based on privacy settings
      let filteredData = activity.data as any;

      if (privacySettings) {
        // If user has privacy settings, filter the data
        if (!privacySettings.showWorkoutDetails) {
          // Remove detailed workout info
          filteredData = {
            ...filteredData,
            exercises: undefined,
            sets: undefined,
            weights: undefined,
          };
        }

        if (!privacySettings.showExerciseNames) {
          // Remove exercise names
          filteredData = {
            ...filteredData,
            exercises: undefined,
            topExercise: undefined,
          };
        }
      }

      return {
        ...activityData,
        data: filteredData,
        user: {
          id: user.id,
          name: user.name,
        },
      };
    });

    return NextResponse.json({
      activities: filteredActivities,
      hasMore,
    });
  } catch (error) {
    console.error('Activity feed GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity feed' }, { status: 500 });
  }
}
