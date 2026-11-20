@echo off
REM One-time setup for Blush Planner (run from the project folder)
echo === Setting up Django backend ===
cd backend
python -m venv venv
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
call deactivate
cd ..

echo === Installing Next.js frontend packages ===
cd frontend
call npm install
cd ..

echo.
echo Setup complete! Now run start.bat
pause
