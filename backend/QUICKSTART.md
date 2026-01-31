# Quick Start Guide

## For Developers

### 1. Install Dependencies
```bash
cd backend
pip install -r app/requirements.txt
```

### 2. Run the Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Access the API
- Main URL: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 4. Test the API
```bash
# Run the example script
python example_usage.py

# Or manually test
curl http://localhost:8000/health
curl http://localhost:8000/distance
```

## Quick API Usage

### Register a User
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "myuser",
    "email": "my@email.com",
    "password": "mypassword",
    "full_name": "My Name"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/users/login \
  -d "username=myuser&password=mypassword"
```
Save the `access_token` from the response.

### Use Authenticated Endpoints
```bash
# Replace YOUR_TOKEN with your actual token
export TOKEN="YOUR_TOKEN"

# Get profile
curl http://localhost:8000/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Start sleep session
curl -X POST http://localhost:8000/api/sleep/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Going to bed"}'

# End sleep session
curl -X POST http://localhost:8000/api/sleep/end \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quality_score": 85, "notes": "Great sleep!"}'

# Get analytics
curl http://localhost:8000/api/analytics/overview \
  -H "Authorization: Bearer $TOKEN"
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Main FastAPI application
│   ├── database.py          # Database configuration
│   ├── models.py            # Data models (SQLAlchemy + Pydantic)
│   ├── auth.py              # Authentication utilities
│   ├── hardware.py          # Sensor hardware integration
│   ├── oled.py              # OLED display (optional)
│   ├── routers/
│   │   ├── users.py         # User management endpoints
│   │   ├── sleep.py         # Sleep tracking endpoints
│   │   ├── dreams.py        # Dream log endpoints
│   │   ├── analytics.py     # Analytics endpoints
│   │   └── leaderboard.py   # Leaderboard endpoints
│   └── requirements.txt     # Python dependencies
├── README.md                # Main documentation
├── API_REFERENCE.md         # Complete API reference
├── IMPLEMENTATION_SUMMARY.md # Technical implementation details
├── QUICKSTART.md            # This file
└── example_usage.py         # Demo script

```

## Environment Variables

```bash
# Optional: Set custom database URL
export DATABASE_URL="sqlite:///./my_database.db"
# Or for PostgreSQL:
# export DATABASE_URL="postgresql://user:pass@localhost/dbname"

# Optional: Set custom secret key for JWT
export SECRET_KEY="your-super-secret-key-here"

# Optional: Set environment to production (requires SECRET_KEY)
export ENVIRONMENT="production"
```

## Common Tasks

### View Interactive Documentation
Open http://localhost:8000/docs in your browser - you can test all endpoints there!

### Reset the Database
```bash
rm recharge_royale.db  # Delete the database file
# Restart the server - database will be recreated
```

### Run in Mock Mode (No Hardware)
The application automatically runs in mock mode when hardware is not available. Perfect for development!

### Check Logs
The server outputs logs to stdout. Look for:
- `Running in MOCK mode` - No hardware detected
- `Hardware initialized` - Hardware successfully connected

## Troubleshooting

### Import Errors
Make sure you're in the `backend` directory and have installed all dependencies:
```bash
pip install -r app/requirements.txt
```

### Database Errors
Delete the database file and restart:
```bash
rm recharge_royale.db
```

### Port Already in Use
Change the port:
```bash
uvicorn app.main:app --port 8001
```

### GPIO Warnings
These are normal if you're not on a Raspberry Pi. The app runs in mock mode automatically.

## Next Steps

1. ✅ Start the server
2. ✅ Open http://localhost:8000/docs
3. ✅ Register a user
4. ✅ Try the endpoints
5. ✅ Run `python example_usage.py` to see a full demo

## Need More Info?

- **Setup & Usage**: See README.md
- **API Details**: See API_REFERENCE.md
- **Implementation**: See IMPLEMENTATION_SUMMARY.md
- **Questions**: Check the interactive docs at /docs
