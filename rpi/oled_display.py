"""
OLED Display for RPi Sleep Tracker

Displays current time with greeting on the SSD1306 OLED.
Run as a standalone subprocess.
"""
import board
import busio
import adafruit_ssd1306
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
import time


font_big = ImageFont.truetype(
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    30   # ← FONT SIZE (try 18–32)
)

small_font = ImageFont.truetype(
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    20   # ← FONT SIZE (try 18–32)
)

gm_font = ImageFont.truetype(
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    14   # ← FONT SIZE (try 18–32)
)

i2c = busio.I2C(board.SCL, board.SDA)
oled = adafruit_ssd1306.SSD1306_I2C(128, 64, i2c)

oled.fill(0)
oled.show()

while True:
    # Get current time
    now = datetime.now()
    
    # Blink the colon based on even/odd second
    if now.second % 2 == 0:
        separator = ":"
    else:
        separator = " "
        
    current_time_str = now.strftime(f"%I{separator}%M")
    am_pm_str = now.strftime("%p")

    # Determine greeting based on hour
    hour = now.hour
    if 5 <= hour < 12:
        greeting = "GOOD MORNING"
    elif 12 <= hour < 17:
        greeting = "GOOD AFTERNOON"
    else:
        greeting = "GOOD EVENING"

    image = Image.new("1", (oled.width, oled.height))
    draw = ImageDraw.Draw(image)

    draw.text((0, 0), greeting, font=gm_font, fill=255)
    draw.text((0, 20), current_time_str, font=font_big, fill=255)
    draw.text((90, 28), am_pm_str, font=small_font, fill=255)

    oled.image(image)
    oled.show()
    
    # Sleep a bit to reduce CPU usage, but check often enough for 1s response
    time.sleep(0.1)
