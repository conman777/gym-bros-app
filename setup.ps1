# Setup script for Gym Bros App
$env:DATABASE_URL = "file:./prisma/dev.db"
Write-Host "Setting DATABASE_URL to $env:DATABASE_URL"

# Navigate to WSL directory
$wslPath = "\\wsl$\Ubuntu\home\conor\coding projects\gym-bros-app"
Set-Location $wslPath
Write-Host "Changed to directory: $wslPath"

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Generate Prisma client
Write-Host "Generating Prisma client..."
npx prisma generate

# Start the server
Write-Host "Starting development server..."
node server.js
