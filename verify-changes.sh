#!/bin/bash
# Script to verify our changes

echo "Rebuilding the project..."
npm run build

echo "Starting the development server in the background..."
npm run dev &
SERVER_PID=$!

echo "Development server started with PID: $SERVER_PID"
echo "Please open http://localhost:3000 in your browser"
echo "Press Enter when you have verified the changes, or Ctrl+C to exit"
read

echo "Stopping the development server..."
kill $SERVER_PID

echo "Verification complete"