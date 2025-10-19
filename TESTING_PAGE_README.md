# Testing Page Documentation

## Overview

The `/testing` page provides a comprehensive System Testing Dashboard for monitoring and debugging application activities in real-time.

## Features

### 1. Activity Feed

- Displays the 50 most recent activities from the database
- Auto-refreshes every 5 seconds
- Shows timestamp, category, operation, message, and status for each activity
- Clickable rows to expand and view detailed JSON data

### 2. Status Indicators

Activities are color-coded by status:

- **SUCCESS** (Green): Completed operations
- **ERROR** (Red): Failed operations
- **IN_PROGRESS** (Yellow): Ongoing operations

### 3. Category Filtering

Filter activities by category:

- **All**: Show all activities
- **PRICE_UPDATE**: Cryptocurrency price fetches and updates
- **PREDICTION**: AI predictions and market analysis
- **API_CALL**: External API requests and cache operations

### 4. Statistics Dashboard

At the bottom of the page, view:

- Count of activities by status
- Percentage breakdown of total activities
- Visual indicators for each status type

### 5. Relative Timestamps

All timestamps are displayed in human-readable relative format:

- "2 seconds ago"
- "5 minutes ago"
- "3 hours ago"
- "1 day ago"

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Database Migration

```bash
# For local development (SQLite)
npx prisma migrate dev --name add_activity_log

# For Turso (production)
npm run migrate:turso
```

### 3. Seed Sample Data (Optional)

```bash
npx tsx scripts/seed-activity-log.ts
```

## Usage

### Accessing the Page

Navigate to `/testing` in your browser:

```
http://localhost:3000/testing
```

### Logging Activities

Use the `logActivity` utility function to log activities from anywhere in your app:

```typescript
import { logActivity } from "@/lib/activity-logger";

// Log a successful price update
await logActivity({
  category: "PRICE_UPDATE",
  operation: "Bitcoin Price Fetch",
  message: "Successfully fetched BTC price: $68,234.12",
  status: "SUCCESS",
  details: {
    price: 68234.12,
    currency: "USD",
    source: "CoinGecko API",
  },
});

// Log an error
await logActivity({
  category: "API_CALL",
  operation: "External API Request",
  message: "Failed to fetch data - timeout",
  status: "ERROR",
  details: {
    error: "Request timeout after 5000ms",
    retryAttempt: 3,
  },
});

// Log in-progress operation
await logActivity({
  category: "PREDICTION",
  operation: "Market Analysis",
  message: "Analyzing market trends...",
  status: "IN_PROGRESS",
  details: {
    progress: 0.5,
    estimatedTimeRemaining: "30s",
  },
});
```

## API Endpoint

The testing page uses the following API endpoint:

**GET** `/api/get-activity-log`

Query Parameters:

- `category` (optional): Filter by category (PRICE_UPDATE, PREDICTION, API_CALL)
- `limit` (optional): Number of activities to fetch (default: 50, max: 200)

Example:

```
/api/get-activity-log?category=PRICE_UPDATE&limit=25
```

Response:

```json
{
  "activities": [
    {
      "id": "clxxx...",
      "timestamp": "2025-10-19T10:30:00.000Z",
      "category": "PRICE_UPDATE",
      "operation": "Bitcoin Price Fetch",
      "message": "Successfully fetched BTC price: $68,234.12",
      "status": "SUCCESS",
      "details": {
        "price": 68234.12,
        "currency": "USD"
      }
    }
  ]
}
```

## Database Schema

```prisma
model ActivityLog {
  id        String   @id @default(cuid())
  timestamp DateTime @default(now())
  category  String
  operation String
  message   String
  status    String
  details   Json?

  @@index([timestamp])
  @@index([category])
  @@index([status])
}
```

## Files Created

### Components

- `src/app/testing/page.tsx` - Main testing dashboard page
- `src/hooks/useActivityLog.ts` - React Query hook for fetching activities
- `src/providers/QueryProvider.tsx` - React Query client provider

### API Routes

- `src/app/api/get-activity-log/route.ts` - Activity log API endpoint

### Utilities

- `src/lib/activity-logger.ts` - Helper function for logging activities

### Database

- `prisma/schema.prisma` - Updated with ActivityLog model
- `prisma/migrations/20251019115100_add_activity_log/migration.sql` - Migration file
- `scripts/seed-activity-log.ts` - Seed script for sample data

## Troubleshooting

### Activities not showing up

1. Check that the migration has been applied: `npx prisma migrate dev`
2. Verify the API endpoint is working: `curl http://localhost:3000/api/get-activity-log`
3. Check browser console for errors

### Auto-refresh not working

The page uses React Query's `refetchInterval` set to 5000ms (5 seconds). If auto-refresh isn't working:

1. Check that the QueryProvider is properly wrapped around the app in `layout.tsx`
2. Verify React Query is installed: `npm list @tanstack/react-query`

### Database connection errors

If you see database connection errors:

1. Ensure environment variables are set (DATABASE_TURSO_DATABASE_URL, DATABASE_TURSO_AUTH_TOKEN)
2. Check that Prisma client is generated: `npx prisma generate`
3. Verify database schema is up to date: `npm run migrate:turso`

## Performance Considerations

- Activities are limited to 200 maximum per request to prevent performance issues
- The page auto-refreshes every 5 seconds - consider increasing this interval in production
- Activities are indexed by timestamp, category, and status for faster queries
- Consider implementing pagination for very large activity logs

## Future Enhancements

Potential improvements:

- [ ] Add date range filtering
- [ ] Export activities to CSV/JSON
- [ ] Real-time updates via WebSocket instead of polling
- [ ] Search functionality for messages and operations
- [ ] Activity log retention policy (auto-delete old entries)
- [ ] Charts and visualizations for activity trends
- [ ] Activity grouping by time periods (hourly, daily)
