#!/usr/bin/env python3
"""
Example usage script for Recharge Royale API.
This demonstrates a complete workflow of the API.
"""
import requests
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_section(title):
    """Print a section header."""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def main():
    print("Recharge Royale API - Example Usage")
    print("="*60)
    
    # Step 1: Check API health
    print_section("1. Checking API Health")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.json()}")
    
    # Step 2: Check distance sensor
    print_section("2. Checking Distance Sensor")
    response = requests.get(f"{BASE_URL}/distance")
    sensor_data = response.json()
    print(f"Distance: {sensor_data['distance_cm']}cm")
    print(f"Status: {sensor_data['status']}")
    print(f"Is laying down: {sensor_data['is_laying_down']}")
    
    # Step 3: Register a new user
    print_section("3. Registering a New User")
    username = f"demo_user_{int(time.time())}"
    user_data = {
        "username": username,
        "email": f"{username}@example.com",
        "password": "secure_password_123",
        "full_name": "Demo User"
    }
    response = requests.post(f"{BASE_URL}/api/users/register", json=user_data)
    user = response.json()
    print(f"✓ User created: {user['username']}")
    print(f"  Email: {user['email']}")
    print(f"  ID: {user['id']}")
    
    # Step 4: Login
    print_section("4. User Login")
    login_data = {
        "username": username,
        "password": "secure_password_123"
    }
    response = requests.post(f"{BASE_URL}/api/users/login", data=login_data)
    token_data = response.json()
    token = token_data["access_token"]
    print(f"✓ Login successful")
    print(f"  Token: {token[:20]}...")
    
    # Set up headers for authenticated requests
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 5: Get user profile
    print_section("5. Getting User Profile")
    response = requests.get(f"{BASE_URL}/api/users/me", headers=headers)
    profile = response.json()
    print(f"Username: {profile['username']}")
    print(f"Email: {profile['email']}")
    print(f"Full Name: {profile['full_name']}")
    
    # Step 6: Start a sleep session
    print_section("6. Starting Sleep Session")
    response = requests.post(
        f"{BASE_URL}/api/sleep/start",
        json={"notes": "Getting ready for bed"},
        headers=headers
    )
    session = response.json()
    print(f"✓ Sleep session started")
    print(f"  Session ID: {session['id']}")
    print(f"  Start time: {session['start_time']}")
    
    # Simulate some time passing
    print("\n  (Simulating sleep time...)")
    time.sleep(2)
    
    # Step 7: End the sleep session
    print_section("7. Ending Sleep Session")
    response = requests.post(
        f"{BASE_URL}/api/sleep/end",
        json={
            "quality_score": 87.5,
            "notes": "Had a great night's sleep!"
        },
        headers=headers
    )
    ended_session = response.json()
    print(f"✓ Sleep session ended")
    print(f"  Duration: {ended_session['duration_minutes']:.2f} minutes")
    print(f"  Quality Score: {ended_session['quality_score']}/100")
    
    # Step 8: Log a dream
    print_section("8. Creating Dream Entry")
    dream_data = {
        "title": "Flying Over Mountains",
        "content": "I was soaring high above snow-capped mountains with eagles. "
                   "The view was breathtaking, and I felt completely free.",
        "mood": "happy"
    }
    response = requests.post(
        f"{BASE_URL}/api/dreams/",
        json=dream_data,
        headers=headers
    )
    dream = response.json()
    print(f"✓ Dream entry created")
    print(f"  Title: {dream['title']}")
    print(f"  Mood: {dream['mood']}")
    print(f"  Dream ID: {dream['id']}")
    
    # Step 9: View all dreams
    print_section("9. Viewing All Dreams")
    response = requests.get(f"{BASE_URL}/api/dreams/", headers=headers)
    dreams = response.json()
    print(f"Total dreams logged: {len(dreams)}")
    for d in dreams:
        print(f"  • {d['title']} ({d['mood']}) - {d['date'][:10]}")
    
    # Step 10: Start another sleep session for more data
    print_section("10. Creating More Sleep Data")
    # Session 2
    response = requests.post(
        f"{BASE_URL}/api/sleep/start",
        json={"notes": "Second sleep session"},
        headers=headers
    )
    time.sleep(1)
    response = requests.post(
        f"{BASE_URL}/api/sleep/end",
        json={"quality_score": 92.0, "notes": "Even better sleep!"},
        headers=headers
    )
    print(f"✓ Created second sleep session")
    
    # Session 3
    response = requests.post(
        f"{BASE_URL}/api/sleep/start",
        json={"notes": "Third sleep session"},
        headers=headers
    )
    time.sleep(1)
    response = requests.post(
        f"{BASE_URL}/api/sleep/end",
        json={"quality_score": 78.5, "notes": "Decent sleep"},
        headers=headers
    )
    print(f"✓ Created third sleep session")
    
    # Step 11: View analytics overview
    print_section("11. Viewing Analytics Overview")
    response = requests.get(f"{BASE_URL}/api/analytics/overview", headers=headers)
    analytics = response.json()
    print(f"Total Sleep Hours: {analytics['total_sleep_hours']}")
    print(f"Average Sleep Duration: {analytics['average_sleep_duration']:.2f} minutes")
    print(f"Total Sessions: {analytics['total_sessions']}")
    print(f"Average Quality Score: {analytics['average_quality_score']}")
    
    # Step 12: View quality metrics
    print_section("12. Viewing Quality Metrics")
    response = requests.get(f"{BASE_URL}/api/analytics/quality", headers=headers)
    quality = response.json()
    print(f"Average Quality: {quality['average_quality']}/100")
    print("\nQuality Distribution:")
    for category, count in quality['quality_distribution'].items():
        print(f"  {category}: {count} sessions")
    
    # Step 13: View sleep sessions
    print_section("13. Viewing Sleep History")
    response = requests.get(f"{BASE_URL}/api/sleep/sessions", headers=headers)
    sessions = response.json()
    print(f"Total sessions: {len(sessions)}")
    for i, s in enumerate(sessions, 1):
        duration_hours = s['duration_minutes'] / 60 if s['duration_minutes'] else 0
        print(f"\n  Session {i}:")
        print(f"    Duration: {duration_hours:.2f} hours")
        print(f"    Quality: {s['quality_score']}/100")
        print(f"    Notes: {s['notes']}")
    
    # Step 14: View leaderboards
    print_section("14. Viewing Leaderboards")
    
    # Sleep hours leaderboard
    response = requests.get(f"{BASE_URL}/api/leaderboard/sleep-hours", headers=headers)
    leaderboard = response.json()
    print("\n🏆 Sleep Hours Leaderboard:")
    for entry in leaderboard['entries']:
        print(f"  {entry['rank']}. {entry['username']} - {entry['label']}")
    if leaderboard['user_rank']:
        print(f"\n  Your rank: #{leaderboard['user_rank']} with {leaderboard['user_value']:.2f} hours")
    
    # Quality leaderboard
    response = requests.get(f"{BASE_URL}/api/leaderboard/quality", headers=headers)
    leaderboard = response.json()
    print("\n🌟 Quality Leaderboard:")
    for entry in leaderboard['entries']:
        print(f"  {entry['rank']}. {entry['username']} - {entry['label']}")
    
    # Step 15: Update profile
    print_section("15. Updating User Profile")
    response = requests.put(
        f"{BASE_URL}/api/users/me",
        json={"full_name": "Demo User (Updated)"},
        headers=headers
    )
    updated_profile = response.json()
    print(f"✓ Profile updated")
    print(f"  New full name: {updated_profile['full_name']}")
    
    # Final summary
    print_section("Summary")
    print(f"✓ Created user: {username}")
    print(f"✓ Logged {len(sessions)} sleep sessions")
    print(f"✓ Total sleep time: {analytics['total_sleep_hours']:.2f} hours")
    print(f"✓ Logged {len(dreams)} dreams")
    print(f"✓ Average quality score: {analytics['average_quality_score']}/100")
    print("\n" + "="*60)
    print("Demo completed successfully!")
    print("="*60)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
