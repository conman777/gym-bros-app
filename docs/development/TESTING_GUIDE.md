# Testing Guide

## Overview

This project follows Test-Driven Development (TDD) principles as outlined in `CLAUDE.md`. We use Jest + React Testing Library for comprehensive test coverage.

**Test Distribution (Target):**

- 70% Integration Tests (API routes, component interactions)
- 25% Unit Tests (Pure logic, utilities)
- 5% E2E Tests (Critical user flows)

## Tech Stack

- **Jest 29**: Test runner and assertion library
- **React Testing Library 15**: React component testing
- **@testing-library/jest-dom**: Custom matchers for DOM
- **ts-jest**: TypeScript support for Jest

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test auth-helpers.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="login"
```

## Test File Organization

### Colocate Unit Tests

**Rule (T-1)**: Unit tests live next to source files.

```
src/
├── lib/
│   ├── date-utils.ts
│   ├── date-utils.test.ts       ← colocated
│   ├── auth-helpers.ts
│   └── auth-helpers.test.ts     ← colocated
```

### Integration Tests in /tests

**Rule (T-2)**: Integration tests in dedicated test directory.

```
tests/
├── integration/
│   ├── auth-login.test.ts
│   ├── workouts-api.test.ts
│   └── rehab-api.test.ts
```

## Writing Tests

### Test Structure (AAA Pattern)

**Rule**: Follow Arrange-Act-Assert pattern.

```typescript
describe('functionName', () => {
  test('should do something specific', () => {
    // Arrange - Set up test data and dependencies
    const input = 'test input';
    const expectedOutput = 'expected result';

    // Act - Execute the function being tested
    const result = functionName(input);

    // Assert - Verify the result
    expect(result).toBe(expectedOutput);
  });
});
```

### Test Naming Convention

**Rule**: Test descriptions match the assertion.

```typescript
// ✅ GOOD: Description matches what's being tested
test('should return JWT token on successful login', () => {
  expect(response.token).toBeDefined();
});

// ❌ BAD: Vague description
test('user login', () => {
  expect(response.token).toBeDefined();
});
```

### Parameterize Test Inputs

**Rule**: Never use magic numbers or unexplained literals.

```typescript
// ❌ BAD: Magic numbers
test('should format date', () => {
  const result = formatDate(new Date(2025, 0, 15));
  expect(result).toBe('2025-01-15');
});

// ✅ GOOD: Named variables
test('should format date as YYYY-MM-DD', () => {
  const year = 2025;
  const month = 0; // January (0-indexed)
  const day = 15;
  const inputDate = new Date(year, month, day);
  const expectedFormat = '2025-01-15';

  const result = formatDate(inputDate);

  expect(result).toBe(expectedFormat);
});
```

### Use Strong Assertions

**Rule**: Prefer precise assertions over weak ones.

```typescript
// ❌ BAD: Weak assertion
expect(result.length).toBeGreaterThan(0);

// ✅ GOOD: Strong assertion
expect(result).toEqual([{ id: '123', name: 'Test' }]);
```

### Test Entire Structure

**Rule (T-6)**: Assert entire structures, not individual fields.

```typescript
// ❌ BAD: Multiple weak assertions
expect(result).toHaveLength(1);
expect(result[0].id).toBe('123');
expect(result[0].name).toBe('Test');
expect(result[0].completed).toBe(false);

// ✅ GOOD: Single strong assertion
expect(result).toEqual([
  {
    id: '123',
    name: 'Test',
    completed: false,
  },
]);
```

## Unit Test Examples

### Testing Pure Functions

**File**: `src/lib/date-utils.test.ts`

```typescript
import { formatDateForUrl, parseUrlDate } from './date-utils';

