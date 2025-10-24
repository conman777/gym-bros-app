import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getUserFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const gymPlan = await prisma.gymPlan.findUnique({
      where: { id },
    });

    if (!gymPlan) {
      return NextResponse.json({ error: 'Gym plan not found' }, { status: 404 });
    }

    if (gymPlan.userId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(gymPlan);
  } catch (error) {
    console.error('Error fetching gym plan:', error);
    return NextResponse.json({ error: 'Failed to fetch gym plan' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getUserFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (status && !['active', 'completed', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: active, completed, or archived' },
        { status: 400 }
      );
    }

    const gymPlan = await prisma.gymPlan.findUnique({
      where: { id },
    });

    if (!gymPlan) {
      return NextResponse.json({ error: 'Gym plan not found' }, { status: 404 });
    }

    if (gymPlan.userId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedPlan = await prisma.gymPlan.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error updating gym plan:', error);
    return NextResponse.json({ error: 'Failed to update gym plan' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getUserFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const gymPlan = await prisma.gymPlan.findUnique({
      where: { id },
    });

    if (!gymPlan) {
      return NextResponse.json({ error: 'Gym plan not found' }, { status: 404 });
    }

    if (gymPlan.userId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.gymPlan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gym plan:', error);
    return NextResponse.json({ error: 'Failed to delete gym plan' }, { status: 500 });
  }
}
