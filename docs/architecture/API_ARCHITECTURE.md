# API Architecture

## Overview

The Gym Bros App API follows RESTful principles using Next.js API Routes (App Router). All endpoints are serverless functions deployed as edge functions or lambda functions.

**Base URL**: `/api`

**Authentication**: Cookie-based sessions (HTTP-only cookies)

**Response Format**: JSON

## API Design Principles

### 1. RESTful Resource Naming

```
Resource-based URLs:
✅ /api/workouts/[id]
✅ /api/rehab/[id]

NOT action-based:
❌ /api/getWorkout/[id]
❌ /api/updateRehab/[id]
```

### 2. HTTP Methods Map to CRUD

| HTTP Method | Operation        | Idempotent | Safe |
| ----------- | ---------------- | ---------- | ---- |
| GET         | Read             | Yes        | Yes  |
| POST        | Create           | No         | No   |
| PUT         | Update (full)    | Yes        | No   |
| PATCH       | Update (partial) | Yes        | No   |
| DELETE      | Delete           | Yes        | No   |

### 3. Standard Response Codes

| Code | Meaning               | Usage                                      |
| ---- | --------------------- | ------------------------------------------ |
| 200  | OK                    | Successful GET, PUT, PATCH, DELETE         |
| 201  | Created               | Successful POST                            |
| 400  | Bad Request           | Invalid input, validation error            |
| 401  | Unauthorized          | Missing or invalid authentication          |
| 403  | Forbidden             | Authenticated but insufficient permissions |
| 404  | Not Found             | Resource doesn't exist                     |
| 500  | Internal Server Error | Server error, logged for debugging         |

### 4. Consistent Error Format

```typescript
{
  error: string,        // Human-readable error message
  details?: any        // Optional additional context
}
```

**Examples:**

```json
// 400 Bad Request
{
  "error": "Email and password are required"
}

// 401 Unauthorized
{
  "error": "Unauthorized. Please log in."
}

// 403 Forbidden
{
  "error": "Forbidden. This endpoint is only accessible to users with rehab features enabled."
}

// 500 Internal Server Error
{
  "error": "Failed to fetch workout"
}
```

## Authentication Pattern

### Cookie-Based Authentication

All protected endpoints use cookie-based authentication:

```typescript
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Proceed with authenticated logic
}
```

### Auth Helper Functions

**File**: `src/lib/auth-helpers.ts`

#### `getUserFromCookies()`

Returns authenticated user or null.

```typescript
const auth = await getUserFromCookies();
if (!auth) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// auth.userId and auth.user available
```

#### `requireRehabUser()`

Enforces rehab feature flag authorization.

```typescript
const authResult = await requireRehabUser();
if (!authResult.authorized) {
  return authResult.response; // 401 or 403
}

// authResult.userId and authResult.user available
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Create a new user account.

**Request Body:**

```typescript
{
  name: string,       // Unique username
  password: string,   // Plain text, will be hashed
  email?: string      // Optional email
}
```

**Response (201):**

```typescript
{
  success: true,
  userId: string,
  name: string
}
```

**Errors:**

- 400: Missing name or password
- 400: Username already exists (Prisma P2002)
- 500: Server error

**Cookie Set:**

- `userId` cookie with 30-day expiration

**Implementation:**

```typescript
// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Create user
const user = await prisma.user.create({
  data: {
    name,
    passwordHash: hashedPassword,
    email: email || null,
  },
});

// Set cookie
response.cookies.set('userId', user.id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30, // 30 days
});
```

---

#### POST /api/auth/login

Authenticate existing user.

**Request Body:**

```typescript
{
  email: string,      // User's email
  password: string    // Plain text password
}
```

**Response (200):**

```typescript
{
  success: true,
  userId: string,
  name: string
}
```

**Errors:**

- 400: Missing email or password
- 401: Invalid credentials
- 500: Server error

**Cookie Set:**

- `userId` cookie with 30-day expiration

**Implementation:**

```typescript
// Find user
const user = await prisma.user.findUnique({
  where: { email },
});

