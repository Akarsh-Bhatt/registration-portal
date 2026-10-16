@echo off
title UPES Club Registration Portal Launcher
echo ==========================================================
echo  Starting UPES Club Registration Portal (NEXUS CLUB)
echo  Backend: Python FastAPI + MongoDB Atlas (Port 8000)
echo  Frontend: React + Tailwind CSS (Port 5173)
echo ==========================================================

start "FastAPI Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo Services started!
echo Open your browser at: http://localhost:5173
pause
