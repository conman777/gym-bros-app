#!/bin/bash
# ⚠️ DEPRECATED: This script is deprecated. Use the unified setup instead:
#    npm run setup
#
cd "/home/conor/coding projects/gym-bros-app"
export DATABASE_URL="file:./prisma/dev.db"
echo "Setting DATABASE_URL to $DATABASE_URL"

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Starting development server..."
node server.js
