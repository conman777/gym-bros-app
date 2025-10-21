type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const loginAttempts = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);

  // Clean up expired entry
  if (entry && now >= entry.resetAt) {
    loginAttempts.delete(identifier);
  }

  const current = loginAttempts.get(identifier);

  if (!current) {
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  const allowed = current.count < MAX_ATTEMPTS;
  const remaining = Math.max(0, MAX_ATTEMPTS - current.count - 1);

  return {
    allowed,
    remaining,
    resetAt: current.resetAt,
  };
}

export function recordAttempt(identifier: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);

  if (!entry || now >= entry.resetAt) {
    loginAttempts.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
  } else {
    entry.count += 1;
  }
}

export function resetAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

// Clean up old entries every hour
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of loginAttempts.entries()) {
      if (now >= entry.resetAt) {
        loginAttempts.delete(key);
      }
    }
  },
  60 * 60 * 1000,
);
