# 🌸 Blush Planner — Event Calendar

A pink-themed weekly planner and event calendar.

- **Frontend:** Next.js (App Router, React), in `frontend/`
- **Backend:** Python Django + Django REST Framework + JWT auth, in `backend/`
- **Database:** SQLite (created automatically)

## Features
- **Register / Login / Logout** (log in with username *or* email; JWT tokens refresh automatically)
- **Weekly Planner:** Monday to Sunday cards, each with
  - a checklist of tasks (tap the coloured dot to set priority: low / medium / high)
  - a **lined notebook space** for writing your to-dos, which saves automatically
  - that day's events, plus previous/next week navigation and a week progress bar
- **Dashboard:** greeting, stat cards (upcoming events, pending, completed and overdue tasks),
  a weekly progress ring and per-day bar chart, upcoming events and tasks, overdue tasks, and events by category
- **Calendar:** month view with coloured event labels; tap a day to see its events and tasks, double-click to add an event
- **Events:** create, edit and delete events, filter upcoming or past and by category, and search
- **Dark / Light mode** toggle (remembered per browser, and follows your system setting the first time)
- **Mobile friendly:** bottom tab bar, sticky day picker in the planner, and bottom-sheet forms

## Requirements
- Python 3.10+
- Node.js 20+ (`node -v`)

## Quick start (Windows)
1. Double-click **`setup.bat`** (only the first time)
2. Double-click **`start.bat`**; it opens http://localhost:3000

## Manual start
**Backend** (terminal 1):
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

**Frontend** (terminal 2):
```bash
cd frontend
npm install
npm run dev -- -H 0.0.0.0
```
Open **http://localhost:3000**, then create an account.

### Use it on your phone
Connect your phone to the same Wi-Fi as your PC, find your PC's IP address (`ipconfig`, e.g. `192.168.1.5`),
and open `http://192.168.1.5:3000` on the phone. The app talks to the API on the same host automatically.
(If Windows Firewall asks, allow Python and Node on private networks.)

### Admin panel (optional)
```bash
cd backend
venv\Scripts\activate
python manage.py createsuperuser
```
Then visit http://localhost:8000/admin

## API overview (`http://localhost:8000/api/`)
| Endpoint | Method | Description |
|---|---|---|
| `auth/register/` | POST | Create account, returns tokens |
| `auth/login/` | POST | Username/email + password, returns tokens |
| `auth/refresh/` | POST | Refresh access token |
| `auth/me/` | GET/PATCH | Current user |
| `events/?start=&end=` | CRUD | Events |
| `tasks/?start=&end=&completed=` | CRUD | Tasks |
| `notes/?start=&end=` | GET/POST | Daily notes (POST saves the note for that date) |
| `dashboard/` | GET | Dashboard stats |
