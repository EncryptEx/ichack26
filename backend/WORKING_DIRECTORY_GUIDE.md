# Working Directory Guide

## Understanding the Directory Structure

```
ichack26/
└── backend/              ← YOU SHOULD BE HERE when running uvicorn
    ├── app/              ← NOT HERE!
    │   ├── __init__.py
    │   ├── main.py
    │   ├── models.py
    │   ├── database.py
    │   ├── auth.py
    │   ├── hardware.py
    │   ├── requirements.txt
    │   └── routers/
    │       ├── users.py
    │       ├── sleep.py
    │       ├── dreams.py
    │       ├── analytics.py
    │       └── leaderboard.py
    ├── README.md
    ├── QUICKSTART.md
    ├── example_usage.py
    └── verify_setup.py   ← Run this to check your setup!
```

## The Problem

When you see this error:
```
ModuleNotFoundError: No module named 'app'
```

It means you're in the **wrong directory**.

## Visual Guide

### ❌ WRONG: Running from inside app/

```bash
$ pwd
/home/admin/api/app          # ← You're INSIDE app/

$ ls
__init__.py  main.py  models.py  database.py  auth.py  hardware.py  requirements.txt  routers/

$ uvicorn app.main:app
# ERROR: ModuleNotFoundError: No module named 'app'
```

**Why it fails:** Python is looking for `app/app/main.py`, which doesn't exist!

---

### ✅ CORRECT: Running from backend/ directory

```bash
$ pwd
/home/admin/api              # ← You're in the parent directory

$ ls
app/  README.md  QUICKSTART.md  example_usage.py  verify_setup.py

$ uvicorn app.main:app
# SUCCESS: Server starts!
# INFO: Uvicorn running on http://0.0.0.0:8000
```

**Why it works:** Python can find the `app` package and import `app.main`.

## Quick Fixes

### If you're in the wrong directory:

```bash
# Check where you are
$ pwd
/home/admin/api/app          # ← Wrong!

# Go up one level
$ cd ..

# Verify
$ pwd
/home/admin/api              # ← Correct!

$ ls
app/  README.md  ...         # ← Should see 'app' directory
```

### Use the verification script:

```bash
# From the backend directory
$ python verify_setup.py

# It will tell you:
# ✅ You're in the correct directory (backend)
# OR
# ❌ You're inside the 'app' directory!
#    ⚠️  You need to go up one level to the 'backend' directory
#    Run: cd ..
```

## Understanding Python Imports

The application uses **relative imports** in `main.py`:

```python
from .hardware import sensor_manager, SLEEP_THRESHOLD_CM
from .models import DistanceResponse
from .database import init_db
from .routers import users, sleep, dreams, analytics, leaderboard
```

These imports (starting with `.`) require `app` to be a Python package. This only works when:

1. You're **outside** the `app` directory
2. You import using `app.main` (not just `main`)
3. Python can see `app/__init__.py`

## Command Reference

### ✅ Correct Commands

```bash
# From backend/ directory
cd /path/to/backend
uvicorn app.main:app --reload
python example_usage.py
python verify_setup.py
```

### ❌ Incorrect Commands

```bash
# From app/ directory (WRONG!)
cd /path/to/backend/app
uvicorn app.main:app          # Fails: ModuleNotFoundError
uvicorn main:app              # Fails: ImportError for relative imports
```

## Still Having Issues?

1. **Run the verification script:**
   ```bash
   cd /path/to/backend
   python verify_setup.py
   ```

2. **Check your current directory:**
   ```bash
   pwd                        # Should end with 'backend', not 'backend/app'
   ls                         # Should show 'app' directory
   ```

3. **Verify Python can import the app:**
   ```bash
   python -c "from app import main; print('Success!')"
   ```

4. **Check the README.md troubleshooting section** for more help.

## Summary

✅ **Always run uvicorn from the `backend` directory**
✅ **Use `python verify_setup.py` to check your setup**
✅ **If you see 'ModuleNotFoundError', you're in the wrong directory**
❌ **Never run uvicorn from inside the `app` directory**
