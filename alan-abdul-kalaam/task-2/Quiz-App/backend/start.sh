#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Start the server in the background
node server.js &
SERVER_PID=$!

echo "🔧 Server started with PID: $SERVER_PID"

# Wait for server to be ready
echo "⏳ Waiting for server to initialize..."
sleep 10

# Check if server is still running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Server failed to start"
    exit 1
fi

echo "✅ Server is running and ready"

# Run database seeding
echo "🌱 Starting database seeding..."
node scripts/seedDatabase.js

if [ $? -eq 0 ]; then
    echo "✅ Database seeding completed successfully"
else
    echo "⚠️  Database seeding had issues, but continuing..."
fi

# Keep the server running in foreground
echo "🔄 Server now running in foreground (PID: $SERVER_PID)"
echo "📡 Ready to accept connections on port ${PORT:-10000}"

# Bring server to foreground and wait
wait $SERVER_PID
