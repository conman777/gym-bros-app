# Database Schema

## Overview

The application uses PostgreSQL in production and supports SQLite for local development. The schema is managed by Prisma ORM, which provides type-safe database access and automatic migrations.

**Schema Location**: `prisma/schema.prisma`

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ├─────────────────┬──────────────────┬─────────────┐
       │                 │                  │             │
       │ 1:N             │ 1:N              │ 1:1         │ 1:N
       │                 │                  │             │
   ┌───▼────┐      ┌─────▼──────┐      ┌───▼───┐    ┌───▼────────────┐
   │Workout │      │RehabExercise│      │ Stats │    │  ActivityLog   │
   └───┬────┘      └─────────────┘      └───────┘    │  (no relation) │
       │                                              └────────────────┘
       │ 1:N
       │
   ┌───▼────────┐
   │  Exercise  │
   └───┬────────┘
       │
       │ 1:N
       │
   ┌───▼───┐
   │  Set  │
   └───────┘
```

## Models

### User

Represents an authenticated user of the application.

```prisma
model User {
  id             String          @id @default(cuid())
  name           String          @unique
  email          String?         @unique
  passwordHash   String?
  rehabEnabled   Boolean         @default(false)
  setupComplete  Boolean         @default(false)
  workouts       Workout[]
  stats          Stats?
  rehabExercises RehabExercise[]
}
```

**Fields:**

| Field           | Type    | Constraints       | Description                                  |
| --------------- | ------- | ----------------- | -------------------------------------------- |
| `id`            | String  | Primary Key, CUID | Unique identifier                            |
| `name`          | String  | Unique, Required  | Username for login                           |
| `email`         | String? | Unique, Optional  | Email address (optional, unverified)         |
| `passwordHash`  | String? | Optional          | bcrypt hashed password (null for demo users) |
| `rehabEnabled`  | Boolean | Default: false    | Feature flag for rehab functionality         |
| `setupComplete` | Boolean | Default: false    | Whether user completed onboarding            |

**Relationships:**

- Has many `Workout` (one user can have multiple workouts)
- Has many `RehabExercise` (one user can have multiple rehab exercises)
- Has one `Stats` (one user has one stats record)

**Indexes:**

- Unique index on `name` (for fast login lookups)
- Unique index on `email` (if provided)

**Business Rules:**

- Username must be unique across all users
- Password is required for regular users, optional for demo accounts
- Email is optional and not currently used for verification

---

### Workout

Represents a daily workout session.

```prisma
model Workout {
  id         String     @id @default(cuid())
  userId     String
  date       DateTime
  completed  Boolean    @default(false)
  exercises  Exercise[]
  user       User       @relation(fields: [userId], references: [id])

  @@index([userId, date])
}
```

**Fields:**

| Field       | Type     | Constraints           | Description                             |
| ----------- | -------- | --------------------- | --------------------------------------- |
| `id`        | String   | Primary Key, CUID     | Unique identifier                       |
| `userId`    | String   | Foreign Key → User.id | Owner of the workout                    |
| `date`      | DateTime | Required              | Date of the workout                     |
| `completed` | Boolean  | Default: false        | Whether all exercises/sets are complete |

**Relationships:**

- Belongs to one `User` (via `userId`)
- Has many `Exercise` (one workout contains multiple exercises)

**Indexes:**

- Composite index on `(userId, date)` for efficient workout queries by user and date

**Business Rules:**

- User can have multiple workouts on the same date (not enforced by schema)
- Workout is marked complete when all sets are completed
- Deleting a user cascades to delete all their workouts (via Prisma)

**Common Queries:**

```typescript
// Get today's workout for a user
const workout = await prisma.workout.findFirst({
  where: {
    userId,
    date: { gte: startOfDay, lt: endOfDay },
  },
  include: { exercises: { include: { sets: true } } },
});

