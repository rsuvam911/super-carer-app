#!/bin/sh
# Docker startup script for Super Carer App

set -e

echo "🚀 Starting Super Carer App..."
echo "Environment: ${NODE_ENV:-production}"
echo "API URL: ${NEXT_PUBLIC_API_BASE_URL}"
echo "Socket URL: ${NEXT_PUBLIC_SOCKET_URL}"

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_API_BASE_URL" ]; then
  echo "⚠️  Warning: NEXT_PUBLIC_API_BASE_URL is not set"
fi

if [ -z "$NEXT_PUBLIC_SOCKET_URL" ]; then
  echo "⚠️  Warning: NEXT_PUBLIC_SOCKET_URL is not set"
fi

# Wait for dependencies (if needed)
# Uncomment if you need to wait for other services
# echo "⏳ Waiting for dependencies..."
# sleep 5

echo "✅ Starting application..."
exec "$@"
