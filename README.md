## Inspiration

Modern health apps obsess over productivity and fitness, but sleep - one of the most important foundations of performance - is often treated passively. We wanted to flip that mindset.

Dormant was inspired by the idea that if we can gamify workouts and steps, we can also gamify rest. By turning sleep into a ranked, point-based experience, we aim to encourage healthier, more consistent sleep schedules - and make naps something to be proud of.

Welcome to ranked naps.

## What it does

Dormant is a hardware-software hybrid sleep platform that tracks sleep using a bedside sensor and turns it into a game.

It:

* Detects when a user goes to bed and wakes up

* Tracks movement during sleep to estimate rest quality

* Calculates a sleep score and awards points (up to 120 per night)

* Ranks users on a leaderboard based on consistency and quality

* Displays sleep sessions, movement intervals, and progress over time

We also explored voice-based dream logging, allowing users to record dreams by speaking instead of typing.

## How we built it

Dormant is built around three main components:

### Hardware:
A Raspberry Pi connected to an ultrasonic distance sensor placed near the bed to detect presence and movement. An OLED display provides real-time feedback and session status.

### Backend:
A server that manages sleep sessions, computes quality scores, aggregates statistics, and handles rankings and historical data. The Raspberry Pi acts as a client, sending structured sleep data to the backend.

### Frontend:
A user interface that displays sleep summaries, scores, trends, and leaderboard position.

We also experimented with:

* ElevenLabs Speech-to-Text to log dreams using voice input

* Claude for AI-assisted analysis and future intelligent insights

* Early data science techniques to analyze movement patterns and sleep consistency

## Challenges we ran into

Raspberry Pi ecosystem limitations:
Many libraries lack consistent support across Python versions and platforms, which led to significant setup and compatibility issues.

### Hardware reliability:
Ultrasonic sensors require careful wiring, voltage handling, and timing to work reliably with edge detection.

### Authentication & APIs:
Implementing OAuth flows, bearer tokens, and secure device authentication was more complex than expected, especially for a hybrid hardware system.

### AI integrations:
Real-time STT and AI services require careful orchestration and cost awareness, especially when combining multiple providers.

## Accomplishments that we’re proud of

- Building a fully functional hybrid system combining hardware, backend, and frontend

- Designing a movement-based sleep scoring system without wearables

- Creating a gamified sleep experience with rankings and progress tracking

- Implementing a clean device-to-backend architecture

- Successfully driving a complex Raspberry Pi setup to work under real constraints

## What we learned

- How OAuth bearer tokens work in real-world API integrations

- Why hostnames and network configuration are incredibly useful in distributed systems

- That Raspberry Pi development can be powerful but fragile, especially across Python versions and hardware libraries

- The importance of designing systems that degrade gracefully when hardware or services fail

- That sleep data is surprisingly nuanced, even when based only on movement

## What’s next for Dormant

- Properly integrating voice-based dream logging using ElevenLabs STT

- Using AI (Claude) to generate sleep insights, summaries, and coaching

- Improving sleep stage estimation with additional signals

- Expanding leaderboard mechanics and streaks

- Refining hardware design for easier setup and better reliability

- Preparing Dormant for multi-user and multi-device scenarios