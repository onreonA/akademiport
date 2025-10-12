#!/bin/bash

# Development Environment Cleanup Script
echo "🧹 Cleaning up development environment..."

# Kill processes on port 3000
echo "🔪 Killing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes found on port 3000"

# Clean Next.js cache
echo "🗑️ Cleaning Next.js cache..."
rm -rf .next

# Clean node modules cache
echo "🗑️ Cleaning node modules cache..."
rm -rf node_modules/.cache

# Clean npm cache
echo "🗑️ Cleaning npm cache..."
npm cache clean --force

# Clean TypeScript cache
echo "🗑️ Cleaning TypeScript cache..."
rm -rf .tsbuildinfo

# Clean ESLint cache
echo "🗑️ Cleaning ESLint cache..."
rm -rf .eslintcache

# Clean Prettier cache
echo "🗑️ Cleaning Prettier cache..."
rm -rf .prettiercache

echo "✅ Development environment cleaned!"
echo "🚀 You can now run 'npm run dev'"
