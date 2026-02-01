# API Reference Guide

## Base URL
```
http://localhost:8000
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-access-token>
```

## Endpoints

### Hardware Endpoints

#### GET /health
Get the health status of the API.

**Response:**
```json
{
  "status": "online",
  "mode": "MOCK" or "HARDWARE"
}
```

#### GET /distance
Get current distance reading from the ultrasonic sensor.

**Response:**
```json
{
  "distance_cm": 45.2,
  "is_laying_down": true,
  "status": "Person Detected"
}
```

---

### User Management

#### POST /api/users/register
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

**Response (201):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "created_at": "2026-01-31T20:00:00"
}
```

#### POST /api/users/login
Login with username and password.

**Request Body (form-data):**
```
username=john_doe
password=securepassword
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### GET /api/users/me
Get current user's profile. Requires authentication.

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "created_at": "2026-01-31T20:00:00"
}
```

#### PUT /api/users/me
Update current user's profile. Requires authentication.

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "full_name": "John Updated Doe",
  "password": "newpassword"
}
```
*All fields are optional*

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "newemail@example.com",
  "full_name": "John Updated Doe",
  "created_at": "2026-01-31T20:00:00"
}
```

---

### Sleep Tracking

#### POST /api/sleep/start
Start a new sleep session. Requires authentication.

**Request Body:**
```json
{
  "notes": "Going to bed early tonight"
}
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "start_time": "2026-01-31T22:00:00",
  "end_time": null,
  "duration_minutes": null,
  "quality_score": null,
  "notes": "Going to bed early tonight"
}
```

#### POST /api/sleep/end
End the current active sleep session. Requires authentication.

**Request Body:**
```json
{
  "quality_score": 85.5,
  "notes": "Had a great night's sleep!"
}
```
*All fields are optional*

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "start_time": "2026-01-31T22:00:00",
  "end_time": "2026-02-01T06:30:00",
  "duration_minutes": 510.0,
  "quality_score": 85.5,
  "notes": "Had a great night's sleep!"
}
```

