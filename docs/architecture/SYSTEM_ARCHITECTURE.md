# System Architecture

## Overview

Gym Bros App is a full-stack Next.js application built with the App Router architecture. It follows a serverless API pattern with server-side rendering for optimal performance and SEO.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (React 19 + Next.js 15 App Router + TanStack Query)       │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 │ HTTP/HTTPS
                 │
┌────────────────▼─────────────────────────────────────────────┐
│                      Middleware Layer                         │
│         (Authentication Check + Route Protection)            │
└────────────────┬─────────────────────────────────────────────┘
                 │
        ┌────────┴──────────┐
        │                   │
┌───────▼──────┐    ┌──────▼─────────┐
│  Page Routes │    │   API Routes   │
│   (SSR/SSG)  │    │  (Serverless)  │
└──────────────┘    └──────┬─────────┘
                           │
                ┌──────────┴────────────┐
                │                       │
        ┌───────▼────────┐     ┌───────▼────────┐
        │  Auth Helpers  │     │  Data Helpers  │
        │  (getUserFrom  │     │  (rehab, date) │
        │   Cookies)     │     │                │
        └───────┬────────┘     └───────┬────────┘
                │                      │
                └──────────┬───────────┘
                           │
                   ┌───────▼─────────┐
                   │  Prisma Client  │
                   │    (ORM Layer)  │
                   └───────┬─────────┘
                           │
                   ┌───────▼─────────┐
                   │   PostgreSQL    │
                   │    Database     │
                   └─────────────────┘
