#!/bin/bash

# Development Server Restart Script
echo "🔄 Restarting development server..."

# Kill existing processes
echo "🔪 Killing existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes found on port 3000"

# Clean caches
echo "🗑️ Cleaning caches..."
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force

# Wait a moment
echo "⏳ Waiting for cleanup..."
sleep 2

# Start development server
echo "🚀 Starting development server..."
npm run dev
