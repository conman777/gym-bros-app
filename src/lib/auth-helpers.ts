import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AuthResult {
  userId: string;
  user: {
    id: string;
    name: string;
  };
}

/**
 * Get authenticated user from cookies
 * Returns null if not authenticated
 */
export async function getUserFromCookies(): Promise<AuthResult | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return null;
    }

    return { userId, user };
  } catch (error) {
    console.error('Error getting user from cookies:', error);
    return null;
  }
}

/**
 * Require authenticated user with rehab enabled for endpoint
 * Returns 401 if not authenticated, 403 if rehab not enabled
 * Returns user data if authorized
 */
export async function requireRehabUser(): Promise<
  | { authorized: true; userId: string; user: { id: string; name: string; rehabEnabled: boolean } }
  | { authorized: false; response: NextResponse }
> {
  const auth = await getUserFromCookies();

  if (!auth) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 }),
    };
  }

  // Fetch full user to check rehabEnabled
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, rehabEnabled: true },
  });

  if (!user || !user.rehabEnabled) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error:
            'Forbidden. This endpoint is only accessible to users with rehab features enabled.',
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    userId: auth.userId,
    user,
  };
}

/**
 * @deprecated Use requireRehabUser instead
 * Kept for backward compatibility
 */
export const requireDevlinUser = requireRehabUser;