```

## Core Components

### 1. Client Layer

**Technology**: React 19 + Next.js 15 App Router + TypeScript

**Key Features:**

- Server Components for initial page load (faster, smaller bundle)
- Client Components for interactive features (marked with `'use client'`)
- TanStack Query for server state management and caching
- Framer Motion for smooth animations
- Tailwind CSS for styling

**State Management:**

- **Server State**: TanStack Query (API data, caching, refetching)
- **Client State**: React hooks (useState, useReducer)
- **Form State**: Controlled components with React state

### 2. Middleware Layer

**File**: `src/middleware.ts`

**Purpose**: Intercepts requests before they reach routes

**Responsibilities:**

1. **Authentication Check**: Validates `userId` cookie exists
2. **Route Protection**: Redirects unauthenticated users from protected routes
3. **Automatic Redirects**: Redirects authenticated users from home to dashboard

**Protected Routes:**

- `/dashboard`
- `/calendar`
- `/workout/*`
- `/import`
- `/stats`
- `/rehab/*` (if rehabEnabled)

**Flow:**

```
Request → Middleware → Check Cookie →
  ├─ No Cookie + Protected Route → Redirect to /
  ├─ Has Cookie + / → Redirect to /dashboard
  └─ Valid → Continue to Route
```

### 3. API Layer

**Pattern**: RESTful serverless functions

**File Structure**: `src/app/api/[resource]/route.ts`

**Authentication Flow:**

```typescript
// Every protected API route follows this pattern:
1. Import getUserFromCookies
2. Call it to get userId
3. If null, return 401
4. If valid, proceed with request
```

**Example Pattern:**

```typescript
export async function GET(request: Request) {
  const auth = await getUserFromCookies();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Proceed with authenticated logic
  const data = await prisma.workout.findMany({
    where: { userId: auth.userId },
  });

  return NextResponse.json(data);
}
```

**Resource Organization:**

- `/api/auth/*` - Authentication operations
- `/api/workouts/*` - Workout CRUD
- `/api/sets/*` - Set updates
- `/api/rehab/*` - Rehab exercise management
- `/api/stats` - Statistics aggregation
- `/api/calendar` - Calendar data
- `/api/dashboard` - Dashboard summary

### 4. Data Access Layer

**Technology**: Prisma ORM

**Pattern**: Singleton client instance

**File**: `src/lib/prisma.ts`

```typescript
// Singleton pattern prevents multiple Prisma clients in development
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Query Patterns:**

- Direct Prisma queries in API routes (no repository pattern)
- Transactions for multi-step operations
- Cascading deletes handled by database constraints

### 5. Database Layer

**Technology**: PostgreSQL (production) or SQLite (development)

**Connection**: Via Prisma Client with connection pooling

**Key Relationships:**

- User → Workouts (one-to-many)
- User → RehabExercises (one-to-many)
- User → Stats (one-to-one)
- Workout → Exercises (one-to-many)
- Exercise → Sets (one-to-many)

**Indexes:**

- `User.name` (unique index for login)
- `Workout.userId + date` (composite index for queries)
- `Exercise.workoutId` (foreign key index)
- `Set.exerciseId` (foreign key index)
- `RehabExercise.userId` (foreign key index)

## Authentication Flow

### Registration

```
Client                    API                     Database
  │                        │                         │
  ├─POST /api/auth/register→│                        │
  │  { name, password }     │                        │
  │                         ├─hash password          │
  │                         ├─prisma.user.create()──→│
  │                         │                        ├─insert User
  │                         │←──────user─────────────┤
  │                         ├─set userId cookie      │
  │←───{success, user}──────┤                        │
  │                         │                        │
```

### Login

```
Client                    API                     Database
  │                        │                         │
  ├─POST /api/auth/login───→│                        │
  │  { name, password }     │                        │
  │                         ├─prisma.user.findUnique→│
  │                         │←─────user──────────────┤
  │                         ├─compare password hash  │
  │                         ├─set userId cookie      │
  │←───{success, user}──────┤                        │
  │                         │                        │
```

### Authenticated Request

```
Client                 Middleware               API              Database
  │                       │                      │                  │
  ├─GET /dashboard────────→│                     │                  │
  │  Cookie: userId=xyz    ├─check cookie        │                  │
  │                        ├─valid?              │                  │
  │                        └─allow───────────────→│                 │
  │                                               ├─getUserFromCookies
  │                                               ├─prisma.query───→│
  │                                               │←────data────────┤
  │←──────────────────────────────────────────────┤                 │
  │                                               │                 │
```

## Data Flow Patterns

### Creating a Workout

```
1. User navigates to /workout/2025-01-15
2. Client renders empty workout form
3. User fills in exercises and sets
4. Client sends POST /api/workouts/2025-01-15
5. API validates authentication
6. API creates Workout → Exercises → Sets in transaction
7. API returns created workout
8. TanStack Query invalidates cache
9. Client re-fetches and displays updated workout
```

### Completing a Set

```
1. User clicks "Mark Complete" on a set
2. Client sends PATCH /api/sets/{id}
3. API validates authentication
4. API updates Set.completed = true
5. API checks if all sets in workout complete
6. If complete, API updates Workout.completed = true
7. If complete, API updates Stats.totalSetsCompleted
8. API returns updated set
9. TanStack Query updates local cache
10. UI reflects changes immediately
```

### Rehab Exercise Management

```
1. Admin/PT creates rehab prescription (external process)
2. Rehab data imported or manually entered
3. User views /rehab/manage page
4. Client fetches GET /api/rehab
5. API checks requireRehabUser() authorization
6. API returns exercises grouped by category
7. User marks exercise complete
8. Client sends PATCH /api/rehab/{id}
9. API updates completedDate and completed flag
10. UI shows completed state
```

## Caching Strategy

### TanStack Query Configuration

**File**: `src/providers/QueryProvider.tsx`

**Default Settings:**

- `staleTime`: 0ms (data immediately considered stale)
- `cacheTime`: 5 minutes (cached data kept for 5 mins)
- `refetchOnWindowFocus`: true (refetch when window regains focus)
- `refetchOnReconnect`: true (refetch after network reconnection)

**Query Keys Pattern:**

```typescript
// Workout queries
['workout', date][('workouts', userId)][('workout', 'calendar')][ // Single workout by date // All workouts for user // Calendar summary data
  // Rehab queries
  ('rehab', userId)
][('rehab', exerciseId)][ // All rehab exercises // Single exercise
  // Stats queries
  ('stats', userId)
]; // User statistics
```

**Invalidation Strategy:**

- After creating/updating workout → invalidate `['workouts']`
- After completing set → invalidate `['workout', date]` and `['stats']`
- After updating rehab → invalidate `['rehab']`

## Error Handling

### API Error Responses

**Standard Error Format:**

```typescript
{
  error: string,          // Human-readable error message
  details?: any          // Optional additional error context
}
```

**HTTP Status Codes:**

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Client Error Handling

**Pattern:**

```typescript
try {
  const response = await fetch('/api/resource');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  return await response.json();
} catch (error) {
  console.error('Operation failed:', error);
  // Show error toast/notification to user
}
```

### Database Error Handling

**Prisma Error Types:**

- `P2002`: Unique constraint violation (duplicate username)
- `P2025`: Record not found
- `P2003`: Foreign key constraint violation

**Pattern:**

```typescript
try {
  await prisma.user.create({ data: { name } });
} catch (error) {
  if (error.code === 'P2002') {
    return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
  }
  throw error;
}
```

## Performance Optimizations

### 1. Server Components

- Default to Server Components for static content
- Only use Client Components for interactive features
- Reduces JavaScript bundle size significantly

### 2. Database Indexes

- Composite index on `(userId, date)` for workout queries
- Foreign key indexes on all relationships
- Unique index on `User.name` for fast auth lookups

### 3. Connection Pooling

- Prisma manages connection pool automatically
- Recommended pool size: 10-20 connections
- Connections reused across requests

### 4. Static Page Generation

- Calendar page uses ISR (Incremental Static Regeneration)
- Public pages (login, register) are statically generated
- Dashboard and workout pages use SSR for fresh data

### 5. Image Optimization

- Next.js Image component for automatic optimization
- Lazy loading for images below the fold
- WebP format with fallbacks

## Security Architecture

### Authentication

- Cookie-based sessions (HTTP-only, SameSite=Lax)
- Passwords hashed with bcryptjs (10 salt rounds)
- No JWT tokens (cookies are more secure for web apps)

### Authorization

- Middleware enforces route-level auth
- API routes verify userId from cookie
- Rehab features gated by `rehabEnabled` flag

### Input Validation

- TypeScript for compile-time type checking
- Runtime validation in API routes
- Prisma schema constraints (unique, required fields)

### CSRF Protection

- SameSite cookies prevent cross-site attacks
- Next.js middleware adds additional CSRF protection

### SQL Injection Prevention

- Prisma ORM parameterizes all queries
- No raw SQL queries in production code

## Deployment Architecture

### Vercel Deployment

**Build Process:**

1. Install dependencies
2. Run `prisma generate` (generate client)
3. Run `next build` (compile app)
4. Deploy serverless functions + static assets

**Environment:**

- Node.js 18+ runtime
- Serverless functions for API routes
- Edge functions for middleware
- CDN for static assets

**Database:**

- PostgreSQL hosted separately (e.g., Neon, Supabase)
- Connection pooling via Prisma
- Automatic failover and backups

### Scaling Considerations

**Current Architecture Limits:**

- Serverless functions: 10-second timeout
- Database: Connection pool size (10-20)
- No caching layer (Redis) yet

**Future Scaling Options:**

1. Add Redis for session storage and caching
2. Implement CDN caching for API responses
3. Database read replicas for heavy read workloads
4. Background job queue for async operations

## Development Workflow

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up database
npx prisma migrate dev

# 3. Generate Prisma client
npx prisma generate

# 4. Seed database (optional)
npm run setup

# 5. Start dev server
npm run dev
```

### Making Changes

```
1. Create feature branch
2. Write failing test (TDD)
3. Implement feature
4. Run tests: npm test
5. Run type check: npx tsc --noEmit
6. Format code: npx prettier --write .
7. Commit with conventional commit message
8. Push and create PR
```

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Apply to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

## Monitoring and Observability

### Logging

**Current Implementation:**

- `console.log()` for info messages
- `console.error()` for errors
- ActivityLog table for system events

**Log Levels:**

- ERROR: Exceptions and failures
- WARN: Deprecated features, validation failures
- INFO: Successful operations
- DEBUG: Detailed flow information

### Activity Logging

**Model**: `ActivityLog`

**Categories:**

- `PRICE_UPDATE`: Price changes
- `PREDICTION`: ML predictions
- `API_CALL`: External API calls
- `USER_ACTION`: Important user actions

**Usage:**

```typescript
await prisma.activityLog.create({
  data: {
    category: 'USER_ACTION',
    operation: 'workout_completed',
    message: `User ${userId} completed workout`,
    status: 'SUCCESS',
    details: { workoutId, date },
  },
});
```

## Known Limitations

1. **No Real-time Updates**: UI doesn't update when other users make changes
2. **No Offline Support**: Requires active internet connection
3. **No File Uploads**: No image/video upload for exercises
4. **No Social Features**: No sharing or collaboration
5. **Single Timezone**: All dates use server timezone
6. **No Email Verification**: Email field is optional and unverified

## Future Improvements

1. **Real-time Sync**: Add WebSocket support for live updates
2. **Offline PWA**: Service worker for offline functionality
3. **File Storage**: Add S3/Cloudinary for media uploads
4. **Multi-tenant**: Support for gyms/teams with multiple users
5. **Analytics Dashboard**: Advanced analytics and progress tracking
6. **Mobile Apps**: Native iOS/Android apps with React Native
7. **API Rate Limiting**: Protect against abuse
8. **Comprehensive Logging**: Structured logging with Winston/Pino

## Related Documentation

- [Database Schema](DATABASE_SCHEMA.md) - Detailed Prisma models
- [API Architecture](API_ARCHITECTURE.md) - API endpoints and patterns
- [Setup Guide](../development/SETUP.md) - Local development setup
- [Testing Guide](../development/TESTING_GUIDE.md) - Testing patterns and tools
