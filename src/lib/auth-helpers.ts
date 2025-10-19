import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const userId = cookieStore.get("userId")?.value;

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
    console.error("Error getting user from cookies:", error);
    return null;
  }
}

/**
 * Require authenticated Devlin user for endpoint
 * Returns 401 if not authenticated, 403 if not Devlin
 * Returns user data if authorized
 */
export async function requireDevlinUser(): Promise<
  | { authorized: true; userId: string; user: { id: string; name: string } }
  | { authorized: false; response: NextResponse }
> {
  const auth = await getUserFromCookies();

  if (!auth) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (auth.user.name !== "Devlin") {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden. This endpoint is only accessible to Devlin." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    userId: auth.userId,
    user: auth.user,
  };
}