// Verify password
const isValid = await bcrypt.compare(password, user.passwordHash);

// Set cookie if valid
```

---

#### POST /api/auth/logout

Log out current user.

**Request:** No body required

**Response (200):**

```typescript
{
  success: true;
}
```

**Cookie Cleared:**

- `userId` cookie deleted

---

### Workout Endpoints

#### GET /api/workouts/[date]

Get workout for a specific date.

**URL Parameters:**

- `date`: YYYY-MM-DD format (e.g., "2025-01-15")

**Authentication:** Required

**Response (200):**

```typescript
{
  id: string,
  userId: string,
  date: string,          // ISO 8601
  completed: boolean,
  exercises: [
    {
      id: string,
      workoutId: string,
      name: string,
      orderIndex: number,
      sets: [
        {
          id: string,
          exerciseId: string,
          reps: number,
          weight: number,
          completed: boolean,
          orderIndex: number
        }
      ]
    }
  ]
}
```

**Errors:**

- 401: Not authenticated
- 404: Workout not found for date
- 500: Server error

**Implementation:**

```typescript
const startDate = new Date(date);
startDate.setHours(0, 0, 0, 0);
const endDate = new Date(date);
endDate.setHours(23, 59, 59, 999);

const workout = await prisma.workout.findFirst({
  where: {
    userId,
    date: { gte: startDate, lte: endDate },
  },
  include: {
    exercises: {
      orderBy: { orderIndex: 'asc' },
      include: {
        sets: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    },
  },
});
```

---

#### POST /api/workouts/import

Bulk import workouts from template.

**Authentication:** Required

**Request Body:**

```typescript
{
  workouts: [
    {
      date: string, // YYYY-MM-DD
      exercises: [
        {
          name: string,
          sets: [
            {
              reps: number,
              weight: number,
            },
          ],
        },
      ],
    },
  ];
}
```

**Response (201):**

```typescript
{
  success: true,
  created: number,    // Count of workouts created
  workoutIds: string[]
}
```

**Errors:**

- 401: Not authenticated
- 400: Invalid workout data
- 500: Server error

---

#### PUT /api/workouts/complete/[id]

Mark workout as complete and update stats.

**URL Parameters:**

- `id`: Workout ID

**Authentication:** Required

**Request:** No body required

**Response (200):**

```typescript
{
  success: true,
  workout: {
    id: string,
    completed: boolean
  },
  stats: {
    totalSetsCompleted: number,
    totalExercises: number,
    lastWorkoutDate: string
  }
}
```

**Errors:**

- 401: Not authenticated
- 404: Workout not found
- 500: Server error

**Business Logic:**

```typescript
// 1. Mark workout complete
await prisma.workout.update({
  where: { id },
  data: { completed: true },
});

// 2. Count completed sets
const completedSets = await prisma.set.count({
  where: {
    exercise: { workoutId: id },
    completed: true,
  },
});

// 3. Update user stats
await prisma.stats.upsert({
  where: { userId },
  create: {
    userId,
    totalSetsCompleted: completedSets,
    totalExercises: exerciseCount,
    lastWorkoutDate: new Date(),
  },
  update: {
    totalSetsCompleted: { increment: completedSets },
    totalExercises: { increment: exerciseCount },
    lastWorkoutDate: new Date(),
  },
});
```

---

### Set Endpoints

#### PATCH /api/sets/[id]

Update a specific set (reps, weight, or completion status).

**URL Parameters:**

- `id`: Set ID

**Authentication:** Required

**Request Body (partial):**

```typescript
{
  reps?: number,
  weight?: number,
  completed?: boolean
}
```

**Response (200):**

```typescript
{
  id: string,
  exerciseId: string,
  reps: number,
  weight: number,
  completed: boolean,
  orderIndex: number
}
```

**Errors:**

- 401: Not authenticated
- 404: Set not found
- 400: Invalid update data
- 500: Server error

---

### Rehab Endpoints

#### GET /api/rehab

Get all rehab exercises for authenticated user.

**Authentication:** Required

**Response (200):**

```typescript
[
  {
    id: string,
    userId: string,
    name: string,
    description: string | null,
    category: string | null,
    setsLeft: number | null,
    setsRight: number | null,
    sets: number | null,
    reps: number | null,
    hold: number | null,
    load: string | null,
    bandColor: string | null,
    time: string | null,
    cues: string | null,
    completed: boolean,
    completedDate: string | null,
    orderIndex: number,
  },
];
```

**Errors:**

- 401: Not authenticated
- 500: Server error

**Sorting:**

- Ordered by `orderIndex` ascending

---

#### POST /api/rehab

Create a new rehab exercise.

**Authentication:** Required

**Request Body:**

```typescript
{
  name: string,           // Required
  description?: string,
  category?: string,
  setsLeft?: number,
  setsRight?: number,
  sets?: number,
  reps?: number,
  hold?: number,
  load?: string,
  bandColor?: string,
  time?: string,
  cues?: string
}
```

**Response (201):**

```typescript
{
  id: string,
  userId: string,
  name: string,
  // ... all fields
  orderIndex: number
}
```

**Errors:**

- 401: Not authenticated
- 400: Missing name
- 500: Server error

**Business Logic:**

```typescript
// Auto-calculate orderIndex
const existingExercises = await prisma.rehabExercise.findMany({
  where: { userId },
  orderBy: { orderIndex: 'desc' },
  take: 1,
});

const orderIndex = existingExercises.length > 0 ? existingExercises[0].orderIndex + 1 : 0;
```

---

#### PATCH /api/rehab/[id]

Update rehab exercise (partial update).

**URL Parameters:**

- `id`: Exercise ID

**Authentication:** Required

**Request Body (any field):**

```typescript
{
  name?: string,
  description?: string,
  category?: string,
  // ... any other field
  completed?: boolean,
  completedDate?: string
}
```

**Response (200):**

```typescript
{
  id: string,
  // ... all updated fields
}
```

**Errors:**

- 401: Not authenticated
- 404: Exercise not found
- 500: Server error

---

#### DELETE /api/rehab/[id]

Delete a rehab exercise.

**URL Parameters:**

- `id`: Exercise ID

**Authentication:** Required

**Response (200):**

```typescript
{
  success: true;
}
```

**Errors:**

- 401: Not authenticated
- 404: Exercise not found
- 500: Server error

---

### Stats Endpoints

#### GET /api/stats

Get user statistics.

**Authentication:** Required

**Response (200):**

```typescript
{
  totalSetsCompleted: number,
  totalExercises: number,
  lastWorkoutDate: string | null
}
```

**Errors:**

- 401: Not authenticated
- 404: Stats not found (user has never completed a workout)
- 500: Server error

---

### Calendar Endpoints

#### GET /api/calendar

Get workout summary for calendar view.

**Authentication:** Required

**Query Parameters:**

- `year`: Year (e.g., 2025)
- `month`: Month (1-12)

**Response (200):**

```typescript
[
  {
    date: string, // YYYY-MM-DD
    workoutId: string,
    completed: boolean,
    exerciseCount: number,
    setCount: number,
  },
];
```

**Errors:**

- 401: Not authenticated
- 400: Invalid year or month
- 500: Server error

---

### Dashboard Endpoints

#### GET /api/dashboard

Get dashboard summary data.

**Authentication:** Required

**Response (200):**

```typescript
{
  stats: {
    totalSetsCompleted: number,
    totalExercises: number,
    lastWorkoutDate: string | null
  },
  recentWorkouts: [
    {
      id: string,
      date: string,
      completed: boolean,
      exerciseCount: number
    }
  ],
  setupComplete: boolean,
  rehabEnabled: boolean
}
```

**Errors:**

- 401: Not authenticated
- 500: Server error

---

### Settings Endpoints

#### GET /api/settings

Get user settings.

**Authentication:** Required

**Response (200):**

```typescript
{
  name: string,
  email: string | null,
  rehabEnabled: boolean,
  setupComplete: boolean
}
```

---

#### PATCH /api/settings

Update user settings.

**Authentication:** Required

**Request Body (any field):**

```typescript
{
  name?: string,
  email?: string,
  rehabEnabled?: boolean,
  setupComplete?: boolean
}
```

**Response (200):**

```typescript
{
  name: string,
  email: string | null,
  rehabEnabled: boolean,
  setupComplete: boolean
}
```

**Errors:**

- 401: Not authenticated
- 400: Username already taken
- 500: Server error

---

### Habit Tracking Endpoints

#### POST /api/habits

Log a habit occurrence (smoking or nicotine pouch use).

**Authentication:** Required

**Request Body:**

```typescript
{
  type: 'SMOKING' | 'NICOTINE_POUCH';
}
```

**Response (201):**

```typescript
{
  id: string,
  userId: string,
  type: string,
  timestamp: string  // ISO 8601
}
```

**Errors:**

- 401: Not authenticated
- 400: Invalid habit type
- 500: Server error

**Business Logic:**

```typescript
// Create habit log with current timestamp
const habitLog = await prisma.habitLog.create({
  data: {
    userId: auth.userId,
    type,
  },
});
```

---

#### GET /api/habits

Get aggregated habit statistics for today and this week.

**Authentication:** Required

**Response (200):**

```typescript
{
  today: {
    smoking: number,
    nicotinePouches: number
  },
  thisWeek: {
    smoking: number,
    nicotinePouches: number
  }
}
```

**Errors:**

- 401: Not authenticated
- 500: Server error

**Business Logic:**

```typescript
// Calculate start of today
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

// Calculate start of week (Sunday)
const startOfWeek = new Date();
startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
startOfWeek.setHours(0, 0, 0, 0);

// Fetch logs and aggregate counts by type
const todayLogs = await prisma.habitLog.findMany({
  where: {
    userId: auth.userId,
    timestamp: { gte: startOfToday },
  },
});

const weekLogs = await prisma.habitLog.findMany({
  where: {
    userId: auth.userId,
    timestamp: { gte: startOfWeek },
  },
});

// Count occurrences by type
const stats = {
  today: {
    smoking: todayLogs.filter((log) => log.type === 'SMOKING').length,
    nicotinePouches: todayLogs.filter((log) => log.type === 'NICOTINE_POUCH').length,
  },
  thisWeek: {
    smoking: weekLogs.filter((log) => log.type === 'SMOKING').length,
    nicotinePouches: weekLogs.filter((log) => log.type === 'NICOTINE_POUCH').length,
  },
};
```

---

#### DELETE /api/habits/undo

Delete the most recent habit log from today (undo last entry).

**Authentication:** Required

**Response (200):**

```typescript
{
  success: true;
}
```

**Errors:**

- 401: Not authenticated
- 404: No habit logs found for today
- 500: Server error

**Business Logic:**

```typescript
// Find most recent log from today
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const mostRecentLog = await prisma.habitLog.findFirst({
  where: {
    userId: auth.userId,
    timestamp: { gte: startOfToday },
  },
  orderBy: { timestamp: 'desc' },
});

if (!mostRecentLog) {
  return NextResponse.json({ error: 'No habit logs found for today' }, { status: 404 });
}

// Delete the log
await prisma.habitLog.delete({
  where: { id: mostRecentLog.id },
});
```

---

## Request/Response Patterns

### Standard GET Request

```typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const auth = await getUserFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Query database
    const data = await prisma.resource.findMany({
      where: { userId: auth.userId },
    });

    // 3. Return data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

### Standard POST Request

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const auth = await getUserFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate body
    const body = await request.json();
    const { requiredField } = body;

    if (!requiredField) {
      return NextResponse.json({ error: 'Required field is missing' }, { status: 400 });
    }

    // 3. Create resource
    const created = await prisma.resource.create({
      data: {
        userId: auth.userId,
        requiredField,
        ...body,
      },
    });

    // 4. Return created resource
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}
```

### Standard PATCH Request

```typescript
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // 1. Authenticate
    const auth = await getUserFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get ID from params
    const { id } = await context.params;

    // 3. Parse body (partial update)
    const updates = await request.json();

    // 4. Update resource
    const updated = await prisma.resource.update({
      where: { id },
      data: updates,
    });

    // 5. Return updated resource
    return NextResponse.json(updated);
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}
```

## Error Handling

### Prisma Error Codes

| Code  | Meaning                     | HTTP Status | Handler                  |
| ----- | --------------------------- | ----------- | ------------------------ |
| P2002 | Unique constraint violation | 400         | "Username already taken" |
| P2025 | Record not found            | 404         | "Resource not found"     |
| P2003 | Foreign key constraint      | 400         | "Invalid reference"      |

**Example:**

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

### Validation Errors

```typescript
// Missing required fields
if (!name || !password) {
  return NextResponse.json({ error: 'Name and password are required' }, { status: 400 });
}

