@echo off
REM Starts the Django API (port 8000) and the Next.js app (port 3000) in two windows
start "Blush Planner - Django API" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000"
start "Blush Planner - Next.js" cmd /k "cd /d %~dp0frontend && npm run dev -- -H 0.0.0.0"
timeout /t 6 >nul
start http://localhost:3000
