# Gym Bros

A simple gym tracking app for Conor and Devlin to track workouts and stay on schedule.

## Features

- **User Profiles**: Separate tracking for Conor and Devlin
- **Workout Templates**: Import workout plans via copy/paste
- **Calendar View**: See all scheduled workouts at a glance
- **Workout Tracking**: Check off sets as you complete them with weight tracking
- **Auto-adjustment**: Missed workouts automatically shift forward
- **Progress Stats**: Track total sets, exercises, and streaks
- **Mobile-friendly**: Designed for use during workouts

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run on http://localhost:8879

3. Select your profile (Conor or Devlin)

4. Import a workout template:
   ```
   Monday - Chest & Triceps
   Bench Press: 3x10 @ 135lbs
   Incline Dumbbell Press: 3x12 @ 50lbs
   Cable Flyes: 3x15 @ 30lbs
   Tricep Pushdowns: 3x12 @ 40lbs
   
   Wednesday - Back & Biceps
   Deadlifts: 3x5 @ 225lbs
   Pull-ups: 3x8 @ bodyweight
   Barbell Rows: 3x10 @ 95lbs
   Bicep Curls: 3x12 @ 30lbs
   
   Friday - Legs
   Squats: 3x8 @ 185lbs
   Leg Press: 3x12 @ 270lbs
   Leg Curls: 3x15 @ 60lbs
   Calf Raises: 3x20 @ 100lbs
   ```

5. Start your workout and check off sets as you complete them

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Port**: 8879

## Database Management

The app uses SQLite for local data storage. The database file is located at `prisma/dev.db`.

To reset the database:
```bash
npx prisma db push --force-reset
```

To view the database:
```bash
npx prisma studio
```

## Development

The app follows TDD principles and best practices as outlined in CLAUDE.md.

### Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/         # API routes
│   ├── calendar/    # Calendar view
│   ├── dashboard/   # Main dashboard
│   ├── import/      # Template import
│   ├── stats/       # Statistics page
│   └── workout/     # Workout tracking
├── lib/             # Utilities and types
└── generated/       # Prisma client
```

## Production Build

To build for production:
```bash
npm run build
npm start
```