# Development Setup Guide

## Prerequisites

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **PostgreSQL** 14+ or SQLite (for local dev)
- **Git** for version control

Check versions:

```bash
node --version   # Should be v18.x or higher
npm --version    # Should be 9.x or higher
```

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd gym-bros-app
```

### 2. Install Dependencies

```bash
npm install
```

This installs all packages defined in `package.json` and runs `postinstall` script to generate Prisma client.

### 3. Environment Configuration

Create `.env` file in project root:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/gym_bros"

# For local development with SQLite (simpler):
# DATABASE_URL="file:./dev.db"

# Node Environment
NODE_ENV="development"
```

**Database URL Formats:**

**PostgreSQL (Production/Staging):**

```
DATABASE_URL="postgresql://username:password@host:5432/database_name"
```

**SQLite (Local Development):**

```
DATABASE_URL="file:./dev.db"
```

**Turso (Serverless SQLite):**

```
DATABASE_URL="libsql://your-database.turso.io"
```

### 4. Database Setup

**Option A: PostgreSQL (Recommended for Production-like Dev)**

```bash
# Create database
createdb gym_bros

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

**Option B: SQLite (Quickest for Local Dev)**

```bash
# Migrations create the database file automatically
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 5. Seed Database (Optional)

Create demo user and sample data:

```bash
node seed-rehab.js
```

This creates:

- Demo user: `demo` / `demo123`
- Sample workout with exercises
- Sample rehab exercises
- Initial stats

### 6. Start Development Server

```bash
npm run dev
```

Server runs on [http://localhost:3000](http://localhost:3000)

## Development Workflow

### Running the App

```bash
# Development mode (hot reload)
npm run dev

# Production build
npm run build
npm start
```

### Database Operations

```bash
# Create new migration
npx prisma migrate dev --name add_new_field

# View database in Prisma Studio
npx prisma studio

# Reset database (DESTROYS DATA)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Code Quality

```bash
# Format code
npx prettier --write "**/*.{js,ts,tsx,json,md}"

# Lint code
npx eslint "src/**/*.{js,ts,tsx}"

# Type check
npx tsc --noEmit
```

## Common Setup Issues

### Issue: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:

```bash
npx prisma generate
```

### Issue: Database Connection Failed

**Error**: `Can't reach database server`

**Solution**:

1. Check DATABASE_URL is correct
2. Ensure PostgreSQL is running: `pg_isready`
3. Verify database exists: `psql -l`
4. Check firewall allows port 5432

### Issue: Port 3000 Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:

```bash
# Find process using port 3000
# Windows:
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :3000

# Kill the process or use different port
# Set PORT environment variable:
PORT=3001 npm run dev
```

### Issue: Module Not Found After `npm install`

**Solution**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript Errors After Git Pull

**Solution**:

```bash
# Regenerate Prisma types
npx prisma generate

# Rebuild TypeScript
npm run build
```

## IDE Setup

### VS Code (Recommended)

**Recommended Extensions:**

- Prisma (prisma.prisma)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)

**Settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

### WebStorm/IntelliJ

1. Install Prisma plugin
2. Enable ESLint: Preferences → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
3. Enable Prettier: Preferences → Languages & Frameworks → JavaScript → Prettier

## Project Structure Overview

```
gym-bros-app/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API routes (serverless functions)
│   │   ├── dashboard/   # Dashboard page
│   │   ├── workout/     # Workout pages
│   │   └── layout.tsx   # Root layout
│   ├── components/       # React components
│   ├── lib/             # Utilities and helpers
│   ├── hooks/           # Custom React hooks
│   └── middleware.ts    # Auth middleware
├── prisma/
│   └── schema.prisma    # Database schema
├── docs/                # Documentation
├── public/              # Static assets
└── tests/               # Test files (coming soon)
```

## Git Workflow

### Branch Strategy

```bash
# Main branches
main        # Production-ready code
dev         # Development branch

# Feature branches
git checkout -b feature/your-feature-name
git checkout -b fix/bug-description
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add workout import functionality
fix: correct date parsing in calendar
docs: update API documentation
test: add tests for auth helpers
refactor: simplify set completion logic
```

### Before Committing

```bash
# 1. Run tests
npm test

# 2. Format code
npx prettier --write .

# 3. Check types
npx tsc --noEmit

# 4. Stage and commit
git add .
git commit -m "feat: your feature description"
```

## Environment-Specific Configuration

### Development (.env.development.local)

```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

### Production (.env.production)

```env
DATABASE_URL="postgresql://prod_user:prod_pass@prod-host:5432/gym_bros_prod"
NODE_ENV="production"
```

Never commit `.env` files! They're in `.gitignore`.

## Troubleshooting Database

### View Current Schema

```bash
npx prisma db pull  # Pull schema from existing database
npx prisma db push  # Push schema to database (without migration)
```

### Reset Database Completely

```bash
npx prisma migrate reset --skip-seed
npx prisma migrate dev
node seed-rehab.js
```

### Inspect Database

```bash
# PostgreSQL
psql gym_bros
\dt          # List tables
\d users     # Describe users table

# SQLite
sqlite3 dev.db
.tables      # List tables
.schema users  # Show users schema
```

## Performance Tips

### Optimize Prisma Queries

```typescript
// Use include to avoid N+1
const workouts = await prisma.workout.findMany({
  include: { exercises: { include: { sets: true } } },
});

// Use select to fetch only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true },
});
```

### Next.js Development

- Use Server Components by default (faster, smaller bundle)
- Only use Client Components when needed (`'use client'`)
- Leverage TanStack Query for client-side caching

## Next Steps

After setup:

1. Read [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)
2. Explore [API Architecture](../architecture/API_ARCHITECTURE.md)
3. Review [Database Schema](../architecture/DATABASE_SCHEMA.md)
4. Check [Testing Guide](TESTING_GUIDE.md) before writing code

## Getting Help

- Check [Troubleshooting](../troubleshooting/COMMON_ISSUES.md)
- Review error logs in console
- Inspect Prisma queries with `DEBUG="prisma:*" npm run dev`
- Ask team for help on Slack/Discord

## Related Documentation

- [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)
- [Testing Guide](TESTING_GUIDE.md)
- [API Architecture](../architecture/API_ARCHITECTURE.md)
