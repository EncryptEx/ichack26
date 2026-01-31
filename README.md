# Recharge Royale - Smart Pillow API

## Hardware Setup
- **Board**: Raspberry Pi 3 (or compatible)
- **Sensor**: HC-SR04 Ultrasonic Distance Sensor
- **Wiring**:
  - **VCC** -> 5V
  - **GND** -> GND
  - **TRIG** -> GPIO 16
  - **ECHO** -> GPIO 18 (Use a voltage divider 5V -> 3.3V to protect the Pi!)

## Software Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Server**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Usage**
   - API will be available at `http://<your-pi-ip>:8000`
   - Interactive Docs: `http://<your-pi-ip>:8000/docs`
   - Get Distance: `GET /distance`

## Configuration
Edit `app/hardware.py` to change PIN numbers or the detection threshold.
