# Recharge Royale - RPi Sleep Tracker

This is the Raspberry Pi client for the Recharge Royale sleep tracking system.

## Hardware Requirements

- Raspberry Pi 3 (or compatible)
- HC-SR04 or JSN-SR04T Ultrasonic Distance Sensor
- Jumper wires
- ⚠️ Voltage divider (2kΩ + 1kΩ resistors) for the ECHO pin

## Wiring Diagram

```
Sensor      Raspberry Pi
──────      ────────────
VCC    →    5V (Pin 2)
GND    →    GND (Pin 6)
TRIG   →    GPIO 23 (Pin 16)
ECHO   →    GPIO 24 (Pin 18) via voltage divider!
```

### ECHO Pin Voltage Divider (IMPORTANT!)

The HC-SR04 ECHO pin outputs 5V, but Raspberry Pi GPIO is 3.3V tolerant.
You MUST use a voltage divider to avoid damaging the Pi:

```
ECHO ──┬── 1kΩ ──┬── GPIO 24
       │         │
       └─ 2kΩ ───┴── GND
```

## Software Setup

### 1. Clone and Navigate
```bash
cd /home/pi/recharge-royale/rpi
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure
```bash
cp .env.example .env
nano .env
```

Edit the following:
- `BACKEND_URL`: Your backend server URL (e.g., `http://192.168.1.100:8000`)
- `USER_ID`: Your user ID from the backend
- `DEVICE_TOKEN`: (Optional) Device authentication token

### 4. Run
```bash
python main.py
```

### 5. Run as a Service (Optional)

Create a systemd service for auto-start:

```bash
sudo nano /etc/systemd/system/recharge-royale.service
```

```ini
[Unit]
Description=Recharge Royale Sleep Tracker
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/recharge-royale/rpi
ExecStart=/home/pi/recharge-royale/rpi/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable recharge-royale
sudo systemctl start recharge-royale
```

## How It Works

### State Machine

```
┌─────────┐    person detected    ┌─────────────┐
│  IDLE   │ ──────────────────► │ CALIBRATING │
└─────────┘    (15s debounce)    └─────────────┘
     ▲                                  │
     │                                  │ 2 min calibration
     │                                  ▼
     │                           ┌─────────┐
     │                           │ IN_BED  │ ◄─── Tracking sleep
     │                           └─────────┘
     │                                  │
     │         person left              │
     │         (2 min debounce)         ▼
     │                           ┌─────────┐
     └─────────────────────────── │ ENDING  │
                                 └─────────┘
```

### Data Flow

1. **Sensor**: Samples distance at 10 Hz
2. **Filtering**: Median filter + EMA smoothing
3. **Movement Detection**: Delta-based movement signal
4. **Window Aggregation**: 30-second summaries
5. **Backend Sync**: Batched HTTP POST every ~5 minutes

### Window States

| State | Description |
|-------|-------------|
| `still` | < 5% of samples showed movement |
| `moving` | 5-25% of samples showed movement |
| `awake` | > 25% of samples showed movement |
| `out_of_bed` | Distance exceeded threshold |

## Configuration Reference

See [config.py](config.py) for all tunable parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `SAMPLE_RATE_HZ` | 10 | Sensor polling frequency |
| `WINDOW_DURATION_SECONDS` | 30 | Aggregation window size |
| `IN_BED_THRESHOLD_M` | 1.0 | Distance below which = in bed |
| `OUT_OF_BED_THRESHOLD_M` | 1.2 | Distance above which = out of bed (hysteresis) |
| `IN_BED_DEBOUNCE_SECONDS` | 15 | Time before session starts |
| `OUT_OF_BED_DEBOUNCE_SECONDS` | 120 | Time before session ends |
| `CALIBRATION_DURATION_SECONDS` | 120 | Noise floor calibration time |

## Troubleshooting

### Mock Mode
If running on a non-Pi machine, the sensor falls back to **mock mode** and generates simulated distance values for testing.

### No Backend Connection
Windows are buffered locally (up to 1000) and will be uploaded when the backend becomes available.

### Log Files
Logs are written to `/var/log/recharge-royale.log` and stdout.

## API Endpoints (RPi → Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rpi/sessions/start` | Notify session start |
| POST | `/api/rpi/sessions/windows` | Upload window batch |
| POST | `/api/rpi/sessions/end` | Notify session end |
| POST | `/api/rpi/heartbeat` | Device health ping |