// Invalid format
if (!email.includes('@')) {
  return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
}

// Out of range
if (reps < 1 || reps > 1000) {
  return NextResponse.json({ error: 'Reps must be between 1 and 1000' }, { status: 400 });
}
```

## Rate Limiting

**Current Status**: Not implemented

**Future Implementation:**

- Use Vercel Edge Config or Redis
- Limit: 100 requests per minute per user
- Return 429 (Too Many Requests) when exceeded

## CORS Configuration

**Current Setup**: Same-origin only (no CORS headers)

**For API-only usage:**

```typescript
const response = NextResponse.json(data);
response.headers.set('Access-Control-Allow-Origin', 'https://yourdomain.com');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
return response;
```

## API Versioning

**Current Version**: v1 (implicit)

**Future Versioning Strategy:**

- URL-based: `/api/v2/workouts`
- Header-based: `Accept: application/vnd.gymbros.v2+json`

**Breaking Changes:**

- Add new version prefix
- Maintain old version for 6 months
- Document migration guide

## Testing APIs

### Using curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

# Get workout (with cookie)
curl http://localhost:3000/api/workouts/2025-01-15 \
  -b cookies.txt
```

### Using Postman/Insomnia

1. POST to `/api/auth/login` to get cookie
2. Subsequent requests automatically include cookie
3. Use environment variables for base URL

### Using Jest/React Testing Library

See [Testing Guide](../development/TESTING_GUIDE.md) for comprehensive examples.

## Performance Considerations

### Database Query Optimization

```typescript
// BAD: N+1 queries
const workouts = await prisma.workout.findMany();
for (const workout of workouts) {
  const exercises = await prisma.exercise.findMany({
    where: { workoutId: workout.id },
  });
}

// GOOD: Single query with include
const workouts = await prisma.workout.findMany({
  include: {
    exercises: {
      include: { sets: true },
    },
  },
});
```

### Response Size

- Use `select` to return only needed fields
- Implement pagination for large lists
- Consider GraphQL for complex queries

## Security Best Practices

1. **Never return passwordHash** in API responses
2. **Validate all inputs** (type, range, format)
3. **Use parameterized queries** (Prisma does this automatically)
4. **Set secure cookie flags** (httpOnly, secure, sameSite)
5. **Log errors** but don't expose internal details to clients

## Related Documentation

- [System Architecture](SYSTEM_ARCHITECTURE.md) - Overall system design
- [Database Schema](DATABASE_SCHEMA.md) - Database models and relationships
- [Testing Guide](../development/TESTING_GUIDE.md) - How to test API endpoints