describe('formatDateForUrl', () => {
  test('should format date as YYYY-MM-DD', () => {
    const year = 2025;
    const month = 0; // January
    const day = 15;
    const date = new Date(year, month, day);
    const expected = '2025-01-15';

    const result = formatDateForUrl(date);

    expect(result).toBe(expected);
  });

  test('should pad single-digit months with zero', () => {
    const date = new Date(2025, 4, 5); // May 5, 2025
    const expected = '2025-05-05';

    const result = formatDateForUrl(date);

    expect(result).toBe(expected);
  });

  test('should handle leap year dates', () => {
    const leapYearDate = new Date(2024, 1, 29); // Feb 29, 2024
    const expected = '2024-02-29';

    const result = formatDateForUrl(leapYearDate);

    expect(result).toBe(expected);
  });
});

describe('parseUrlDate', () => {
  test('should parse YYYY-MM-DD string to Date', () => {
    const dateString = '2025-01-15';
    const expectedDate = new Date(2025, 0, 15);

    const result = parseUrlDate(dateString);

    expect(result).toEqual(expectedDate);
  });

  test('should round-trip with formatDateForUrl', () => {
    const originalDate = new Date(2025, 6, 20);

    const formatted = formatDateForUrl(originalDate);
    const parsed = parseUrlDate(formatted);

    expect(parsed).toEqual(originalDate);
  });
});
```

### Testing with Mocks

**File**: `src/lib/auth-helpers.test.ts`

```typescript
import { getUserFromCookies } from './auth-helpers';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock Prisma client
jest.mock('./prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('getUserFromCookies', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return user when valid cookie exists', async () => {
    const userId = 'user123';
    const mockUser = { id: userId, name: 'TestUser' };

    // Arrange
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: userId }),
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    // Act
    const result = await getUserFromCookies();

    // Assert
    expect(result).toEqual({
      userId,
      user: mockUser,
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: { id: true, name: true },
    });
  });

  test('should return null when cookie is missing', async () => {
    // Arrange
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    // Act
    const result = await getUserFromCookies();

    // Assert
    expect(result).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  test('should return null when user not found in database', async () => {
    const userId = 'nonexistent';

    // Arrange
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: userId }),
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await getUserFromCookies();

    // Assert
    expect(result).toBeNull();
  });
});
```

## Integration Test Examples

### Testing API Routes

**File**: `tests/integration/auth-login.test.ts`

```typescript
import { POST } from '@/app/api/auth/login/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('POST /api/auth/login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 and set cookie on successful login', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const mockUser = {
      id: 'user123',
      name: 'TestUser',
      email,
      passwordHash: hashedPassword,
    };

    // Arrange
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      userId: mockUser.id,
      name: mockUser.name,
    });
    expect(response.cookies.get('userId')).toBeDefined();
  });

  test('should return 401 on invalid password', async () => {
    const email = 'test@example.com';
    const correctPassword = 'correct123';
    const wrongPassword = 'wrong123';
    const hashedPassword = await bcrypt.hash(correctPassword, 10);
    const mockUser = {
      id: 'user123',
      email,
      passwordHash: hashedPassword,
    };

    // Arrange
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: wrongPassword }),
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(body.error).toBe('Invalid email or password');
  });

  test('should return 400 when email is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'password123' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Email and password are required');
  });
});
```

### Testing with Database Transactions

**File**: `tests/integration/workouts-api.test.ts`

```typescript
import { prisma } from '@/lib/prisma';
import { GET } from '@/app/api/workouts/[date]/route';

