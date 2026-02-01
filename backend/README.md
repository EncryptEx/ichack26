# Recharge Royale - Smart Pillow API

A comprehensive FastAPI backend for tracking sleep schedules, managing dream logs, viewing analytics, and competing on leaderboards.

## Hardware Setup
- **Board**: Raspberry Pi 3 (or compatible)
- **Sensor**: HC-SR04 Ultrasonic Distance Sensor
- **Wiring**:
  - **VCC** -> 5V
  - **GND** -> GND
  - **TRIG** -> GPIO 16
  - **ECHO** -> GPIO 18 (Use a voltage divider 5V -> 3.3V to protect the Pi!)

## Software Setup

### 1. Navigate to the Backend Directory
**IMPORTANT**: Make sure you're in the `backend` directory (the parent of the `app` directory), not inside `app/`.

```bash
cd /path/to/ichack26/backend
# You should see the 'app' directory when you run: ls
```

**Verify your setup:** Run the verification script to check everything is configured correctly:
```bash
python verify_setup.py
```
This script will check your working directory, Python version, dependencies, and application structure.

### 2. Install Dependencies
```bash
pip install -r app/requirements.txt
```

### 3. Run the Server
**From the `backend` directory**, run:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Access the API
- API will be available at `http://<your-pi-ip>:8000`
- Interactive Docs: `http://<your-pi-ip>:8000/docs`

## API Endpoints

### Hardware Endpoints
- `GET /distance` - Get current distance from ultrasonic sensor
- `GET /health` - Check API health status

### User Management (`/api/users`)
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get access token
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Sleep Tracking (`/api/sleep`)
- `POST /api/sleep/start` - Start a new sleep session
- `POST /api/sleep/end` - End the current sleep session
- `GET /api/sleep/sessions` - Get all sleep sessions
- `GET /api/sleep/current` - Get current active session
- `GET /api/sleep/latest/summary` - Get full summary of latest completed session
- `GET /api/sleep/sessions/{session_uuid}/summary` - Get summary of specific session
- `GET /api/sleep/day/{day_date}` - Get all sleep data for a specific day (YYYY-MM-DD)
- `GET /api/sleep/days?start_date=&end_date=` - Get sleep data for a date range

### Dream Log (`/api/dreams`)
- `POST /api/dreams/` - Create a new dream entry
- `GET /api/dreams/` - Get all dream entries for current user
- `GET /api/dreams/feed` - Get all users' dreams (social feed)
- `GET /api/dreams/{id}` - Get a specific dream entry
- `PUT /api/dreams/{id}` - Update a dream entry
- `DELETE /api/dreams/{id}` - Delete a dream entry
- `GET /api/dreams/day/{day_date}` - Get dreams for a specific day (YYYY-MM-DD)
- `GET /api/dreams/days?start_date=&end_date=` - Get dreams for a date range

### Analytics (`/api/analytics`)
- `GET /api/analytics/overview` - Get sleep statistics overview
- `GET /api/analytics/trends` - Get sleep trends over time
- `GET /api/analytics/quality` - Get sleep quality metrics

### Leaderboard (`/api/leaderboard`)
- `GET /api/leaderboard/sleep-hours` - Leaderboard by total sleep hours
- `GET /api/leaderboard/consistency` - Leaderboard by sleep consistency
- `GET /api/leaderboard/quality` - Leaderboard by sleep quality score

## Authentication

Most endpoints require authentication using JWT tokens. To use protected endpoints:

1. Register a user: `POST /api/users/register`
2. Login: `POST /api/users/login` (returns access token)
3. Include the token in the Authorization header: `Authorization: Bearer <token>`

## Example Usage

### Register a User
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword",
    "full_name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/users/login \
  -d "username=john_doe&password=securepassword"
```

### Start Sleep Session
```bash
curl -X POST http://localhost:8000/api/sleep/start \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Going to bed"}'
```

### End Sleep Session
```bash
curl -X POST http://localhost:8000/api/sleep/end \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"quality_score": 85.5, "notes": "Slept well!"}'
```

### Get Sleep Data for a Specific Day
```bash
curl http://localhost:8000/api/sleep/day/2026-02-01 \
  -H "Authorization: Bearer <your-token>"