// Get all workouts in date range
const workouts = await prisma.workout.findMany({
  where: {
    userId,
    date: { gte: startDate, lte: endDate },
  },
  orderBy: { date: 'desc' },
});
```

---

### Exercise

Represents an exercise within a workout (e.g., "Bench Press", "Squats").

```prisma
model Exercise {
  id         String   @id @default(cuid())
  workoutId  String
  name       String
  orderIndex Int
  sets       Set[]
  workout    Workout  @relation(fields: [workoutId], references: [id], onDelete: Cascade)

  @@index([workoutId])
}
```

**Fields:**

| Field        | Type   | Constraints              | Description                            |
| ------------ | ------ | ------------------------ | -------------------------------------- |
| `id`         | String | Primary Key, CUID        | Unique identifier                      |
| `workoutId`  | String | Foreign Key → Workout.id | Parent workout                         |
| `name`       | String | Required                 | Exercise name (e.g., "Bench Press")    |
| `orderIndex` | Int    | Required                 | Display order within workout (0-based) |

**Relationships:**

- Belongs to one `Workout` (via `workoutId`)
- Has many `Set` (one exercise contains multiple sets)

**Indexes:**

- Index on `workoutId` for fast lookups of exercises in a workout

**Cascade Behavior:**

- `onDelete: Cascade` - Deleting a workout deletes all its exercises

**Business Rules:**

- `orderIndex` determines display order in the UI
- Exercise names are free-text (no predefined exercise library yet)
- Exercises are specific to a workout (not reusable templates)

**Common Queries:**

```typescript
// Get all exercises for a workout
const exercises = await prisma.exercise.findMany({
  where: { workoutId },
  include: { sets: true },
  orderBy: { orderIndex: 'asc' },
});
```

---

### Set

Represents a single set of an exercise (e.g., "3 reps at 135 lbs").

```prisma
model Set {
  id         String   @id @default(cuid())
  exerciseId String
  reps       Int
  weight     Float
  completed  Boolean  @default(false)
  orderIndex Int
  exercise   Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)

  @@index([exerciseId])
}
```

**Fields:**

| Field        | Type    | Constraints               | Description                              |
| ------------ | ------- | ------------------------- | ---------------------------------------- |
| `id`         | String  | Primary Key, CUID         | Unique identifier                        |
| `exerciseId` | String  | Foreign Key → Exercise.id | Parent exercise                          |
| `reps`       | Int     | Required                  | Number of repetitions                    |
| `weight`     | Float   | Required                  | Weight in user's preferred unit (lbs/kg) |
| `completed`  | Boolean | Default: false            | Whether this set has been completed      |
| `orderIndex` | Int     | Required                  | Display order within exercise (0-based)  |

**Relationships:**

- Belongs to one `Exercise` (via `exerciseId`)

**Indexes:**

- Index on `exerciseId` for fast lookups of sets in an exercise

**Cascade Behavior:**

- `onDelete: Cascade` - Deleting an exercise deletes all its sets

**Business Rules:**

- Weight can be 0 (for bodyweight exercises)
- Reps must be > 0 (enforced in application logic)
- `completed` flag triggers stats updates when all sets are complete

**Common Queries:**

```typescript
// Update set completion
await prisma.set.update({
  where: { id: setId },
  data: { completed: true },
});