describe('GET /api/workouts/[date]', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        name: `test_user_${Date.now()}`,
        passwordHash: 'hashed_password',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.delete({ where: { id: testUserId } });
  });

  test('should return workout with exercises and sets', async () => {
    const workoutDate = new Date('2025-01-15');

    // Arrange - Create test workout
    const workout = await prisma.workout.create({
      data: {
        userId: testUserId,
        date: workoutDate,
        completed: false,
        exercises: {
          create: [
            {
              name: 'Bench Press',
              orderIndex: 0,
              sets: {
                create: [{ reps: 10, weight: 135, orderIndex: 0, completed: false }],
              },
            },
          ],
        },
      },
      include: {
        exercises: {
          include: { sets: true },
        },
      },
    });

    // Act
    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ date: '2025-01-15' }),
    });
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.id).toBe(workout.id);
    expect(body.exercises).toHaveLength(1);
    expect(body.exercises[0].sets).toHaveLength(1);
  });
});
```

## Testing Best Practices

### What to Test

**MUST Test (from CLAUDE.md):**

1. **Public APIs**: All endpoints and error cases
2. **Edge Cases**: Empty input, null, max values, special characters
3. **Error Paths**: Every error condition
4. **Security**: Auth bypass attempts, injection attacks
5. **State Transitions**: All valid state changes

**SHOULD Test:**

1. **Complex Algorithms**: Pure functions with tricky logic
2. **Invariants**: Properties that must always be true
3. **Integration Points**: Where modules interact

**SHOULD NOT Test:**

1. **Trivial Getters/Setters**: No logic to verify
2. **Third-Party Code**: Trust well-tested libraries
3. **Constants**: Testing `const PORT = 3000` is pointless

### Test Coverage Goals

**Target Coverage:**

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 85%+
- **Lines**: 80%+

**Critical Paths (100% coverage):**

- Authentication logic
- Payment processing (if added)
- Data validation
- Security-related code

### Mocking Strategy

**SHOULD Mock:**

1. **External Systems**: Database, APIs, file system
2. **Non-Deterministic**: `Date.now()`, `Math.random()`
3. **Slow Operations**: Network calls, heavy computations

**SHOULD NOT Mock:**

1. **Internal Modules**: Test real integration
2. **Simple Functions**: Pure functions are fast
3. **Types/Interfaces**: Use real implementations

## Test Configuration

### jest.config.js

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### jest.setup.js

```javascript
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Global test timeout
jest.setTimeout(10000);
```

## Debugging Tests

### Run Single Test

```bash
npm test -- auth-helpers.test.ts
```

### Run with Verbose Output

```bash
npm test -- --verbose
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

## Common Testing Patterns

### Testing Async Functions

```typescript
test('should fetch data asynchronously', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

### Testing Error Handling

```typescript
test('should throw on invalid input', () => {
  expect(() => {
    validateInput(null);
  }).toThrow('Input cannot be null');
});

// Async errors
test('should reject promise on error', async () => {
  await expect(fetchData(-1)).rejects.toThrow('Invalid ID');
});
```

### Testing with Timers

```typescript
jest.useFakeTimers();

test('should debounce function calls', () => {
  const callback = jest.fn();
  const debounced = debounce(callback, 1000);

  debounced();
  debounced();
  debounced();

  expect(callback).not.toHaveBeenCalled();

  jest.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalledTimes(1);
});
```

## TDD Workflow

**Rule (C-1)**: Follow TDD: scaffold stub → write failing test → implement

### 1. Write Failing Test

```typescript
describe('calculateWorkoutVolume', () => {
  test('should calculate total volume from sets', () => {
    const sets = [
      { reps: 10, weight: 100 },
      { reps: 8, weight: 120 },
    ];
    const expectedVolume = 1960; // (10*100) + (8*120)

    const result = calculateWorkoutVolume(sets);

    expect(result).toBe(expectedVolume);
  });
});
```

### 2. Run Test (Should Fail)

```bash
npm test
# ❌ FAIL: calculateWorkoutVolume is not defined
```

### 3. Implement Minimal Code

```typescript
export function calculateWorkoutVolume(sets) {
  return sets.reduce((total, set) => total + set.reps * set.weight, 0);
}
```

### 4. Run Test (Should Pass)

```bash
npm test
# ✅ PASS: should calculate total volume from sets
```

### 5. Refactor

```typescript
export function calculateWorkoutVolume(sets: Array<{ reps: number; weight: number }>): number {
  return sets.reduce((total, set) => total + set.reps * set.weight, 0);
}
```

## Related Documentation

- [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)
- [API Architecture](../architecture/API_ARCHITECTURE.md)
- [Setup Guide](SETUP.md)
