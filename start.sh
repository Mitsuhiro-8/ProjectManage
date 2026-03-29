#!/bin/bash
echo "Starting ProjectManage..."
echo "  Backend  -> http://localhost:5000"
echo "  Frontend -> http://localhost:5173"
echo ""

cd "$(dirname "$0")/backend" && dotnet run &
BACKEND_PID=$!

cd "$(dirname "$0")/frontend" && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