// Check if all sets in workout are complete
const incompleteSets = await prisma.set.count({
  where: {
    exercise: {
      workoutId,
    },
    completed: false,
  },
});
```

---

### Stats

Aggregated statistics for a user.

```prisma
model Stats {
  id                String   @id @default(cuid())
  userId            String   @unique
  totalSetsCompleted Int     @default(0)
  totalExercises    Int     @default(0)
  lastWorkoutDate   DateTime?
  user              User     @relation(fields: [userId], references: [id])
}
```

**Fields:**

| Field                | Type      | Constraints                   | Description                           |
| -------------------- | --------- | ----------------------------- | ------------------------------------- |
| `id`                 | String    | Primary Key, CUID             | Unique identifier                     |
| `userId`             | String    | Foreign Key → User.id, Unique | Owner of the stats                    |
| `totalSetsCompleted` | Int       | Default: 0                    | Lifetime count of completed sets      |
| `totalExercises`     | Int       | Default: 0                    | Lifetime count of exercises attempted |
| `lastWorkoutDate`    | DateTime? | Optional                      | Date of most recent workout           |

**Relationships:**

- Belongs to one `User` (via `userId`)
- One-to-one relationship (each user has exactly one stats record)

**Indexes:**

- Unique constraint on `userId` enforces one-to-one relationship

**Business Rules:**

- Stats are incremented when sets/workouts are completed
- Stats are NOT decremented when sets are deleted (lifetime totals)
- `lastWorkoutDate` is updated whenever a workout is marked complete

**Update Pattern:**

```typescript
// Increment stats when workout completes
await prisma.stats.upsert({
  where: { userId },
  create: {
    userId,
    totalSetsCompleted: completedSetsCount,
    totalExercises: exerciseCount,
    lastWorkoutDate: new Date(),
  },
  update: {
    totalSetsCompleted: { increment: completedSetsCount },
    totalExercises: { increment: exerciseCount },
    lastWorkoutDate: new Date(),
  },
});
```

---

### RehabExercise

Represents a rehabilitation exercise prescription for injury recovery.

```prisma
model RehabExercise {
  id            String    @id @default(cuid())
  userId        String
  name          String
  description   String?
  category      String?   // e.g., "Warm-up", "Mobility & Stretching"
  setsLeft      Int?      // Number of sets for left side
  setsRight     Int?      // Number of sets for right side
  sets          Int?      // Number of sets (when not side-specific)
  reps          Int?      // Number of repetitions
  hold          Int?      // Hold time in seconds
  load          String?   // Load/weight (e.g., "2 kg", "7.5 kg")
  bandColor     String?   // Resistance band color
  time          String?   // Time duration (e.g., "3-5 min")
  cues          String?   // Exercise cues and instructions
  completed     Boolean   @default(false)
  completedDate DateTime?
  orderIndex    Int
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**Fields:**

| Field           | Type      | Constraints           | Description                                        |
| --------------- | --------- | --------------------- | -------------------------------------------------- |
| `id`            | String    | Primary Key, CUID     | Unique identifier                                  |
| `userId`        | String    | Foreign Key → User.id | Patient/user this exercise is prescribed to        |
| `name`          | String    | Required              | Exercise name (e.g., "Shoulder External Rotation") |
| `description`   | String?   | Optional              | Detailed exercise description                      |
| `category`      | String?   | Optional              | Exercise category for grouping                     |
| `setsLeft`      | Int?      | Optional              | Sets for left side (for bilateral exercises)       |
| `setsRight`     | Int?      | Optional              | Sets for right side (for bilateral exercises)      |
| `sets`          | Int?      | Optional              | Total sets (for non-bilateral exercises)           |
| `reps`          | Int?      | Optional              | Repetitions per set                                |
| `hold`          | Int?      | Optional              | Hold time in seconds (for isometric exercises)     |
| `load`          | String?   | Optional              | Weight or resistance (free text)                   |
| `bandColor`     | String?   | Optional              | Resistance band color/resistance level             |
| `time`          | String?   | Optional              | Duration (e.g., "3-5 min" for mobility work)       |
| `cues`          | String?   | Optional              | Coaching cues and form reminders                   |
| `completed`     | Boolean   | Default: false        | Whether exercise has been completed today          |
| `completedDate` | DateTime? | Optional              | When exercise was last completed                   |
| `orderIndex`    | Int       | Required              | Display order in rehab program                     |

**Relationships:**

- Belongs to one `User` (via `userId`)

**Indexes:**

- Index on `userId` for fast lookups of user's rehab exercises

**Cascade Behavior:**

- `onDelete: Cascade` - Deleting a user deletes all their rehab exercises

**Business Rules:**

- Either `sets` OR (`setsLeft` + `setsRight`) should be populated, not both
- `load` is free text to support various formats ("2 kg", "7.5 lbs", "Red band")
- `category` is used for grouping exercises in the UI
- `completed` resets daily (managed by application logic)

**Common Queries:**

```typescript
// Get all rehab exercises for user, grouped by category
const exercises = await prisma.rehabExercise.findMany({
  where: { userId },
  orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }],
});

// Mark exercise complete
await prisma.rehabExercise.update({
  where: { id: exerciseId },
  data: {
    completed: true,
    completedDate: new Date(),
  },
});
```

---

### ActivityLog

System-level activity logging for monitoring and debugging.

```prisma
model ActivityLog {
  id        String   @id @default(cuid())
  timestamp DateTime @default(now())
  category  String   // e.g., "PRICE_UPDATE", "PREDICTION", "API_CALL"
  operation String
  message   String
  status    String   // "SUCCESS", "ERROR", "IN_PROGRESS"
  details   Json?

  @@index([timestamp])
  @@index([category])
  @@index([status])
}
```

**Fields:**

| Field       | Type     | Constraints       | Description                       |
| ----------- | -------- | ----------------- | --------------------------------- |
| `id`        | String   | Primary Key, CUID | Unique identifier                 |
| `timestamp` | DateTime | Default: now()    | When the activity occurred        |
| `category`  | String   | Required          | Activity category (for filtering) |
| `operation` | String   | Required          | Specific operation name           |
| `message`   | String   | Required          | Human-readable description        |
| `status`    | String   | Required          | SUCCESS, ERROR, or IN_PROGRESS    |
| `details`   | Json?    | Optional          | Additional structured data        |

**Relationships:**

- None (standalone log table)

**Indexes:**

- Index on `timestamp` for time-range queries
- Index on `category` for filtering by category
- Index on `status` for finding errors

**Business Rules:**

- No foreign keys (intentionally decoupled from User)
- `details` field stores arbitrary JSON for flexibility
- Logs are append-only (no updates or deletes in production)

**Common Queries:**

```typescript
// Get recent errors
const errors = await prisma.activityLog.findMany({
  where: { status: 'ERROR' },
  orderBy: { timestamp: 'desc' },
  take: 100,
});

// Log an activity
await prisma.activityLog.create({
  data: {
    category: 'API_CALL',
    operation: 'workout_created',
    message: `Workout created for user ${userId}`,
    status: 'SUCCESS',
    details: { workoutId, date },
  },
});
```

---

## Indexes Summary

### Performance Indexes

| Table         | Index            | Type        | Purpose                         |
| ------------- | ---------------- | ----------- | ------------------------------- |
| User          | `name`           | Unique      | Fast login lookups              |
| User          | `email`          | Unique      | Email uniqueness constraint     |
| Workout       | `(userId, date)` | Composite   | Query workouts by user and date |
| Exercise      | `workoutId`      | Foreign Key | Join exercises to workouts      |
| Set           | `exerciseId`     | Foreign Key | Join sets to exercises          |
| RehabExercise | `userId`         | Foreign Key | Query user's rehab exercises    |
| ActivityLog   | `timestamp`      | Standard    | Time-range queries              |
| ActivityLog   | `category`       | Standard    | Filter by category              |
| ActivityLog   | `status`         | Standard    | Find errors quickly             |

### Missing Indexes (Consider Adding)

1. **Workout.completed** - For quickly finding incomplete workouts
2. **RehabExercise.completed** - For filtering completed rehab exercises
3. **Stats.lastWorkoutDate** - For sorting users by activity

---

## Data Integrity

### Cascade Deletes

```
User deleted
  ├─> All Workouts deleted
  │     ├─> All Exercises deleted
  │     │     └─> All Sets deleted
  │     └─> (cascade through relationships)
  ├─> All RehabExercises deleted
  └─> Stats deleted
```

### Constraints

**Unique Constraints:**

- `User.name` - Usernames must be unique
- `User.email` - Email addresses must be unique (if provided)
- `Stats.userId` - One stats record per user

**Foreign Key Constraints:**

- All foreign keys enforce referential integrity
- Invalid foreign keys are rejected by database

**NOT NULL Constraints:**

- Required fields enforced at database level
- Optional fields explicitly marked with `?` in Prisma

---

## Migration Strategy

### Creating Migrations

```bash
# Generate migration after schema changes
npx prisma migrate dev --name descriptive_migration_name

# Example migration names:
# - add_rehab_exercises
# - add_completed_date_to_rehab
# - add_activity_log_indexes
```

### Applying Migrations

```bash
# Development (creates migration + applies)
npx prisma migrate dev

# Production (applies existing migrations)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### Migration Best Practices

1. **Never edit applied migrations** - Create new ones instead
2. **Test migrations on staging** before production
3. **Backup database** before major schema changes
4. **Use transactions** for data migrations
5. **Keep migrations small** and focused

---

## Seed Data

**File**: `seed-rehab.js`

The seed script creates demo data for development:

```javascript
// Creates:
// - Demo user with username/password
// - Sample workout with exercises and sets
// - Rehab exercises (if rehabEnabled)
// - Initial stats record
```

**Run Seed:**

```bash
node seed-rehab.js
```

---

## Schema Evolution

### Adding New Fields

```prisma
// Example: Add workout notes field
model Workout {
  id         String     @id @default(cuid())
  // ... existing fields ...
  notes      String?    // NEW: Optional workout notes
}
```

**Migration:**

```bash
npx prisma migrate dev --name add_workout_notes
```

### Adding New Models

```prisma
// Example: Add workout templates
model WorkoutTemplate {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  exercises   Json     // Store exercises as JSON
  user        User     @relation(fields: [userId], references: [id])

  @@index([userId])
}
```

### Breaking Changes

**Renaming Fields:**

```prisma
// OLD: passwordHash
// NEW: password

// Create custom migration to preserve data
```

**Changing Types:**

```prisma
// OLD: weight Float
// NEW: weight Decimal // More precise for money

// Requires data migration script
```

---

## Query Optimization

### N+1 Query Problem

**BAD:**

```typescript
const workouts = await prisma.workout.findMany({ where: { userId } });
for (const workout of workouts) {
  const exercises = await prisma.exercise.findMany({
    where: { workoutId: workout.id },
  });
}
// N+1 queries: 1 for workouts + N for each workout's exercises
```

**GOOD:**

```typescript
const workouts = await prisma.workout.findMany({
  where: { userId },
  include: { exercises: { include: { sets: true } } },
});
// 1 query with JOIN
```

### Pagination

```typescript
// Cursor-based pagination (recommended)
const workouts = await prisma.workout.findMany({
  take: 20,
  skip: 1,
  cursor: { id: lastWorkoutId },
  orderBy: { date: 'desc' },
});

// Offset-based pagination (simpler but slower)
const workouts = await prisma.workout.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { date: 'desc' },
});
```

---

## Related Documentation

- [System Architecture](SYSTEM_ARCHITECTURE.md) - Overall system design
- [API Architecture](API_ARCHITECTURE.md) - API endpoints using this schema
- [Testing Guide](../development/TESTING_GUIDE.md) - How to test database operations