```

### Get Sleep Data for a Date Range
```bash
curl "http://localhost:8000/api/sleep/days?start_date=2026-01-25&end_date=2026-02-01" \
  -H "Authorization: Bearer <your-token>"
```

### Create Dream Entry
```bash
curl -X POST http://localhost:8000/api/dreams/ \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Flying Dream",
    "content": "I was flying over mountains",
    "mood": "happy"
  }'
```

### Get Dreams Feed (All Users)
```bash
curl http://localhost:8000/api/dreams/feed \
  -H "Authorization: Bearer <your-token>"
```

### Get Dreams for a Specific Day
```bash
curl http://localhost:8000/api/dreams/day/2026-02-01 \
  -H "Authorization: Bearer <your-token>"
```

### Get Analytics
```bash
curl http://localhost:8000/api/analytics/overview \
  -H "Authorization: Bearer <your-token>"
```

### View Leaderboard
```bash
curl http://localhost:8000/api/leaderboard/sleep-hours \
  -H "Authorization: Bearer <your-token>"
```

## Configuration

### Environment Variables
- `DATABASE_URL` - Database connection URL (default: `sqlite:///./recharge_royale.db`)
- `SECRET_KEY` - JWT secret key (change this in production!)

### Hardware Configuration
Edit `app/hardware.py` to change:
- PIN numbers (TRIGGER_PIN, ECHO_PIN)
- Detection threshold (SLEEP_THRESHOLD_CM)

## Database

The application uses SQLAlchemy with SQLite by default. The database is automatically created on first run. To use a different database (e.g., PostgreSQL), set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://user:password@localhost/recharge_royale"
```

## Development

### Running in Mock Mode
The application automatically runs in mock mode when GPIO hardware is not available, generating random sensor values for testing.

### Testing
Run the included test script:
```bash
python /tmp/test_api.py
```

## Features

### Sleep Tracking
- Automatically track sleep sessions with start/end times
- Record sleep quality scores
- Add notes to your sleep sessions
- View sleep history

### Dream Journal
- Log your dreams with titles and detailed content
- Tag dreams with moods (happy, sad, scary, etc.)
- Edit and delete dream entries
- Browse your dream history

### Analytics
- Total sleep hours and average duration
- Sleep quality trends over time
- Best and worst sleep sessions
- Quality score distribution

### Leaderboards
- Compete with other users on total sleep hours
- Consistency rankings (most regular sleep schedule)
- Quality rankings (highest average sleep quality)
- See your own rank and stats

## Troubleshooting

### ModuleNotFoundError: No module named 'app'

**Problem**: When running `uvicorn app.main:app`, you get an error like:
```
ModuleNotFoundError: No module named 'app'
```

**Solution**: This error occurs when you're running the command from inside the `app` directory. You need to run it from the `backend` directory (the parent of `app`).

```bash
# ❌ Wrong - inside app directory
cd /path/to/backend/app
uvicorn app.main:app --reload  # This will fail!

# ✅ Correct - in backend directory
cd /path/to/backend
uvicorn app.main:app --reload  # This works!
```

**Why?** The application uses relative imports (e.g., `from .hardware import ...`), which require the `app` directory to be a proper Python package. When you're already inside `app/`, Python can't find the package structure correctly.

### ImportError: attempted relative import with no known parent package

**Problem**: You get this error when trying to run the application.

**Solution**: Make sure you're running `uvicorn app.main:app` (not `uvicorn main:app`) from the `backend` directory.

### Dependencies Not Installed

**Problem**: You get `ModuleNotFoundError: No module named 'fastapi'` or similar errors.

**Solution**: Install the dependencies:
```bash
cd /path/to/backend
pip install -r app/requirements.txt
```

### Port Already in Use

**Problem**: Error message about port 8000 already being in use.

**Solution**: Either:
1. Stop the other process using port 8000
2. Use a different port:
   ```bash
   uvicorn app.main:app --port 8001 --reload
   ```

### GPIO Warnings

**Problem**: You see warnings about GPIO pins not being available.

**Solution**: This is normal when not running on a Raspberry Pi. The application automatically runs in mock mode for testing. These warnings can be safely ignored during development.

## License

MIT License
