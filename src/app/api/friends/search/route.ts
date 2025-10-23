import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// GET search for users by username or email
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const trimmedQuery = query.trim();

    // Search for users by username or email
    // Case-insensitive partial match
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: auth.userId, // Exclude current user
            },
          },
          {
            OR: [
              {
                name: {
                  contains: trimmedQuery,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: trimmedQuery,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 10, // Limit to 10 results
    });

    // For each user, check if there's an existing friendship
    const usersWithFriendshipStatus = await Promise.all(
      users.map(async (user) => {
        const friendship = await prisma.friendship.findFirst({
          where: {
            OR: [
              { requesterId: auth.userId, addresseeId: user.id },
              { requesterId: user.id, addresseeId: auth.userId },
            ],
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          friendshipStatus: friendship?.status || null,
          friendshipId: friendship?.id || null,
        };
      })
    );

    return NextResponse.json({ users: usersWithFriendshipStatus });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
