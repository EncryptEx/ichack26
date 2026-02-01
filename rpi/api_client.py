"""
HTTP Client for Backend API Communication

Handles:
- Session start/end notifications
- Window data batching and upload
- Offline buffering and retry logic
- Heartbeat pings
"""
import logging
import time
import json
from typing import Optional, List
from dataclasses import asdict
from collections import deque
from threading import Lock

import requests

import config
from state_machine import SleepWindow, SessionData

logger = logging.getLogger("api_client")


class BackendClient:
    """
    Manages communication with the backend API.
    Handles batching, retries, and offline buffering.
    """
    
    def __init__(self):
        self.base_url = config.BACKEND_URL.rstrip("/")
        self.device_token = config.DEVICE_TOKEN
        self.user_id = config.USER_ID
        
        # Pending windows to send
        self._window_buffer: deque = deque(maxlen=config.MAX_BUFFERED_WINDOWS)
        self._buffer_lock = Lock()
        
        # Session state
        self._current_session_id: Optional[str] = None
        self._last_heartbeat: float = 0
        
        # Connection state
        self._is_online = True
        self._retry_count = 0
    
    def _get_headers(self) -> dict:
        """Get request headers with auth token."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if self.device_token:
            headers["Authorization"] = f"Bearer {self.device_token}"
        return headers
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[dict] = None,
        retry: bool = True
    ) -> Optional[dict]:
        """Make HTTP request with retry logic."""
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(config.MAX_RETRY_ATTEMPTS if retry else 1):
            try:
                if method == "POST":
                    response = requests.post(
                        url,
                        json=data,
                        headers=self._get_headers(),
                        timeout=config.REQUEST_TIMEOUT_SECONDS
                    )
                elif method == "GET":
                    response = requests.get(
                        url,
                        headers=self._get_headers(),
                        timeout=config.REQUEST_TIMEOUT_SECONDS
                    )
                else:
                    raise ValueError(f"Unsupported method: {method}")
                
                response.raise_for_status()
                self._is_online = True
                self._retry_count = 0
                
                return response.json() if response.text else {}
                
            except requests.exceptions.ConnectionError as e:
                logger.warning(f"Connection error (attempt {attempt + 1}): {e}")
                self._is_online = False
                self._retry_count += 1
                
            except requests.exceptions.Timeout as e:
                logger.warning(f"Request timeout (attempt {attempt + 1}): {e}")
                
            except requests.exceptions.HTTPError as e:
                logger.error(f"HTTP error: {e}")
                if response.status_code >= 500:
                    # Server error, retry
                    pass
                else:
                    # Client error, don't retry
                    return None
            
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
            
            if attempt < config.MAX_RETRY_ATTEMPTS - 1:
                time.sleep(config.RETRY_DELAY_SECONDS)
        
        return None
    
    def start_session(self, session: SessionData) -> bool:
        """
        Notify backend that a new sleep session has started.
        """
        self._current_session_id = session.session_id
        
        payload = {
            "session_id": session.session_id,
            "user_id": session.user_id,
            "start_ts": session.start_ts,
            "baseline_distance": session.baseline_distance
        }
        
        result = self._make_request("POST", "/api/rpi/sessions/start", payload)
        
        if result is not None:
            logger.info(f"Session start reported: {session.session_id}")
            return True
        else:
            logger.warning("Failed to report session start, will retry on next window batch")
            return False
    
    def end_session(self, session: SessionData, end_ts: float) -> bool:
        """
        Notify backend that the sleep session has ended.
        """
        # First, flush any remaining windows
        self.flush_windows()
        
        payload = {
            "session_id": session.session_id,
            "end_ts": end_ts
        }
        
        result = self._make_request("POST", "/api/rpi/sessions/end", payload)
        
        if result is not None:
            logger.info(f"Session end reported: {session.session_id}")
            self._current_session_id = None
            return True
        else:
            logger.warning("Failed to report session end")
            return False
    
    def add_window(self, window: SleepWindow):
        """
        Add a window to the buffer. Automatically flushes when batch is full.
        """
        with self._buffer_lock:
            self._window_buffer.append(window)
            
            if len(self._window_buffer) >= config.WINDOW_BATCH_SIZE:
                self._flush_windows_internal()
    
    def flush_windows(self):
        """Force flush all buffered windows."""
        with self._buffer_lock:
            self._flush_windows_internal()
    
    def _flush_windows_internal(self):
        """Internal flush without lock (must hold lock when calling)."""
        if not self._window_buffer:
            return
        
        # Prepare batch payload
        windows_data = []
        for window in self._window_buffer:
            windows_data.append({
                "session_id": window.session_id,
                "ts_start": window.ts_start,
                "ts_end": window.ts_end,
                "avg_distance": window.avg_distance,
                "movement_energy": window.movement_energy,
                "active_ratio": window.active_ratio,
                "state": window.state,
                "sample_count": window.sample_count
            })
        
        payload = {"windows": windows_data}
        
        result = self._make_request("POST", "/api/rpi/sessions/windows", payload)
        
        if result is not None:
            logger.info(f"Flushed {len(windows_data)} windows to backend")
            self._window_buffer.clear()
        else:
            logger.warning(f"Failed to flush windows, keeping {len(windows_data)} in buffer")
    
    def send_heartbeat(self) -> bool:
        """
        Send heartbeat to backend. Called periodically.
        """
        now = time.time()
        if now - self._last_heartbeat < config.HEARTBEAT_INTERVAL_SECONDS:
            return True
        
        payload = {
            "user_id": self.user_id,
            "session_id": self._current_session_id,
            "timestamp": now,
            "is_online": self._is_online,
            "buffer_size": len(self._window_buffer)
        }
        
        result = self._make_request("POST", "/api/rpi/heartbeat", payload, retry=False)
        
        if result is not None:
            self._last_heartbeat = now
            return True
        
        return False
    
    @property
    def is_online(self) -> bool:
        return self._is_online
    
    @property
    def buffer_size(self) -> int:
        return len(self._window_buffer)


# Singleton instance
api_client = BackendClient()
