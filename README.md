# Gym Bros App

A comprehensive fitness tracking application for managing workouts and rehabilitation exercises. Built with Next.js 15, React 19, and Prisma.

## Features

### Workout Tracking

- **Daily Workout Management**: Create and track workouts for any date
- **Exercise Organization**: Structure workouts with multiple exercises
- **Set Tracking**: Record reps, weight, and completion status for each set
- **Workout History**: View past workouts via interactive calendar
- **Import Workouts**: Bulk import workouts from templates

### Rehabilitation Management

- **Rehab Exercise Library**: Track prescribed rehabilitation exercises
- **Category Organization**: Group exercises by type (warm-up, mobility, strength)
- **Detailed Parameters**: Track sets, reps, hold times, resistance bands, and weights
- **Progress Tracking**: Mark exercises complete and track completion dates
- **Side-Specific Exercises**: Support for left/right side-specific exercises

### Analytics & Progress

- **Statistics Dashboard**: View total sets completed, exercise count, and last workout date
- **Calendar View**: Visual representation of workout history
- **Activity Logging**: System-level activity tracking for debugging and monitoring

## Tech Stack

### Frontend

- **Next.js 15.5**: React framework with App Router
- **React 19.1**: UI library with latest features
- **TypeScript 5**: Type-safe JavaScript
- **Tailwind CSS 4**: Utility-first CSS framework
- **Framer Motion 12**: Animation library
- **TanStack Query 5**: Server state management
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **Prisma 6.17**: ORM for database access
- **PostgreSQL**: Relational database
- **bcryptjs**: Password hashing
- **Cookie-based Auth**: Secure session management

### Development

- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or remote)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gym-bros-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/gym_bros"
   ```

   For development with local file:

   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Initialize the database**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the setup script** (optional, creates demo user)

   ```bash
   npm run setup
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Start development server on port 3000 |
| `npm run build`         | Build production bundle               |
| `npm start`             | Start production server               |
| `npm test`              | Run test suite                        |
| `npm run test:watch`    | Run tests in watch mode               |
| `npm run test:coverage` | Run tests with coverage report        |
| `npm run setup`         | Initialize database with demo data    |
| `npm run migrate:turso` | Run Turso-specific migrations         |

## Project Structure

```
gym-bros-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── workouts/     # Workout CRUD operations
│   │   │   ├── rehab/        # Rehabilitation exercise management
│   │   │   ├── sets/         # Set update operations
│   │   │   ├── stats/        # Statistics endpoints
│   │   │   └── calendar/     # Calendar data
│   │   ├── dashboard/        # Main dashboard page
│   │   ├── calendar/         # Calendar view
│   │   ├── workout/[date]/   # Daily workout page
│   │   ├── rehab/            # Rehab management
│   │   ├── stats/            # Statistics page
│   │   ├── settings/         # User settings
│   │   └── layout.tsx        # Root layout
│   ├── components/            # Reusable React components
│   │   ├── BottomNav.tsx     # Mobile navigation
│   │   ├── PageNav.tsx       # Desktop navigation
│   │   └── AnimatedBackground.tsx
│   ├── lib/                   # Utility functions and helpers
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── auth-helpers.ts   # Authentication utilities
│   │   ├── date-utils.ts     # Date formatting functions
│   │   ├── rehab-helpers.ts  # Rehab data transformations
│   │   ├── types.ts          # TypeScript type definitions
│   │   └── demo-data.ts      # Demo data generator
│   ├── hooks/                 # Custom React hooks
│   │   └── useActivityLog.ts
│   ├── providers/             # React context providers
│   │   └── QueryProvider.tsx # TanStack Query provider
│   └── middleware.ts          # Next.js middleware (auth)
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/
│   └── migrate-turso.js      # Database migration scripts
├── docs/                      # Documentation
│   ├── architecture/         # System architecture docs
│   ├── development/          # Development guides
│   ├── workflows/            # Team workflows
│   └── troubleshooting/      # Common issues
├── public/                    # Static assets
├── CLAUDE.md                 # Development best practices
├── README.md                 # This file
└── package.json              # Dependencies and scripts
```

## Authentication Flow

1. User registers with username and optional email
2. Password is hashed with bcryptjs (salt rounds: 10)
3. On login, credentials are verified and userId is stored in HTTP-only cookie
4. Middleware checks cookie on protected routes and redirects if missing
5. API routes use `getUserFromCookies()` helper to authenticate requests
6. Rehab endpoints use `requireRehabUser()` to enforce feature flags

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **User**: Authentication and profile data
- **Workout**: Daily workout sessions
- **Exercise**: Exercises within a workout
- **Set**: Individual sets (reps, weight, completion)
- **Stats**: Aggregated user statistics
- **RehabExercise**: Rehabilitation exercise prescriptions
- **ActivityLog**: System activity tracking

See [`docs/architecture/DATABASE_SCHEMA.md`](docs/architecture/DATABASE_SCHEMA.md) for detailed schema documentation.

## API Architecture

RESTful API endpoints organized by resource:

- `/api/auth/*` - Authentication (login, register, logout)
- `/api/workouts/*` - Workout CRUD operations
- `/api/sets/*` - Set updates
- `/api/rehab/*` - Rehab exercise management
- `/api/stats` - User statistics
- `/api/calendar` - Calendar data
- `/api/dashboard` - Dashboard data
- `/api/settings` - User settings

All endpoints require authentication via cookie (except login/register).

See [`docs/architecture/API_ARCHITECTURE.md`](docs/architecture/API_ARCHITECTURE.md) for detailed API documentation.

## Development

### Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality

The project enforces code quality through:

- **TypeScript**: Strict type checking
- **ESLint**: Code linting rules
- **Prettier**: Automatic code formatting
- **Pre-commit hooks**: Automated checks before commits

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### Environment Variables

| Variable       | Description                          | Required |
| -------------- | ------------------------------------ | -------- |
| `DATABASE_URL` | PostgreSQL connection string         | Yes      |
| `NODE_ENV`     | Environment (development/production) | No       |

## Deployment

### Building for Production

```bash
npm run build
npm start
```

### Vercel Deployment

The app is optimized for Vercel deployment:

1. Connect your Git repository to Vercel
2. Set `DATABASE_URL` environment variable
3. Deploy automatically on push to main branch

Configuration in `vercel.json`:

```json
{
  "buildCommand": "prisma generate && next build"
}
```

## Contributing

1. Follow the coding standards in [`CLAUDE.md`](CLAUDE.md)
2. Write tests for all new features (TDD approach)
3. Ensure all tests pass before committing
4. Use Conventional Commits format for commit messages
5. Update documentation for significant changes

## Troubleshooting

### Common Issues

**Database Connection Failed**

- Verify `DATABASE_URL` is correctly set
- Ensure PostgreSQL is running
- Check network connectivity to remote database

**Prisma Client Not Generated**

- Run `npx prisma generate`
- Ensure `@prisma/client` is installed

**Authentication Not Working**

- Clear browser cookies and try again
- Check that `userId` cookie is being set
- Verify middleware is running on protected routes

See [`docs/troubleshooting/COMMON_ISSUES.md`](docs/troubleshooting/COMMON_ISSUES.md) for more help.

## License

Private project. All rights reserved.

## Support

For issues, questions, or feature requests, please create an issue in the repository.
