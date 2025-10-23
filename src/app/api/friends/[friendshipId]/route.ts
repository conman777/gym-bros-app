import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { FriendshipStatus } from '@prisma/client';

// PATCH accept or decline friend request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ friendshipId: string }> }
) {
  try {
    const auth = await getUserFromCookies();

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { friendshipId } = await params;
    const body = await request.json();
    const { action } = body; // "accept" or "decline"

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action: must be "accept" or "decline"' },
        { status: 400 }
      );
    }

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    // Verify user is the addressee (only receiver can accept/decline)
    if (friendship.addresseeId !== auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Can only accept/decline requests sent to you' },
        { status: 403 }
      );
    }

    // Verify request is pending
    if (friendship.status !== FriendshipStatus.PENDING) {
      return NextResponse.json({ error: 'Friend request is not pending' }, { status: 400 });
    }

    // Update friendship status
    const newStatus = action === 'accept' ? FriendshipStatus.ACCEPTED : FriendshipStatus.DECLINED;

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: newStatus },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
          },
        },
        addressee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If accepted, ensure both users have privacy settings initialized
    if (action === 'accept') {
      await prisma.privacySettings.upsert({
        where: { userId: auth.userId },
        update: {},
        create: {
          userId: auth.userId,
          showWorkoutDetails: true,
          showExerciseNames: true,
          showPerformanceTrends: true,
          showWorkoutSchedule: true,
        },
      });

      await prisma.privacySettings.upsert({
        where: { userId: friendship.requesterId },
        update: {},
        create: {
          userId: friendship.requesterId,
          showWorkoutDetails: true,
          showExerciseNames: true,
          showPerformanceTrends: true,
          showWorkoutSchedule: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      friendship: {
        id: updatedFriendship.id,
        status: updatedFriendship.status,
        requester: updatedFriendship.requester,
        addressee: updatedFriendship.addressee,
        updatedAt: updatedFriendship.updatedAt,
      },
    });
  } catch (error) {
    console.error('Friendship PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update friend request' }, { status: 500 });
  }
}

// DELETE remove friend or cancel request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ friendshipId: string }> }
) {
  try {
    const auth = await getUserFromCookies();

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { friendshipId } = await params;

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    // Verify user is part of this friendship
    if (friendship.requesterId !== auth.userId && friendship.addresseeId !== auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Not part of this friendship' },
        { status: 403 }
      );
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return NextResponse.json({
      success: true,
      message: 'Friendship removed',
    });
  } catch (error) {
    console.error('Friendship DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove friendship' }, { status: 500 });
  }
}
