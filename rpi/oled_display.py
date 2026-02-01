"""
OLED Display Module for RPi Sleep Tracker

Manages the SSD1306 OLED display to show:
- Current time with greeting
- Sleep tracking state
- Session information
"""
import logging
import threading
import time
from datetime import datetime
from typing import Optional

logger = logging.getLogger("oled_display")

# Try to import hardware libraries, fall back to mock if not available
try:
    import board
    import busio
    import adafruit_ssd1306
    from PIL import Image, ImageDraw, ImageFont
    OLED_AVAILABLE = True
except ImportError as e:
    logger.warning(f"OLED libraries not available: {e}. Running in mock mode.")
    OLED_AVAILABLE = False


class OLEDDisplay:
    """
    Manages the OLED display for sleep tracking status.
    Runs in a background thread to update the display without blocking.
    """
    
    # Display dimensions
    WIDTH = 128
    HEIGHT = 64
    
    def __init__(self):
        self.is_mock = not OLED_AVAILABLE
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()
        
        # Display state
        self._state_name = "IDLE"
        self._session_active = False
        self._session_duration = 0
        self._distance = 0.0
        self._movement_energy = 0.0
        
        if not self.is_mock:
            try:
                # Initialize I2C and OLED
                self._i2c = busio.I2C(board.SCL, board.SDA)
                self._oled = adafruit_ssd1306.SSD1306_I2C(self.WIDTH, self.HEIGHT, self._i2c)
                
                # Load fonts
                self._font_big = ImageFont.truetype(
                    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26
                )
                self._font_small = ImageFont.truetype(
                    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16
                )
                self._font_tiny = ImageFont.truetype(
                    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12
                )
                
                # Clear display
                self._oled.fill(0)
                self._oled.show()
                
                logger.info("OLED display initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize OLED: {e}")
                self.is_mock = True
        else:
            logger.info("OLED display running in mock mode")
    
    def start(self):
        """Start the display update thread."""
        if self._running:
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._update_loop, daemon=True)
        self._thread.start()
        logger.info("OLED display thread started")
    
    def stop(self):
        """Stop the display update thread."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=2.0)
            self._thread = None
        
        # Clear display on shutdown
        if not self.is_mock:
            try:
                self._oled.fill(0)
                self._oled.show()
            except Exception:
                pass
        
        logger.info("OLED display stopped")
    
    def update_state(self, state_name: str, session_active: bool = False,
                     session_start_ts: Optional[float] = None,
                     distance: float = 0.0, movement_energy: float = 0.0):
        """Update the display state (thread-safe)."""
        with self._lock:
            self._state_name = state_name
            self._session_active = session_active
            self._distance = distance
            self._movement_energy = movement_energy
            
            if session_start_ts and session_active:
                self._session_duration = time.time() - session_start_ts
            else:
                self._session_duration = 0
    
    def _update_loop(self):
        """Background thread that updates the display."""
        while self._running:
            try:
                self._render_frame()
                time.sleep(0.5)  # Update at 2 Hz
            except Exception as e:
                logger.error(f"OLED render error: {e}")
                time.sleep(1.0)
    
    def _render_frame(self):
        """Render a single frame to the display."""
        if self.is_mock:
            return
        
        with self._lock:
            state_name = self._state_name
            session_active = self._session_active
            session_duration = self._session_duration
            distance = self._distance
            movement_energy = self._movement_energy
        
        now = datetime.now()
        
        # Create image
        image = Image.new("1", (self.WIDTH, self.HEIGHT))
        draw = ImageDraw.Draw(image)
        
        # Blink colon based on even/odd second
        separator = ":" if now.second % 2 == 0 else " "
        time_str = now.strftime(f"%I{separator}%M")
        am_pm = now.strftime("%p")
        
        # Row 1: Time (large)
        draw.text((0, 0), time_str, font=self._font_big, fill=255)
        draw.text((85, 8), am_pm, font=self._font_small, fill=255)
        
        # Row 2: State indicator
        if session_active:
            # Show sleep session info
            hours = int(session_duration // 3600)
            minutes = int((session_duration % 3600) // 60)
            duration_str = f"Sleep: {hours}h {minutes:02d}m"
            draw.text((0, 32), duration_str, font=self._font_small, fill=255)
            
            # Row 3: Movement indicator
            movement_bar = self._get_movement_bar(movement_energy)
            draw.text((0, 50), f"Move: {movement_bar}", font=self._font_tiny, fill=255)
        else:
            # Show state and distance
            draw.text((0, 32), f"State: {state_name}", font=self._font_small, fill=255)
            draw.text((0, 50), f"Dist: {distance:.2f}m", font=self._font_tiny, fill=255)
        
        # Update display
        self._oled.image(image)
        self._oled.show()
    
    def _get_movement_bar(self, energy: float) -> str:
        """Convert movement energy to a visual bar."""
        # Normalize energy to 0-10 scale (adjust based on observed values)
        level = min(10, int(energy * 1000))
        filled = "█" * level
        empty = "░" * (10 - level)
        return filled + empty
    
    def show_message(self, line1: str, line2: str = "", line3: str = ""):
        """Display a custom message on the OLED."""
        if self.is_mock:
            logger.info(f"OLED Message: {line1} | {line2} | {line3}")
            return
        
        image = Image.new("1", (self.WIDTH, self.HEIGHT))
        draw = ImageDraw.Draw(image)
        
        draw.text((0, 0), line1, font=self._font_small, fill=255)
        if line2:
            draw.text((0, 22), line2, font=self._font_small, fill=255)
        if line3:
            draw.text((0, 44), line3, font=self._font_tiny, fill=255)
        
        self._oled.image(image)
        self._oled.show()


# Global singleton instance
oled_display = OLEDDisplay()