#### GET /api/sleep/sessions
Get all sleep sessions for the current user. Requires authentication.

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100)

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "start_time": "2026-01-31T22:00:00",
    "end_time": "2026-02-01T06:30:00",
    "duration_minutes": 510.0,
    "quality_score": 85.5,
    "notes": "Had a great night's sleep!"
  }
]
```

#### GET /api/sleep/current
Get the current active sleep session if one exists. Requires authentication.

**Response (200):**
```json
{
  "id": 2,
  "user_id": 1,
  "start_time": "2026-02-01T22:00:00",
  "end_time": null,
  "duration_minutes": null,
  "quality_score": null,
  "notes": "Another night"
}
```

#### GET /api/sleep/latest/summary
Get the full summary of the latest completed sleep session. Requires authentication.

**Response (200):**
```json
{
  "session_id": "abc123-uuid",
  "user_id": 1,
  "start_time": "2026-01-31T22:00:00",
  "end_time": "2026-02-01T06:30:00",
  "sleep_onset_time": "2026-01-31T22:15:00",
  "hours_slept": 8.5,
  "sleep_quality": 85,
  "points_earned": 95,
  "points_delta_vs_yesterday": 10,
  "rank_change": 1,
  "current_rank": 3,
  "awakenings_count": 2,
  "restless_minutes": 15.0,
  "still_minutes": 480.0,
  "out_of_bed_minutes": 5.0,
  "stages": {
    "deep_minutes": 90.0,
    "rem_minutes": 120.0,
    "core_minutes": 300.0,
    "disclaimer": "Estimated based on movement patterns only"
  },
  "intervals": [
    {
      "start": "2026-01-31T22:15:00",
      "end": "2026-02-01T01:00:00",
      "state": "sleeping"
    },
    {
      "start": "2026-02-01T01:00:00",
      "end": "2026-02-01T01:05:00",
      "state": "awake"
    }
  ]
}
```

#### GET /api/sleep/sessions/{session_uuid}/summary
Get the full summary of a specific sleep session. Requires authentication.

**Path Parameters:**
- `session_uuid`: The unique identifier of the sleep session

**Response (200):** Same format as `/api/sleep/latest/summary`

#### GET /api/sleep/day/{day_date}
Get all sleep data for a specific day. Requires authentication.

**Path Parameters:**
- `day_date`: Date in YYYY-MM-DD format (e.g., `2026-02-01`)

**Response (200):**
```json
{
  "date": "2026-02-01",
  "sessions": [
    {
      "session_id": "abc123-uuid",
      "user_id": 1,
      "start_time": "2026-01-31T22:00:00",
      "end_time": "2026-02-01T06:30:00",
      "hours_slept": 8.5,
      "sleep_quality": 85,
      "points_earned": 95,
      "awakenings_count": 2,
      "restless_minutes": 15.0,
      "still_minutes": 480.0,
      "out_of_bed_minutes": 5.0,
      "stages": { ... },
      "intervals": [ ... ]
    }
  ],
  "total_hours_slept": 8.5,
  "total_points_earned": 95,
  "average_quality": 85,
  "total_awakenings": 2,
  "points_delta_vs_yesterday": 10,
  "current_rank": 3
}
```

#### GET /api/sleep/days
Get sleep data for a date range. Useful for calendar views. Requires authentication.

**Query Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format (max 31 days range)

**Example:** `GET /api/sleep/days?start_date=2026-01-25&end_date=2026-02-01`

**Response (200):**
```json
[
  {
    "date": "2026-01-25",
    "sessions": [...],
    "total_hours_slept": 7.5,
    "total_points_earned": 80,
    "average_quality": 75,
    "total_awakenings": 1,
    "points_delta_vs_yesterday": -5,
    "current_rank": 4
  },
  {
    "date": "2026-01-26",
    "sessions": [...],
    ...
  }
]
```

---

### Dream Log

#### POST /api/dreams/
Create a new dream log entry. Requires authentication.

**Request Body:**
```json
{
  "title": "Flying Dream",
  "content": "I was flying over mountains and valleys. The view was breathtaking.",
  "mood": "happy"
}
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "date": "2026-02-01T07:00:00",
  "title": "Flying Dream",
  "content": "I was flying over mountains and valleys. The view was breathtaking.",
  "mood": "happy"
}
```

#### GET /api/dreams/
Get all dream log entries for the current user. Requires authentication.

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100)

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "date": "2026-02-01T07:00:00",
    "title": "Flying Dream",
    "content": "I was flying over mountains and valleys.",
    "mood": "happy"
  }
]
```

#### GET /api/dreams/feed
Get dreams from all users (social feed). Requires authentication.
Returns dreams with username information. Shows "You" for the current user's dreams.

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 50)

**Response (200):**
```json
[
  {
    "id": 3,
    "user_id": 2,
    "date": "2026-02-01T08:00:00",
    "title": "Ocean Dream",
    "content": "I was swimming in a crystal clear ocean.",
    "mood": "peaceful",
    "username": "jane_doe"
  },
  {
    "id": 1,
    "user_id": 1,
    "date": "2026-02-01T07:00:00",
    "title": "Flying Dream",
    "content": "I was flying over mountains and valleys.",
    "mood": "happy",
    "username": "You"
  }
]
```

#### GET /api/dreams/day/{day_date}
Get all dream entries for a specific day. Requires authentication.

**Path Parameters:**
- `day_date`: Date in YYYY-MM-DD format (e.g., `2026-02-01`)

**Response (200):**
```json
{
  "date": "2026-02-01",
  "dreams": [
    {
      "id": 1,
      "user_id": 1,
      "date": "2026-02-01T07:00:00",
      "title": "Flying Dream",
      "content": "I was flying over mountains and valleys.",
      "mood": "happy"
    }
  ],
  "total_entries": 1
}
```

#### GET /api/dreams/days
Get dream entries for a date range. Requires authentication.

**Query Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format (max 31 days range)

**Example:** `GET /api/dreams/days?start_date=2026-01-25&end_date=2026-02-01`

**Response (200):**
```json
[
  {
    "date": "2026-01-25",
    "dreams": [...],
    "total_entries": 2
  },
  {
    "date": "2026-01-26",
    "dreams": [...],
    "total_entries": 1
  }
]
```

