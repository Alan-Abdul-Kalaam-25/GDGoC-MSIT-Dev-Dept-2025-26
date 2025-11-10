#!/bin/bash

# Start the server in the background
node server.js &
SERVER_PID=$!

# Wait for server to be ready (give it 5 seconds)
sleep 5

# Run database seeding
echo "🌱 Starting database seeding..."
node scripts/seedDatabase.js

# Bring server back to foreground
wait $SERVER_PID
