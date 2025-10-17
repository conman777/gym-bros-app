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

### Quick Setup (All Platforms)

The easiest way to get started on any platform (Windows, Linux, macOS, WSL):

```bash
npm run setup
```

This will:
- Install all dependencies
- Generate the Prisma client
- Set up the database
- Configure environment variables

Then start the development server:
```bash
npm run dev
```
The app will run on http://localhost:8885

### Manual Setup (Alternative)

If you prefer to run commands manually:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Set up the database:
   ```bash
   npx prisma db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Platform-Specific Notes

**Windows (Native PowerShell/CMD):**
- All commands work natively
- No WSL required
- Database stored at `prisma/dev.db`

**Windows (WSL):**
- Run all commands from within WSL terminal
- Database stored in WSL filesystem at `prisma/dev.db`

**Linux/macOS:**
- All commands work natively
- Database stored at `prisma/dev.db`

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
- **Port**: 8885

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

## Troubleshooting

### Windows Issues

**Problem: "NODE_ENV is not recognized"**
- Solution: This is fixed in the latest version. Run `npm install` to get the updated dependencies

**Problem: Database connection errors**
- Solution: Ensure the `.env` file points to `file:./prisma/dev.db`
- Check that the `prisma` directory exists
- Run `npm run setup` to reconfigure

**Problem: Prisma client errors**
- Solution: Regenerate the Prisma client with `npx prisma generate`
- The client is platform-specific, so regenerate after switching between Windows/WSL/Linux

### WSL Issues

**Problem: Permission errors**
- Solution: Ensure you're running commands from within WSL, not Windows PowerShell
- Check file permissions: `chmod +x setup.js`

**Problem: Database locked**
- Solution: Close any open Prisma Studio windows or other connections to the database

### General Issues

**Problem: Port 8885 already in use**
- Solution: Change the port in `server.js` or kill the process using the port
- Windows: `netstat -ano | findstr :8885` then `taskkill /PID <pid> /F`
- Linux/macOS: `lsof -ti:8885 | xargs kill -9`

## Legacy Scripts

The following scripts are deprecated and kept for reference only:
- `setup.ps1` - Old Windows PowerShell setup (use `npm run setup` instead)
- `setup-wsl.sh` - Old WSL setup (use `npm run setup` instead)

Use the unified `npm run setup` command for all platforms.

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