#### GET /api/dreams/{dream_id}
Get a specific dream log entry. Requires authentication.

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "date": "2026-02-01T07:00:00",
  "title": "Flying Dream",
  "content": "I was flying over mountains and valleys.",
  "mood": "happy"
}
```

#### PUT /api/dreams/{dream_id}
Update a dream log entry. Requires authentication.

**Request Body:**
```json
{
  "title": "Updated Flying Dream",
  "content": "Updated content",
  "mood": "excited"
}
```
*All fields are optional*

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "date": "2026-02-01T07:00:00",
  "title": "Updated Flying Dream",
  "content": "Updated content",
  "mood": "excited"
}
```

#### DELETE /api/dreams/{dream_id}
Delete a dream log entry. Requires authentication.

**Response (204):** No content

---

### Analytics

#### GET /api/analytics/overview
Get overall sleep statistics. Requires authentication.

**Response (200):**
```json
{
  "total_sleep_hours": 42.5,
  "average_sleep_duration": 510.0,
  "total_sessions": 5,
  "average_quality_score": 85.2,
  "best_sleep_duration": 540.0,
  "worst_sleep_duration": 420.0
}
```

#### GET /api/analytics/trends
Get sleep trends over time. Requires authentication.

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 30)

**Response (200):**
```json
{
  "trends": [
    {
      "date": "2026-01-31",
      "duration_minutes": 510.0,
      "quality_score": 85.5
    },
    {
      "date": "2026-02-01",
      "duration_minutes": 480.0,
      "quality_score": 82.0
    }
  ]
}
```

#### GET /api/analytics/quality
Get detailed sleep quality metrics. Requires authentication.

**Response (200):**
```json
{
  "average_quality": 85.2,
  "quality_distribution": {
    "poor (0-20)": 0,
    "fair (21-40)": 0,
    "average (41-60)": 1,
    "good (61-80)": 2,
    "excellent (81-100)": 2
  },
  "recent_quality_trend": [
    {
      "date": "2026-01-31",
      "quality_score": 85.5
    }
  ]
}
```

---

### Leaderboard

#### GET /api/leaderboard/sleep-hours
Get leaderboard ranked by total sleep hours. Requires authentication.

**Query Parameters:**
- `limit` (optional): Maximum number of entries to return (default: 10)

**Response (200):**
```json
{
  "entries": [
    {
      "rank": 1,
      "username": "sleepyhead",
      "value": 200.5,
      "label": "200.5h"
    },
    {
      "rank": 2,
      "username": "john_doe",
      "value": 150.2,
      "label": "150.2h"
    }
  ],
  "user_rank": 2,
  "user_value": 150.2
}
```

#### GET /api/leaderboard/consistency
Get leaderboard ranked by sleep consistency. Requires authentication.

**Query Parameters:**
- `limit` (optional): Maximum number of entries to return (default: 10)
- `days` (optional): Number of days to consider (default: 30)

**Response (200):**
```json
{
  "entries": [
    {
      "rank": 1,
      "username": "consistent_sleeper",
      "value": 28.0,
      "label": "28 sessions"
    }
  ],
  "user_rank": 1,
  "user_value": 28.0
}
```

#### GET /api/leaderboard/quality
Get leaderboard ranked by average sleep quality. Requires authentication.

**Query Parameters:**
- `limit` (optional): Maximum number of entries to return (default: 10)

**Response (200):**
```json
{
  "entries": [
    {
      "rank": 1,
      "username": "quality_sleeper",
      "value": 92.5,
      "label": "92.5/100"
    }
  ],
  "user_rank": 1,
  "user_value": 92.5
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Username already registered"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Dream entry not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## Common Mood Values

For dream log entries, suggested mood values:
- `happy`
- `sad`
- `neutral`
- `scary`
- `excited`
- `anxious`
- `peaceful`
- `confused`

You can use any custom mood value as well.

---

## Interactive Documentation

Visit `/docs` for interactive Swagger UI documentation where you can test all endpoints directly in your browser.
