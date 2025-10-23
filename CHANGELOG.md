# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive documentation (README, SYSTEM_ARCHITECTURE, DATABASE_SCHEMA, API_ARCHITECTURE)
- Development guides (SETUP, TESTING_GUIDE)
- Testing framework setup (Jest + React Testing Library)
- Unit tests for utility functions
- Integration tests for API endpoints
- Code quality tools (Prettier, ESLint, Pre-commit hooks)

## [0.1.0] - 2025-01-15

### Added

- Initial project setup with Next.js 15 and React 19
- Authentication system (cookie-based sessions)
- Workout tracking functionality
  - Create and manage workouts by date
  - Exercise and set tracking
  - Workout completion and stats
- Rehabilitation exercise management
  - Create and track rehab exercises
  - Category-based organization
  - Side-specific exercise support
- Calendar view for workout history
- User statistics dashboard
- Import workouts from templates
- PostgreSQL database with Prisma ORM
- Responsive UI with Tailwind CSS
- Server-side rendering with Next.js App Router
- TanStack Query for client-side state management

### Security

- Password hashing with bcryptjs
- HTTP-only cookies for session management
- Middleware-based route protection
- Input validation on all API endpoints

## Release Types

- **Major version** (X.0.0): Breaking changes that require migration
- **Minor version** (0.X.0): New features, backwards compatible
- **Patch version** (0.0.X): Bug fixes, no new features

## Change Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
